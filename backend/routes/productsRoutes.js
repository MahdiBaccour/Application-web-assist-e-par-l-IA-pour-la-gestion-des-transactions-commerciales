import { Router } from "express";
import pool from "../db.js";
const router = Router();

// 📌 CREATE a new product (initialize stock directly in products table)
router.post("/", async (req, res) => {
  const { name, description, price, category_id, supplier_id, status, created_at, created_by, initial_stock } = req.body;

  try {
    // Insert the new product directly into the products table
    const productResult = await pool.query(
      "INSERT INTO products (name, description, price, category_id, supplier_id, status, created_at, created_by, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [name, description, price, category_id, supplier_id, status || "active", created_at || new Date(), created_by, initial_stock || 0]
    );

    const newProduct = productResult.rows[0];

    res.status(201).json({ success: true, product: newProduct, message: "Product created with stock initialized." });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating product", error: error.message });
  }
});

// 📌 READ all products
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.status(200).json({ success: true, products: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
  }
});

// 📌 READ a specific product by ID with stock details
router.get("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT * 
      FROM products
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching product", error: error.message });
  }
});

// 📌 UPDATE a product
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Check if the product exists
    const existingProduct = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Generate dynamic query for updates
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields provided for update" });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    const query = `UPDATE products SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

    const result = await pool.query(query, [...values, id]);

    res.status(200).json({ success: true, product: result.rows[0], message: "Product updated successfully." });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating product", error: error.message });
  }
});

// 📌 Set product as inactive and update stock to 0 instead of deleting
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Start transaction
    await pool.query("BEGIN");

    // Set product status to inactive and update stock to 0
    const result = await pool.query("UPDATE products SET status = 'inactive', stock_quantity = 0 WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Commit transaction
    await pool.query("COMMIT");

    res.status(200).json({ success: true, message: "Product set to inactive and stock updated to 0." });

  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Error updating product status", error: error.message });
  }
});

export default router;

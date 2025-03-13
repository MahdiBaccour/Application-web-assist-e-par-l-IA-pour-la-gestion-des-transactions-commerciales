import { Router } from "express";
import pool from "../db.js";
const router = Router();

// 📌 READ all products with stock details
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name AS product_name, status, stock_quantity 
      FROM products
    `);
    
    res.status(200).json({ success: true, products: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching products with stock", error: error.message });
  }
});

// 📌 CREATE or UPDATE stock (stock_quantity) for a product
router.post("/:id/stock", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    // Check if product exists
    const productResult = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Update the stock quantity in the products table
    const updatedProduct = await pool.query(
      "UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2 RETURNING *",
      [quantity, id]
    );

    res.status(200).json({ success: true, product: updatedProduct.rows[0], message: "Stock updated successfully." });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating stock", error: error.message });
  }
});

// 📌 Decrease stock (for a sale or transaction)
router.put("/:id/stock/decrease", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    // Check if product exists and if stock is enough
    const productResult = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = productResult.rows[0];

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ success: false, message: "Insufficient stock" });
    }

    // Update the stock quantity in the products table by decreasing it
    const updatedProduct = await pool.query(
      "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 RETURNING *",
      [quantity, id]
    );

    res.status(200).json({ success: true, product: updatedProduct.rows[0], message: "Stock decreased successfully." });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error decreasing stock", error: error.message });
  }
});

// 📌 Increase stock (for a purchase or restock)
router.put("/:id/stock/increase", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    // Check if product exists
    const productResult = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Update the stock quantity in the products table by increasing it
    const updatedProduct = await pool.query(
      "UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2 RETURNING *",
      [quantity, id]
    );

    res.status(200).json({ success: true, product: updatedProduct.rows[0], message: "Stock increased successfully." });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error increasing stock", error: error.message });
  }
});

export default router;

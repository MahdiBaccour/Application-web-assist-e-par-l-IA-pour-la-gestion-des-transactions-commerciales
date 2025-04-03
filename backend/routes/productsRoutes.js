import { Router } from "express";
import pool from "../db.js";
const router = Router();
import middleware from "../middleware/auth.js"; // Import middleware
// 📌 CREATE a new product (initialize stock directly in products table)
router.post("/",middleware.auth, async (req, res,next) => {
   // Check if the user is  an owner
   if (req.user.role === "owner")  {
    return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
   }
  const { name, description, selling_price, category_id, supplier_id, status, created_at, created_by=7, stock_quantity } = req.body;

  try {
    // Insert the new product directly into the products table
    const productResult = await pool.query(
      "INSERT INTO products (name, description, selling_price, category_id, supplier_id, status, created_at, created_by, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [name, description, selling_price, category_id, supplier_id, status || "active", created_at || new Date(), created_by, stock_quantity || 0]
    );

    const newProduct = productResult.rows[0];

    res.status(201).json({ success: true, product: newProduct, message: "Product created with stock initialized." });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Error creating product", error: error.message });
  }
});


// 📌 READ all products with category name
router.get("/", middleware.auth,(req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
},async (req, res,) => {
 
  const { category_id, status } = req.query;
  let query = `
    SELECT p.*, c.name AS category_name, s.name AS supplier_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
  `;

  const params = [];
  const conditions = [];

  if (category_id) {
    conditions.push(`p.category_id = $${params.length + 1}`);
    params.push(category_id);
  }

  if (status && status !== "all") {
    conditions.push(`p.status = $${params.length + 1}`);
    params.push(status);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  try {
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, products: result.rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

// 📌 READ a specific product by ID with stock details
router.get("/:id",middleware.auth,(req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res,) => {
  
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT p.*, 
             c.name AS category_name, 
             s.name AS supplier_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = $1
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
router.put("/:id",middleware.auth,(req, res, next) => {
  // Check if the user is  or an owner
  if (req.user.role === "owner" )  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res,) => {
  
  const { id } = req.params;
  const {
    name,
    description,
    selling_price,
    category_id,
    supplier_id,
    status,
    stock_quantity,
    current_cost_price,
  } = req.body;

  try {
    // Fetch the existing product data
    const existingProduct = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Merge existing data with new updates
    const updatedProduct = {
      name: name ?? existingProduct.rows[0].name,
      description: description ?? existingProduct.rows[0].description,
      selling_price: selling_price ?? existingProduct.rows[0].selling_price,
      category_id: category_id ?? existingProduct.rows[0].category_id,
      supplier_id: supplier_id ?? existingProduct.rows[0].supplier_id,
      status: status ?? existingProduct.rows[0].status,
      stock_quantity: stock_quantity ?? existingProduct.rows[0].stock_quantity,
      current_cost_price: current_cost_price ?? existingProduct.rows[0].current_cost_price,
    };

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let index = 1;

    for (const key in updatedProduct) {
      if (req.body[key] !== undefined) {
        updateFields.push(`${key} = $${index}`);
        values.push(updatedProduct[key]);
        index++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided for update" });
    }

    values.push(id); // Add the product ID as the last parameter

    const query = `UPDATE products SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`;

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, message: "Product updated successfully", product: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating product", error: error.message });
  }
});

// 📌 Update product status (active/inactive) and update stock if necessary
router.patch("/:id/status",middleware.auth,(req, res, next) => {
  // Check if the user is  an owner
  if (req.user.role === "owner")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
  
  const { id } = req.params;
  const { status_product } = req.body;

  try {
    await pool.query("BEGIN");

    let updateQuery = "UPDATE products SET status = $1 WHERE id = $2 RETURNING *";
    let updateParams = [status_product, id];
    const result = await pool.query(updateQuery, updateParams);

    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await pool.query("COMMIT");
    res.status(200).json({ success: true, message: `Product status updated to ${status_product}.` });

  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Error updating product status", error: error.message });
  }
});

export default router;

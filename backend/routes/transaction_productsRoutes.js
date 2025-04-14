import { Router } from "express";
const router =Router();
import pool from "../db.js";
import middleware from "../middleware/auth.js"; // Import middleware
// 📌 TRANSACTION PRODUCTS (CRUD)
// GET all transaction products
router.get("/products",middleware.auth,(req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
 
    try {
      const result = await pool.query("SELECT * FROM transaction_products");
      res.status(200).json({ success: true, transactionProducts: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching transaction products", error: error.message });
    }
  });
  
// 📌 READ transaction products with product details
router.get("/:id/products",middleware.auth,(req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res,) => {
  
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT tp.product_id, p.name AS product_name, tp.quantity, 
             tp.unit_price, p.selling_price, p.current_cost_price
      FROM transaction_products tp
      JOIN products p ON tp.product_id = p.id
      WHERE tp.transaction_id = $1
    `, [id]);

    res.status(200).json({ success: true, transactionProducts: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching transaction products", error: error.message });
  }
});

// 📌 Get All Historical Cost Prices for a Product with Dates
router.get("/:product_id/historical-costs",middleware.auth,(req, res, next) => {
  // Check if the user is  an owner
  if (req.user.role === "owner")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {

  const { product_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT tp.historical_cost_price, t.date 
       FROM transaction_products tp
       JOIN transactions t ON tp.transaction_id = t.id
       WHERE tp.product_id = $1 AND tp.historical_cost_price IS NOT NULL
       ORDER BY t.date DESC, t.id DESC,tp.historical_cost_price DESC`,
      [product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: true, message: "No historical cost prices found for this product" });
    }

    res.status(200).json({ success: true, historical_costs: result.rows });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching historical cost prices", error: error.message });
  }
});

export default router;
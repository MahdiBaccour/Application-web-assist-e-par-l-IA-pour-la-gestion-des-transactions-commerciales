import { Router } from "express";
import pool from "../../db.js";
const router = Router();
import middleware from "../../middleware/auth.js"; // Import middleware

// 📌 READ all transactions
router.get("/", middleware.auth, (req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
    const { type } = req.query; // Filter by debit/credit
    let query = `
      SELECT t.id, t.type, t.amount, t.date, t.description, t.reference_number, 
             t.remaining_balance, t.status, t.total_cost, t.client_id, t.supplier_id,
             c.name AS client_name, s.name AS supplier_name,pm.name AS payment_method_name
      FROM transactions t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN suppliers s ON t.supplier_id = s.id
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
    `;
    
    const params = [];
    if (type && type !== "all") {
      query += " WHERE t.type = $1";
      params.push(type);
    }
  
    try {
      const result = await pool.query(query, params);
      res.status(200).json({ success: true, transactions: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching transactions", error: error.message });
    }
  });

// 📌 READ active transactions by type with remaining balance
router.get("/active", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner" || req.user.role === "employee") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Unauthorized access",
  });
}, async (req, res) => {
  try {
    const { type } = req.query;
   

    if (!type || !['credit', 'debit'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid type parameter. Use 'credit' or 'debit'",
      });
    }

    const transactionType = type.toLowerCase();


    const query = "SELECT * FROM transactions WHERE type = $1 AND remaining_balance > $2";
   

    const result = await pool.query(query, [transactionType, 0]);

    res.status(200).json({
      success: true,
      count: result.rowCount,
      transactions: result.rows
    });

  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message
    });
  }
});
  
// 📌 READ a single transaction by ID
router.get("/:id", middleware.auth, async (req, res) => {
  // Check if the user is either an employee or an owner
  if (req.user.role !== "owner" && req.user.role !== "employee") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const { id } = req.params;
  try {
    const query = `
      SELECT t.*, pm.name AS payment_method_name
      FROM transactions t
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({ success: true, transaction: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching transaction", error: error.message });
  }
});
  export default router;
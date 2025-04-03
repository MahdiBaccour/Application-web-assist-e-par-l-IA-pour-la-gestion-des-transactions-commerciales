import { Router } from "express";
import pool from "../../db.js"; // Ensure the database connection is configured correctly
const router = Router();
import middleware from "../../middleware/auth.js"; // Import middleware

// GET /payments (List all payments with payment method name)
router.get("/", middleware.auth, async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "employee") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(`
      SELECT p.*, pm.name AS payment_method 
      FROM payments p
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
    `);

    res.status(200).json({ success: true, payments: result.rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving payments",
      error: error.message,
    });
  }
});

// GET /payments/:id (Get payment by ID with payment method name)
router.get("/:id", middleware.auth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "owner" && req.user.role !== "employee") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT p.*, pm.name AS payment_method 
       FROM payments p
       LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({ success: true, payment: result.rows[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving payment",
      error: error.message,
    });
  }
});

// GET /transactions/:id/remaining_balance (Check remaining balance)
router.get("/transactions/:id/remaining_balance", middleware.auth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "owner" && req.user.role !== "employee") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT t.amount, t.remaining_balance, pm.name AS payment_method
       FROM transactions t
       LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({
      success: true,
      total_amount: result.rows[0].amount,
      remaining_balance: result.rows[0].remaining_balance,
      payment_method: result.rows[0].payment_method,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving balance",
      error: error.message,
    });
  }
});

// GET /payments/:transaction_id (List payments for a specific transaction)
router.get("/transactions/:transaction_id", middleware.auth, async (req, res) => {
  const { transaction_id } = req.params;

  try {
    const query = `
      SELECT p.*, pm.name AS payment_method_name
      FROM payments p
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
      WHERE p.transaction_id = $1
    `;
    const result = await pool.query(query, [transaction_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No payments found for this transaction" });
    }

    res.status(200).json({ success: true, payments: result.rows });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: "Error fetching payments", error: error.message });
  }
});

// GET /clients/:id/unpaid (List unpaid transactions for a client)
router.get("/clients/:id/unpaid", middleware.auth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "owner" && req.user.role !== "employee") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT t.*, pm.name AS payment_method
       FROM transactions t
       LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
       WHERE t.client_id = $1 AND t.remaining_balance > 0`,
      [id]
    );

    res.status(200).json({ success: true, unpaid_transactions: result.rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving unpaid transactions",
      error: error.message,
    });
  }
});

// GET /suppliers/:id/unpaid (List unpaid transactions for a supplier)
router.get("/suppliers/:id/unpaid", middleware.auth, async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "owner" && req.user.role !== "employee") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT t.*, pm.name AS payment_method
       FROM transactions t
       LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
       WHERE t.supplier_id = $1 AND t.remaining_balance > 0`,
      [id]
    );

    res.status(200).json({ success: true, unpaid_transactions: result.rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving unpaid transactions",
      error: error.message,
    });
  }
});

export default router;
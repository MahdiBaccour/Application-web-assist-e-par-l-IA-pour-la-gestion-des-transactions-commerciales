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

    const { startDate, endDate } = req.query;

    /* ── build query ─────────────────────────────────────────── */
    let query = `
      SELECT
        p.*,
        pm.name               AS payment_method,
        t.reference_number    AS reference          -- ← add reference
      FROM payments p
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
      LEFT JOIN transactions    t  ON p.transaction_id   = t.id
    `;

    const params = [];
    if (startDate && endDate) {
      query += ` WHERE p.payment_date >= $1 AND p.payment_date <= $2`;
      params.push(startDate, endDate);
    }

    query += " ORDER BY p.payment_date DESC";

    /* ── run & return ────────────────────────────────────────── */
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, payments: result.rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving payments",
      error: error.message,
    });
  }
});

// GET /payments/clientOrSupplier (List payments by client or supplier with payment method name)
router.get("/client-or-supplier", middleware.auth, async (req, res) => {
  try {
    if (req.user.role !== "owner" && req.user.role !== "employee") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { startDate, endDate, client_id, supplier_id } = req.query;

    // Validate client/supplier exclusivity
    if (client_id && supplier_id) {
      return res.status(400).json({
        success: false,
        message: "Cannot filter by both client and supplier simultaneously"
      });
    }

    let query = `
      SELECT p.*, pm.name AS payment_method,
             t.client_id, t.supplier_id
      FROM payments p
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
      LEFT JOIN transactions t ON p.transaction_id = t.id
    `;

    const params = [];
    let conditions = [];
    let paramIndex = 1;

    // Client/Supplier filter
    if (client_id) {
      conditions.push(`t.client_id = $${paramIndex}`);
      params.push(client_id);
      paramIndex++;
    } else if (supplier_id) {
      conditions.push(`t.supplier_id = $${paramIndex}`);
      params.push(supplier_id);
      paramIndex++;
    }

    // Date filter
    if (startDate && endDate) {
      conditions.push(`p.payment_date >= $${paramIndex} AND p.payment_date <= $${paramIndex + 1}`);
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const result = await pool.query(query, params);
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
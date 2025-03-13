import { Router } from "express";
import pool from "../db.js"; // Ensure the database connection is configured correctly
const router = Router();

// POST /payments (Effectuer un paiement partiel)
router.post("/", async (req, res) => {
  const { transaction_id, amount_paid, payment_method_id } = req.body;

  try {
    await pool.query("BEGIN");

    // Get transaction details
    const transactionResult = await pool.query(
      "SELECT amount, remaining_balance FROM transactions WHERE id = $1",
      [transaction_id]
    );

    if (transactionResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    let { amount, remaining_balance } = transactionResult.rows[0];
    console.log(amount, remaining_balance);
    
    if (remaining_balance === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ success: false, message: "Transaction is already fully paid" });
    }

    if (amount_paid > remaining_balance) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ success: false, message: `Overpayment not allowed. Remaining balance is ${remaining_balance}` });
    }

    // Insert payment with payment_method_id
    await pool.query(
      "INSERT INTO payments (transaction_id, amount_paid, payment_method_id) VALUES ($1, $2, $3)",
      [transaction_id, amount_paid, payment_method_id]
    );

    await pool.query("COMMIT");
    res.status(201).json({ success: true, message: "Payment recorded successfully" });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Error processing payment", error: error.message });
  }
});

// GET /payments (List all payments)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payments");
    res.status(200).json({ success: true, payments: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving payments", error: error.message });
  }
});

// GET /payments/:id (Get payment by ID)
router.get("/payments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM payments WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }
    res.status(200).json({ success: true, payment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving payment", error: error.message });
  }
});

// GET /transactions/:id/remaining_balance (Check remaining balance)
router.get("/transactions/:id/remaining_balance", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT amount, remaining_balance FROM transactions WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({
      success: true,
      total_amount: result.rows[0].amount,
      remaining_balance: result.rows[0].remaining_balance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving balance", error: error.message });
  }
});

// GET /clients/:id/unpaid (List unpaid transactions for a client)
router.get("/clients/:id/unpaid", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE client_id = $1 AND remaining_balance > 0",
      [id]
    );

    res.status(200).json({ success: true, unpaid_transactions: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving unpaid transactions", error: error.message });
  }
});

// GET /suppliers/:id/unpaid (List unpaid transactions for a supplier)
router.get("/suppliers/:id/unpaid", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE supplier_id = $1 AND remaining_balance > 0",
      [id]
    );

    res.status(200).json({ success: true, unpaid_transactions: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving unpaid transactions", error: error.message });
  }
});

// DELETE /payments/:id (Delete payment by ID)
router.delete("/payments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if payment exists
    const paymentResult = await pool.query("SELECT * FROM payments WHERE id = $1", [id]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Delete payment
    await pool.query("DELETE FROM payments WHERE id = $1", [id]);

    res.status(200).json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ success: false, message: "Error deleting payment", error: error.message });
  }
});

export default router;

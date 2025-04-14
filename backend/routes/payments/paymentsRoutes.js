import { Router } from "express";
import pool from "../../db.js"; // Ensure the database connection is configured correctly
const router = Router();
import middleware from "../../middleware/auth.js"; // Import middleware
import { appendPaymentToCSV } from "../../../src/utils/generateCSV.js"; // Adjust path if needed

// POST /payments (Effectuer un paiement partiel)
router.post("/", middleware.auth, (req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee") {
    return next();
  }
}, async (req, res) => {
  const { transaction_id, amount_paid, payment_method_id, payment_date } = req.body;

  try {
    await pool.query("BEGIN");

    // Get transaction details
    const { rows: transactionResult } = await pool.query(
      "SELECT amount, remaining_balance FROM transactions WHERE id = $1",
      [transaction_id]
    );

    if (transactionResult.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    let remaining_balance = transactionResult[0].remaining_balance;

    if (remaining_balance === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ success: false, message: "Transaction is already fully paid" });
    }

    if (amount_paid > remaining_balance) {
      await pool.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: `Overpayment not allowed. Remaining balance is ${remaining_balance}`,
      });
    }

    // Use the provided payment_date if present, else use NOW()
    const insertQuery = `
      INSERT INTO payments (transaction_id, amount_paid, payment_date, payment_method_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const insertValues = [
      transaction_id,
      amount_paid,
      payment_date ? new Date(payment_date) : new Date(), // Fallback to current timestamp
      payment_method_id,
    ];

    const insertResult = await pool.query(insertQuery, insertValues);

    await pool.query("COMMIT");
    const newPayment = insertResult.rows[0];
    appendPaymentToCSV(newPayment);

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment: {
        id: newPayment.id,
        transaction_id: newPayment.transaction_id,
        amount_paid: newPayment.amount_paid,
        payment_date: newPayment.payment_date,
        payment_method_id: newPayment.payment_method_id,
      }
    });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Payment creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message
    });
  }
});

export default router;

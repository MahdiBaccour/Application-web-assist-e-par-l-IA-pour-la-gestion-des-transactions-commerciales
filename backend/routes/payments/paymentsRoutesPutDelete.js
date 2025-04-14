import { Router } from "express";
import pool from "../../db.js"; // Ensure the database connection is configured correctly
const router = Router();
import middleware from "../../middleware/auth.js"; // Import middleware
import { updatePaymentInCSV } from "../../../src/utils/generateCSV.js"; 
import { deletePaymentFromCSV } from "../../../src/utils/generateCSV.js"; // Adjust path if needed

// PUT /payments/:id (Update payment by ID)
router.patch("/:id", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner" || req.user.role === "employee") {
    return next();
  }
}, async (req, res) => {
  const paymentId = req.params.id;
  const { amount_paid, payment_method_id, payment_date } = req.body;

  try {
    await pool.query("BEGIN");

    // 1. Fetch existing payment
    const { rows: existingPaymentRows } = await pool.query(
      "SELECT * FROM payments WHERE id = $1",
      [paymentId]
    );

    if (existingPaymentRows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const existingPayment = existingPaymentRows[0];

    // 2. Fetch the related transaction
    const { rows: transactionRows } = await pool.query(
      "SELECT remaining_balance FROM transactions WHERE id = $1",
      [existingPayment.transaction_id]
    );

    if (transactionRows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Related transaction not found"
      });
    }

    const transaction = transactionRows[0];
    const maxAllowed = transaction.remaining_balance + existingPayment.amount_paid;

    if (amount_paid > maxAllowed) {
      await pool.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: `Overpayment not allowed. Max allowed: ${maxAllowed}`
      });
    }

    // 3. Build dynamic update query depending on whether payment_date is provided
    let updateQuery = `
      UPDATE payments 
      SET amount_paid = $1,
          payment_method_id = $2,
    `;
    const params = [amount_paid, payment_method_id];

    if (payment_date) {
      updateQuery += `payment_date = $3 `;
      params.push(payment_date);
    } else {
      updateQuery += `payment_date = NOW() `;
    }

    updateQuery += `WHERE id = $${params.length + 1} RETURNING *`;
    params.push(paymentId);

    // 4. Execute update
    const { rows: updatedRows } = await pool.query(updateQuery, params);
    updatePaymentInCSV({
      ...updatedRows[0],
      old_amount_paid: existingPayment.amount_paid
    });
    await pool.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedRows[0]
    });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message
    });
  }
});
// DELETE /payments/:id (Delete payment by ID)
router.delete("/:id",middleware.auth, (req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
   
    const { id } = req.params;
  
    try {
      // Check if payment exists
      const paymentResult = await pool.query(
        "SELECT * FROM payments WHERE id = $1",
        [id]
      );
  
      if (paymentResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });
      }
      deletePaymentFromCSV(paymentToDelete);
      // Delete payment
      await pool.query("DELETE FROM payments WHERE id = $1", [id]);
  
      res
        .status(200)
        .json({ success: true, message: "Payment deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error deleting payment",
          error: error.message,
        });
    }
  });
  export default router;
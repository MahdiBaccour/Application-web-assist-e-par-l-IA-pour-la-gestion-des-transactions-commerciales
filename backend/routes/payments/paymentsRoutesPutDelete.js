import { Router } from "express";
import pool from "../../db.js"; // Ensure the database connection is configured correctly
const router = Router();
import middleware from "../../middleware/auth.js"; // Import middleware

// DELETE /payments/:id (Delete payment by ID)
router.delete("/payments/:id",middleware.auth, (req, res, next) => {
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
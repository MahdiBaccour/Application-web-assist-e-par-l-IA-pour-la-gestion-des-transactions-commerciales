import { query } from "../db.js";
const router = express.Router();

// 📌 DUE DATE (CRUD)
// GET all due dates (from the transactions table)
router.get("/due-dates", async (req, res) => {
    try {
      const result = await query("SELECT id, due_date, status FROM transactions WHERE due_date IS NOT NULL");
      res.status(200).json({ success: true, dueDates: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching due dates", error: error.message });
    }
});

// DELETE due date (from transactions table)
router.delete("/due-dates/:id", async (req, res) => {
    const { id } = req.params;
    try {
      // Set due_date and status to null to effectively delete it
      await query("UPDATE transactions SET due_date = NULL, status = NULL WHERE id = $1", [id]);
      res.status(200).json({ success: true, message: "Due date deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error deleting due date", error: error.message });
    }
});

export default router;

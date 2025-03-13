import pool from "../db.js";
const router = express.Router();

// 📌 TRANSACTION PRODUCTS (CRUD)
// GET all transaction products
router.get("/products", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM transaction_products");
      res.status(200).json({ success: true, transactionProducts: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching transaction products", error: error.message });
    }
  });
  
  // 📌 GET all transaction products for a specific transaction
  router.get("/:id/products", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM transaction_products WHERE transaction_id = $1", [id]);
      res.status(200).json({ success: true, transactionProducts: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching transaction products", error: error.message });
    }
  });


  module.exports = router;
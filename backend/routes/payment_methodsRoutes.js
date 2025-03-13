import { Router } from "express";
import pool from "../db.js";
const router = Router();

// 📌 CREATE payment method
router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query("INSERT INTO payment_methods (name) VALUES ($1) RETURNING *", [name]);
    res.status(201).json({ success: true, method: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding payment method", error: error.message });
  }
});

// 📌 READ all payment methods
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payment_methods");
    res.status(200).json({ success: true, methods: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching payment methods", error: error.message });
  }
});

export default router;
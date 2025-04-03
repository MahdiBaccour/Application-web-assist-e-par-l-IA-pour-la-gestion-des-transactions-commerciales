import { Router } from "express";
import pool from "../db.js";
const router = Router();
import middleware from "../middleware/auth.js"; // Import middleware
// 📌 CREATE a new category
router.post("/",  middleware.auth, (req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query("INSERT INTO categories (name) VALUES ($1) RETURNING *", [name]);
    res.status(201).json({ success: true, category: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating category", error: error.message });
  }
});

// 📌 READ all categories
router.get("/",  middleware.auth, (req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories");
    res.status(200).json({ success: true, categories: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
  }
});

// 📌 UPDATE a category
router.put("/:id",  middleware.auth, (req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await pool.query("UPDATE categories SET name = $1 WHERE id = $2 RETURNING *", [name, id]);
    res.status(200).json({ success: true, category: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating category", error: error.message });
  }
});

// 📌 DELETE a category
router.delete("/:id",  middleware.auth, (req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
  }
});

export default router;
import { Router } from "express";
import pool from "../db.js";
import middleware from "../middleware/auth.js";

const router = Router();

// 📌 CREATE a new category
router.post("/", middleware.auth, (req, res, next) => {
  if (["owner", "employee"].includes(req.user.role)) return next();
}, async (req, res) => {
  const { name, status = "active" } = req.body;
  await pool.query("BEGIN");
  const currentUserId = req.user.id;
  await pool.query(`SET LOCAL myapp.current_user_id = '${currentUserId}'`);
  try {
    const result = await pool.query(
      "INSERT INTO categories (name, status) VALUES ($1, $2) RETURNING *",
      [name, status]
    );
    await pool.query("COMMIT");
    res.status(201).json({ success: true, category: result.rows[0] });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Error creating category", error: error.message });
  }
});

// 📌 READ all categories (with optional status filtering)
router.get("/", middleware.auth, (req, res, next) => {
  if (["owner", "employee"].includes(req.user.role)) return next();
}, async (req, res) => {
  const { status } = req.query;
  let query = "SELECT * FROM categories";
  const params = [];

  if (status && status !== "all") {
    query += " WHERE status = $1";
    params.push(status);
  }

  try {
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, categories: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
  }
});

// 📌 UPDATE a category (name and/or status)
router.put("/:id", middleware.auth, (req, res, next) => {
  if (["owner", "employee"].includes(req.user.role)) return next();
}, async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const updatedCategory = {
      name: name ?? existing.rows[0].name,
      status: status ?? existing.rows[0].status
    };
    await pool.query("BEGIN");
    const currentUserId = req.user.id;
    await pool.query(`SET LOCAL myapp.current_user_id = '${currentUserId}'`);
    const result = await pool.query(
      "UPDATE categories SET name = $1, status = $2 WHERE id = $3 RETURNING *",
      [updatedCategory.name, updatedCategory.status, id]
    );
    await pool.query("COMMIT");
    res.status(200).json({ success: true, category: result.rows[0] });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Error updating category", error: error.message });
  }
});

// 📌 PATCH only status
router.patch("/:id/status", middleware.auth, (req, res, next) => {
  if (["owner", "employee"].includes(req.user.role)) return next();
}, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Status is required" });
  }
  await pool.query("BEGIN");
  const currentUserId = req.user.id;
  await pool.query(`SET LOCAL myapp.current_user_id = '${currentUserId}'`);

  try {
    const result = await pool.query(
      "UPDATE categories SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    await pool.query("COMMIT");
    res.status(200).json({ success: true, category: result.rows[0] });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
});

// 📌 DELETE a category
router.delete("/:id", middleware.auth, (req, res, next) => {
  if (["owner", "employee"].includes(req.user.role)) return next();
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

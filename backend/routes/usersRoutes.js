// routes/usersRoutes.js

import { Router } from "express";
import pool from "../db.js";
const router = Router();
import middleware from "../middleware/auth.js";
import { genSalt, hash } from "bcryptjs";


// 📌 CREATE a new user (Only owner can create)
router.post("/", middleware.auth, async (req, res, next) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ success: false, message: "Accès refusé" });
  }

  const { username, email, password, role, image, verified_status } = req.body;

  try {
    // 🔍 Check if email already exists
    const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (emailCheck.rowCount > 0) {
      return res.status(409).json({ success: false, message: "Email déjà utilisé." });
    }

    // 🔍 Check if username already exists
    const usernameCheck = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (usernameCheck.rowCount > 0) {
      return res.status(409).json({ success: false, message: "Nom d'utilisateur déjà utilisé." });
    }

    // 🔒 Hash the password
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    // ✅ Insert user with hashed password
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role, image, verified_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [username, email, hashedPassword, role, image, verified_status]
    );

    res.status(201).json({ success: true, user: result.rows[0] });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la création de l'utilisateur", error: error.message });
  }
});

// 📌 READ all users (Only owner can view all)
router.get("/", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner") {
    return next();
  }
}, async (req, res) => {
  try {
  const result = await pool.query(
  "SELECT id, username, email, role, last_login, last_logout, image, verified_status FROM users ORDER BY id DESC");
    res.status(200).json({ success: true, users: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
  }
});

// 📌 READ a single user by ID (Owner or same user)
router.get("/:id", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner" || req.user.id == req.params.id) {
    return next();
  }
}, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT id, username, email, role, last_login, last_logout, image, verified_status FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user", error: error.message });
  }
});

// 📌 UPDATE a user (Owner or same user)
router.put("/:id", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner" || req.user.id == req.params.id) {
    return next();
  }
}, async (req, res) => {
  const { id } = req.params;
  const { username, email, password, image, verified_status } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updatedUser = {
      username: username ?? existing.rows[0].username,
      email: email ?? existing.rows[0].email,
      password: password ?? existing.rows[0].password,
      image: image ?? existing.rows[0].image,
      verified_status: verified_status ?? existing.rows[0].verified_status
    };

    const updateFields = [];
    const values = [];
    let index = 1;

    for (const key in updatedUser) {
      if (req.body[key] !== undefined) {
        updateFields.push(`${key} = $${index}`);
        values.push(updatedUser[key]);
        index++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);
    const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`;

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, message: "User updated successfully", user: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user", error: error.message });
  }
});

// 📌 DELETE a user (Only owner)
router.delete("/:id", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner") {
    return next();
  }
}, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user", error: error.message });
  }
});

export default router;

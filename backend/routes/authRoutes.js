import { Router } from "express";
const router = Router();
import { genSalt, hash, compare } from "bcrypt";
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg
import pool from "../db.js"; // Import the shared pool
import dotenv from "dotenv";
dotenv.config();

// Generate Access Token
const generateAccessToken = (user) => {
    let payload = { id: user.id, username: user.username, role: user.role };
  return sign(
    payload,
    process.env.TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    payload = { id: user.id, username: user.username, role: user.role };
  return sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, hashedPassword, role]
    );
   

   
    res.status(201).json({
      success: true,
      message: "User registered",
      user: newUser.rows[0], // This will return the entire user object, including the 'id' field
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error registering user", error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.rows[0]);
    const refreshToken = generateRefreshToken(user.rows[0]);

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.rows[0].id]);

    res.status(200).json({ success: true, accessToken, refreshToken, user: user.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging in", error: error.message });
  }
});

//logout
router.post("/logout", async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the authenticated token

    // Update last_logout timestamp
    await pool.query("UPDATE users SET last_logout = NOW() WHERE id = $1", [userId]);

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging out", error: error.message });
  }
});

// REFRESH TOKEN
router.post("/refreshToken", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: "Refresh token required" });
  }

  verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  });
});

export default router;
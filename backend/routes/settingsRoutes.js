import { Router } from "express";
import pool from "../db.js";
import { v2 as cloudinary } from "cloudinary"
import middleware from "../middleware/auth.js"; // Import middleware

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * @route PUT /api/user/profile
 * @desc Update user profile
 * @access Private
 */
router.put("/profile", middleware.auth, async (req, res) => {
  try {
    const { id } = req.user;
    const { email, image, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ success: false, message: "Email and username are required" });
    }

    if (email !== req.user.email) {
      const emailCheck = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
    }

    let imageUrl = image;
    if (image && image.startsWith("data:image")) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "projet-pfe/user-avatar",
        public_id: `user-${id}`,
        overwrite: true,
        allowed_formats: ["jpg", "jpeg", "png"],
        fetch_format: "auto",
        quality: "auto:good",
        width: 400
      });
      imageUrl = uploadResult.secure_url;
    }

    const result = await pool.query(
      `UPDATE users SET 
        username = $1, 
        email = $2, 
        image = $3 
      WHERE id = $4 
      RETURNING id, username, email, image, role`,
      [username, email, imageUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during profile update",
      error: error.message,
    });
  }
});

// GET: Retrieve User's Theme
router.get("/theme/:userId", middleware.auth, (req, res, next) => {
  if (req.user.id == req.params.userId || req.user.role === "owner") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
}, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query("SELECT theme FROM settings WHERE user_id = $1", [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Theme not found" });
    }

    res.status(200).json({ success: true, theme: result.rows[0].theme });
  } catch (error) {
    console.error("Error fetching theme:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT: Update User's Theme
router.put("/theme/:userId", middleware.auth, (req, res, next) => {
  if (req.user.id == req.params.userId || req.user.role === "owner") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
}, async (req, res) => {
  try {
    const { userId } = req.params;
    const { theme } = req.body;

    if (!["light", "dark", "cupcake", "abyss", "valentine", "night", "synthwave"].includes(theme)) {
      return res.status(400).json({ success: false, message: "Invalid theme value" });
    }

    const result = await pool.query(
      "UPDATE settings SET theme = $1 WHERE user_id = $2 RETURNING theme",
      [theme, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User settings not found" });
    }

    res.setHeader("Access-Control-Allow-Origin", process.env.Frontend_URL);
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.status(200).json({ success: true, message: "Theme updated successfully", theme: result.rows[0].theme });
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET: Retrieve User's Notifications
router.get('/notifications', middleware.auth, (req, res, next) => {
  if (req.user.role === "owner" || req.user.role === "employee" || req.user.role === "client" || req.user.role === "supplier") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
}, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const notificationsQuery = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY sent_date DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const countQuery = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1`,
      [req.user.id]
    );

    const total = parseInt(countQuery.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({ 
      success: true,
      notifications: notificationsQuery.rows,
      total,
      hasMore: page < totalPages
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching notifications" 
    });
  }
});


export default router;
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
    const { id } = req.user; // Get user ID from decoded token
    const { email, image, username } = req.body;

    // Validate required fields
    if (!email || !username) {
      return res.status(400).json({ success: false, message: "Email and username are required" });
    }

    // Check email uniqueness
    if (email !== req.user.email) {
      const emailCheck = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
    }

    // Handle image upload to Cloudinary (optimized quality)
    let imageUrl = image;
    if (image && image.startsWith("data:image")) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "projet-pfe/user-avatar",
        public_id: `user-${id}`,
        overwrite: true,
        allowed_formats: ["jpg", "jpeg", "png"],
        fetch_format: "auto", // ✅ Automatic format selection
        quality: "auto:good", // ✅ Optimized quality
        width: 400 // ✅ Resize for optimization
      });
      imageUrl = uploadResult.secure_url;
      console.log(imageUrl);
    }

    // Update user in database
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
    return res.status(500).json({
      success: false,
      message: "Server error during profile update",
      error: error.message,
    });
  }
});


// GET: Retrieve User's Theme
router.get("/theme/:userId",middleware.auth ,async (req, res) => {
  try {
    const {userId}= req.params; 
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
router.put("/theme/:userId",middleware.auth, async (req, res) => {
  try {
    const {userId} = req.params; 
    const { theme } = req.body;
    // Validate theme input
    if (!["light", "dark", "cupcake","abyss","valentine","night","synthwave"].includes(theme)) {
      return res.status(400).json({ success: false, message: "Invalid theme value" });
    }

    const result = await pool.query(
      "UPDATE settings SET theme = $1 WHERE user_id = $2 RETURNING theme",
      [theme, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User settings not found" });
    }
    res.setHeader("Access-Control-Allow-Origin", process.env.Frontend_URL); // Allow frontend origin
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.status(200).json({ success: true, message: "Theme updated successfully", theme: result.rows[0].theme });
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
export default router;
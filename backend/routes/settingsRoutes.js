import { Router } from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import { uploadImage } from "../utils/cloudinary.js"; // Updated import
import middleware from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const router = Router();

// ⏱️ Rate limit: 5 requests per minute per user
const profileLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each user to 5 requests per minute
  message: { success: false, message: "Trop de requêtes. Veuillez réessayer plus tard." },
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

router.put("/profile", middleware.auth, profileLimiter, async (req, res) => {
  try {
    const { id } = req.user;
    const {
      email,
      username,
      image,
      theme,
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    if (!email || !username) {
      return res.status(400).json({ 
        success: false, 
        message: "Email et nom d'utilisateur requis." 
      });
    }

    // Email uniqueness check
    if (email !== req.user.email) {
      const emailCheck = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Cet email est déjà utilisé." 
        });
      }
    }

    // Image validation
    if (image && image.length > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "L'image dépasse la taille maximale autorisée de 10 Mo.",
      });
    }

    // Image upload using shared utility
    let imageUrl = image;
    if (image && image.startsWith("data:image")) {
      try {
        imageUrl = await uploadImage(image, id);
      } catch (uploadError) {
        console.error("Erreur de téléchargement d'image:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Échec du téléchargement de l'image"
        });
      }
    }

    // Password change logic
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Tous les champs de mot de passe sont requis." 
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Les mots de passe ne correspondent pas." 
        });
      }

      const currentUser = await pool.query(
        "SELECT password FROM users WHERE id = $1", 
        [id]
      );
      const passwordMatch = await bcrypt.compare(
        currentPassword, 
        currentUser.rows[0].password
      );

      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          message: "Mot de passe actuel incorrect." 
        });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await pool.query(
        "UPDATE users SET password = $1 WHERE id = $2", 
        [hashedNewPassword, id]
      );
    }

    // Update user profile
    const updateUser = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, image = $3 
       WHERE id = $4 
       RETURNING id, username, email, image, role, verified_status AS status`,
      [username, email, imageUrl, id]
    );

    // Update theme if provided
    if (theme) {
      await pool.query(
        `UPDATE settings SET theme = $1 WHERE user_id = $2`,
        [theme, id]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès.",
      user: updateUser.rows[0],
    });

  } catch (error) {
    console.error("❌ Erreur de mise à jour du profil:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du profil.",
      error: error.message,
    });
  }
});

// 📌 Get current user profile based on token
router.get("/profile", middleware.auth, async (req, res) => {
  const userId = req.user.id; // Extracted from the token by middleware

  try {
    const result = await pool.query(`
      SELECT username, email, role, image, verified_status AS status
      FROM users
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
     
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }
    
    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Erreur de récupération du profil :", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération du profil.",
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
router.put("/theme/:userId", middleware.auth,profileLimiter, (req, res, next) => {
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
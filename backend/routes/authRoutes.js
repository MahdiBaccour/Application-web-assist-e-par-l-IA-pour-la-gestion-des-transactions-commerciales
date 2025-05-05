import { Router } from "express";
const router = Router();
import { genSalt, hash, compare } from "bcrypt";
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg
import pool from "../db.js"; // Import the shared pool
import middleware from "../middleware/auth.js"; // Import middleware
import dotenv from "dotenv";
import { uploadImage } from '../utils/cloudinary.js';
dotenv.config();

// Generate Access Token
const generateAccessToken = (user) => {
    let payload = { id: user.id, username: user.username, role: user.role };
  return sign(
    payload,
    process.env.TOKEN_SECRET,
    { expiresIn: "2h" }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  console.log("user:","id:",user.id,"username:",user.username,"role:",user.role);
    let payload = { id: user.id, username: user.username, role: user.role };
  return sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

// Middleware to authenticate token
router.get("/validate-token", middleware.auth, (req, res) => {
  return res.status(200).json({ success: true });
});

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, role, image } = req.body;
  
  try {
    // Validate required fields
    if (!username || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: "Tous les champs obligatoires doivent être remplis" 
      });
    }

    // Role-based email validation
    if (role === "client") {
      const clientCheck = await pool.query(
        "SELECT id FROM clients WHERE email = $1",
        [email]
      );
      if (clientCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Email non enregistré comme client"
        });
      }
    } 
    else if (role === "supplier") {
      const supplierCheck = await pool.query(
        "SELECT id FROM suppliers WHERE email = $1",
        [email]
      );
      if (supplierCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Email non enregistré comme fournisseur"
        });
      }
    }

    // Check existing user
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "L'utilisateur existe déjà"
      });
    }

    // Hash password
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    // Create user
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, image`,
      [username, email, hashedPassword, role]
    );

    // Handle image upload
    let imageUrl = null;
    if (image && image.startsWith("data:image")) {
      try {
        imageUrl = await uploadImage(image, newUser.rows[0].id);
        await pool.query(
          "UPDATE users SET image = $1 WHERE id = $2",
          [imageUrl, newUser.rows[0].id]
        );
        newUser.rows[0].image = imageUrl;
      } catch (uploadError) {
        console.error("Erreur de téléchargement d'image:", uploadError);
      }
    }

    res.status(201).json({
      success: true,
      message: "Utilisateur enregistré avec succès",
      user: newUser.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur d'enregistrement",
      error: error.message
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { identifier, password} = req.body;

  try {
    // Vérification de l'utilisateur
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $1", 
      [identifier]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Identifiants invalides - Utilisateur non trouvé" 
      });
    }

    // Vérification du mot de passe
    const isMatch = await compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Identifiants invalides - Mot de passe incorrect" 
      });
    }

     if (theme) {
      try {
        // Vérifier l'existence des paramètres
        const existingSettings = await pool.query(
          "SELECT user_id FROM settings WHERE user_id = $1",
          [user.rows[0].id]
        );

        if (existingSettings.rows.length > 0) {
          await pool.query(
            "UPDATE settings SET theme = $1 WHERE user_id = $2",
            [theme, user.rows[0].id]
          );
        } else {
          await pool.query(
            "INSERT INTO settings (user_id, theme) VALUES ($1, $2)",
            [user.rows[0].id, theme]
          );
        }
      } catch (updateError) {
        console.error("Erreur de mise à jour du thème:", updateError);
        return res.status(500).json({
          success: false,
          message: "Erreur de configuration du thème"
        });
      }
    }// Mise à jour du thème si fourni
   

    // Récupération des paramètres
    const settingsResult = await pool.query(
      `SELECT language, timezone, notification_enabled, theme 
       FROM settings WHERE user_id = $1`,
      [user.rows[0].id]
    );

    // Paramètres par défaut
    const defaultSettings = {
      language: "fr",
      timezone: "Europe/Paris",
      notification_enabled: true,
      theme: "dark"
    };

    const userSettings = settingsResult.rows[0] || defaultSettings;

    // Génération des tokens
    const accessToken = generateAccessToken(user.rows[0]);
    const refreshToken = generateRefreshToken(user.rows[0]);

    // Mise à jour de la dernière connexion
    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE id = $1", 
      [user.rows[0].id]
    );

    // Réponse
    res.status(200).json({
      success: true, 
      accessToken, 
      refreshToken, 
      id: user.rows[0].id,
      username: user.rows[0].username,
      email: user.rows[0].email,
      role: user.rows[0].role,
      image: user.rows[0].image,
      language: userSettings.language,
      timezone: userSettings.timezone,
      notification_enabled: userSettings.notification_enabled,
      theme: userSettings.theme    
      }
    );

  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur interne du serveur",
      error: error.message 
    });
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
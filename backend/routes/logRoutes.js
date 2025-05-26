import { Router } from "express";
const router = Router();
import pool from "../db.js";
import middleware from "../middleware/auth.js"; // Import middleware

// GET logs with optional role filter and limit
router.get("/", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner") return next();
  res.status(403).json({ success: false, message: "Accès non autorisé" });
}, async (req, res) => {
  const { role, limit = 10, page = 1 } = req.query;

  try {
    const params = [];
    let whereClause = "";
    
    if (role) {
      whereClause = "WHERE users.role = $1";
      params.push(role);
    }

    // Calcul de l'offset
    const offset = (Math.max(parseInt(page), 1) - 1) * parseInt(limit);
    const safeLimit = Math.min(parseInt(limit), 100);

    // Requête principale
    const query = `
      SELECT 
        logs.id,
        logs.log_data,
        users.username,
        users.role
      FROM logs
      JOIN users ON users.id = (logs.log_data->>'user_id')::int
      ${whereClause}
      ORDER BY logs.id DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    // Requête de comptage total
    const countQuery = `
      SELECT COUNT(*) 
      FROM logs
      JOIN users ON users.id = (logs.log_data->>'user_id')::int
      ${whereClause}
    `;

    const [result, countResult] = await Promise.all([
      pool.query(query, [...params, safeLimit, offset]),
      pool.query(countQuery, params)
    ]);

    res.status(200).json({
      success: true,
      count: parseInt(countResult.rows[0].count),
      totalPages: Math.ceil(countResult.rows[0].count / safeLimit),
      currentPage: parseInt(page),
      logs: result.rows
    });

  } catch (error) {
    console.error("Erreur récupération logs:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des logs.",
      error: error.message,
    });
  }
});

export default router;
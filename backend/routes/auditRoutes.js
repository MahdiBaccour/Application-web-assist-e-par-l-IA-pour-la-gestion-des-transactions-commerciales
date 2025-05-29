import { Router } from "express";
import pool from "../db.js";
const router = Router();
import middleware from "../middleware/auth.js"; // Import middleware

router.get("/", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner") return next();
  res.status(403).json({ success: false, message: "Accès non autorisé" });
}, async (req, res) => {
  const { user_id, table_name, action, start_date, end_date, limit = 50, page = 1 } = req.query;

  try {
    const params = [];
    let whereClauses = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (user_id) {
      whereClauses.push(`(audit_data->>'user_id')::int = $${paramIndex}`);
      params.push(user_id);
      paramIndex++;
    }

    if (table_name) {
      whereClauses.push(`audit_data->>'table_name' = $${paramIndex}`);
      params.push(table_name);
      paramIndex++;
    }

    if (action) {
      whereClauses.push(`audit_data->>'action' = $${paramIndex}`);
      params.push(action);
      paramIndex++;
    }

    if (start_date && end_date) {
      whereClauses.push(`(audit_data->>'timestamp')::timestamptz::date BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      params.push(start_date, end_date);
      paramIndex += 2;
    }

    const whereClause = whereClauses.length > 0 
      ? `WHERE ${whereClauses.join(' AND ')}` 
      : '';

    // Pagination
    const safeLimit = Math.min(parseInt(limit), 100);
    const offset = (Math.max(parseInt(page), 1) - 1) * safeLimit;

    // Main query
    const query = `
      SELECT 
        audit_trail.id,
        audit_trail.audit_data,
        users.username
      FROM audit_trail
      JOIN users ON users.id = (audit_data->>'user_id')::int
      ${whereClause}
      ORDER BY (audit_data->>'timestamp')::timestamptz DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(*) 
      FROM audit_trail
      JOIN users ON users.id = (audit_data->>'user_id')::int
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
      audits: result.rows.map(row => ({
        id: row.id,
        ...row.audit_data,
        username: row.username
      }))
    });

  } catch (error) {
    console.error("Erreur récupération audit trail:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'historique des modifications.",
      error: error.message,
    });
  }
});

export default router;
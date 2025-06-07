import { Router } from "express";
import pool from "../db.js";
const router = Router();
import middleware from "../middleware/auth.js";
import fetch from "node-fetch"; // ⬅️ Assure-toi d'avoir cette dépendance

router.post("/", middleware.auth, async (req, res) => {
  const { fullName, email, phone, subject, problem } = req.body;

  try {
    // ✅ Validation des champs requis
    const requiredFields = {
      email: "Email requis",
      subject: "Sujet requis",
      problem: "Description requise"
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message
        });
      }
    }

    // ✅ Construction du contenu HTML
    const emailContent = `
      <h2>Nouvelle demande de support</h2>
      <p><strong>Nom:</strong> ${fullName || 'Non fourni'}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Téléphone:</strong> ${phone || 'Non fourni'}</p>
      <h3>${subject}</h3>
      <div>${problem.replace(/\n/g, '<br>')}</div>
    `;

    // ✅ Appel direct à l'API MailerSend
    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAIL_API_KEY}`
      },
      body: JSON.stringify({
        from: {
          email: "no-reply-supplychainproMS_6vrpdL@test-zxk54v878kxljy6v.mlsender.net",
          name: "Support Technique"
        },
        to: [
          {
            email: process.env.ADMIN_EMAIL,
            name: "Administrateur"
          }
        ],
        subject: `[Support] ${subject}`,
        html: emailContent,
        text: problem
      })
    });
console.log(response) ;
  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.message || "Erreur MailerSend");
    }

    // ✅ Logging
    await pool.query(
      `INSERT INTO email_logs 
      (user_id, subject, status, sent_at) 
      VALUES ($1, $2, $3, NOW())`,
      [req.user.id, subject, "sent"]
    );

    res.status(200).json({
      success: true,
      message: "Message envoyé"
    });

  } catch (error) {
    // ⚠️ Logging en cas d'erreur
    await pool.query(
      `INSERT INTO email_logs 
      (user_id, subject, status, error, sent_at) 
      VALUES ($1, $2, $3, $4, NOW())`,
      [req.user.id, subject, "failed", error.message]
    );

    res.status(500).json({
      success: false,
      message: "Échec d'envoi",
      error:  error 
    });
  }
});

// API route pour /email-logs
router.get("/",middleware.auth, (req, res, next) => {
  if (req.user.role === "owner") return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, async (req, res) => {
  try {
    // Récupération des paramètres de requête
    const { 
      status, 
      email, 
      username, 
      start_date, 
      end_date,
      limit = 50,
      page = 1
    } = req.query;

    // Calcul offset pour pagination
    const offset = (page - 1) * limit;

    // Construction de la requête SQL
    let query = `
      SELECT 
        email_logs.*,
        users.username,
        users.email AS user_email
      FROM email_logs
      LEFT JOIN users ON email_logs.user_id = users.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filtres dynamiques
    if (status) {
      query += ` AND email_logs.status = $${paramCount++}`;
      params.push(status);
    }

    if (email) {
      query += ` AND users.email ILIKE $${paramCount++}`;
      params.push(`%${email}%`);
    }

    if (username) {
      query += ` AND users.username ILIKE $${paramCount++}`;
      params.push(`%${username}%`);
    }

    if (start_date) {
      query += ` AND email_logs.sent_at >= $${paramCount++}`;
      params.push(new Date(start_date));
    }

    if (end_date) {
      query += ` AND email_logs.sent_at <= $${paramCount++}`;
      params.push(new Date(end_date));
    }

    // Compte total pour pagination
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS total`;
    query += ` ORDER BY email_logs.sent_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), offset);

    // Exécution des requêtes
    const countResult = await pool.query(countQuery, params.slice(0, paramCount - 3));
    const result = await pool.query(query, params);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      logs: result.rows,
      count: totalCount,
      totalPages,
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error("Erreur récupération logs emails:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
});
export default router;

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

export default router;

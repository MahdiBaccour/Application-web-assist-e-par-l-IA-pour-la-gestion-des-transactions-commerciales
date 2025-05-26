// backend/routes/budgetRoutes.js
import { Router } from "express";
import pool from "../db.js";
import middleware from "../middleware/auth.js";


const router = Router();

// 📌 CREATE a new budget line (Only 'owner')
router.post("/", middleware.auth, async (req, res, next) => {
  if (req.user.role !== "owner") return next();

  const { budget, month_date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO total_budget (budget, month_date)
       VALUES ($1, $2) RETURNING *`,
      [budget, month_date]
    );


    res.status(201).json({
      success: true,
      message: "Budget ajouté avec succès.",
      budget: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur d'ajout du budget:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'ajout du budget.",
      error: error.message,
    });
  }
});

// 📌 GET all budget entries
router.get("/", middleware.auth, async (req, res,next) => {
  if (req.user.role !== "owner") return next();
  try {
    const result = await pool.query("SELECT * FROM total_budget ORDER BY month_date ASC");
    res.status(200).json({ success: true, budgets: result.rows });
  } catch (error) {
    console.error("Erreur de récupération des budgets:", error);
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
});

// 📌 UPDATE an existing budget entry
router.put("/:id", middleware.auth, async (req, res,next) => {
  if (req.user.role !== "owner") return next();

  const { id } = req.params;
  const { budget, month_date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE total_budget SET budget = $1, month_date = $2 WHERE id = $3 RETURNING *`,
      [budget, month_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Ligne de budget non trouvée." });
    }

    res.status(200).json({ success: true, message: "Budget mis à jour.", budget: result.rows[0] });
  } catch (error) {
    console.error("Erreur de mise à jour du budget:", error);
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
});

export default router;

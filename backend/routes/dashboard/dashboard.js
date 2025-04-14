// routes/performance.js
import { Router } from "express"
import pool from "../../db.js"
import middleware from "../../middleware/auth.js"

const router = Router();
router.get("/performance", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner") return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, async (req, res) => {
  try {
    const [budgetRows, salesRows, unitRows, marginRows] = await Promise.all([
      pool.query(`
        SELECT * FROM total_budget 
        WHERE month_date IN (
          DATE_TRUNC('month', CURRENT_DATE),
          DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        )
        ORDER BY month_date DESC
      `),

      pool.query(`
        SELECT 
          DATE_TRUNC('month', date) AS month,
          SUM(amount) AS total
        FROM transactions
        WHERE type = 'credit'
          AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        GROUP BY month
        ORDER BY month DESC
      `),

      pool.query(`
        SELECT 
          DATE_TRUNC('month', t.date) AS month,
          SUM(tp.quantity) AS total
        FROM transaction_products tp
        JOIN transactions t ON t.id = tp.transaction_id
        WHERE t.date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        GROUP BY month
        ORDER BY month DESC
      `),

      pool.query(`
        SELECT 
          DATE_TRUNC('month', month_date) AS month,
          (total_income_net / NULLIF(total_income_brut, 0)) * 100 AS margin
        FROM total_budget
        WHERE month_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        ORDER BY month DESC
      `)
    ]);

    const currentBudget = budgetRows.rows[0] || {};
    const prevBudget = budgetRows.rows[1] || {};

    const currentSales = salesRows.rows[0]?.total || 0;
    const prevSales = salesRows.rows[1]?.total || 0;

    const currentUnits = unitRows.rows[0]?.total || 0;
    const prevUnits = unitRows.rows[1]?.total || 0;

    const currentMargin = marginRows.rows[0]?.margin || 0;
    const prevMargin = marginRows.rows[1]?.margin || 0;

    const metrics = {
      sales: calculateMetric(currentSales, prevSales),
      expenses: calculateMetric(currentBudget.total_expenses, prevBudget.total_expenses, true),
      net: calculateMetric(currentBudget.net_balance, prevBudget.net_balance),
      units: calculateMetric(currentUnits, prevUnits),
      margin: calculateMetric(currentMargin, prevMargin)
    };

    res.status(200).json({ success: true, data: metrics });

  } catch (error) {
    console.error("Error in /performance route:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message
    });
  }
});

const calculateMetric = (current, previous, inverse = false) => {
  current = Number(current) || 0;
  previous = Number(previous) || 0;

  let percentage = 0;
  if (previous === 0 && current > 0) {
    percentage = 100;
  } else if (previous !== 0) {
    percentage = ((current - previous) / Math.abs(previous)) * 100;
  }

  if (inverse) percentage = -percentage;

  return {
    value: `${Math.round(percentage)}%`,
    absolute: Math.round(current),
    trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
  };
};


router.get("/budget", middleware.auth, async (req, res) => {
  try {
    const { year } = req.query;

    // Get all distinct years for dropdown
    const yearsResult = await pool.query(`
      SELECT DISTINCT EXTRACT(YEAR FROM month_date)::int as year
      FROM total_budget
      ORDER BY year DESC
    `);

    // Query data (with optional year filter)
    const params = [];
    let query = `
      SELECT 
        TO_CHAR(month_date, 'YYYY-MM') as period,
        total_income_brut::float,
        total_income_net::float,
        total_expenses::float,
        net_balance::float
      FROM total_budget
    `;

    if (year) {
      query += " WHERE EXTRACT(YEAR FROM month_date) = $1";
      params.push(year);
    }

    query += " ORDER BY month_date";

    const dataResult = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        years: yearsResult.rows.map(r => r.year),
        budgetData: dataResult.rows
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message
    });
  }
});

router.get("/charts", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner") return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, async (req, res) => {
  try {
    const [salesTrend, paymentMethods, budgetTrend, incomeExpense] = await Promise.all([
      pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
          SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END)::float AS sales,
          SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END)::float AS purchases
        FROM transactions
        GROUP BY month
        ORDER BY month
      `),

      pool.query(`
        SELECT 
          pm.name,
          COUNT(*)::int AS value
        FROM payments
        JOIN payment_methods pm ON payments.payment_method_id = pm.id
        GROUP BY pm.name
        ORDER BY value DESC
      `),

      pool.query(`
        SELECT 
          TO_CHAR(month_date, 'YYYY-MM') AS month,
          net_balance::float
        FROM total_budget
        ORDER BY month_date
      `),

      pool.query(`
        SELECT 
          TO_CHAR(month_date, 'YYYY-MM') AS month,
          total_income_brut::float AS income,
          total_expenses::float
        FROM total_budget
        ORDER BY month_date
      `)
    ]);

    res.json({
      success: true,
      data: {
        salesTrend: salesTrend.rows,
        paymentMethods: paymentMethods.rows,
        budgetTrend: budgetTrend.rows,
        incomeExpense: incomeExpense.rows
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message
    });
  }
});

router.get("/products/top", middleware.auth, async (req, res) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  try {
    const { limit = 5 } = req.query;
    const safeLimit = parseInt(limit) || 5;

    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        SUM(tp.quantity)::int AS total_sold,
        SUM(tp.quantity * tp.unit_price)::float AS total_revenue
      FROM transaction_products tp
      JOIN products p ON tp.product_id = p.id
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT $1
    `, [safeLimit]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});
export default router
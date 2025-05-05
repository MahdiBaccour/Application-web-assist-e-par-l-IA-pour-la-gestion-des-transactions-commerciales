import { Router } from "express";
import pool from "../../db.js";
const router = Router();
import middleware from "../../middleware/auth.js"; // Import middleware

// 📌 READ all transactions
router.get("/", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner" || req.user.role === "employee" ) {
    return next();
  }
  res.status(403).json({ success: false, message: "Unauthorized" });
}, async (req, res) => {
  const { type, startDate, endDate } = req.query;
  let query = `
    SELECT t.id, t.type, t.amount, t.date, t.description, t.reference_number, 
           t.remaining_balance, t.status, t.total_cost, t.client_id, t.supplier_id,
           c.name AS client_name, s.name AS supplier_name, pm.name AS payment_method_name
    FROM transactions t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN suppliers s ON t.supplier_id = s.id
    LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
  `;
  
  const params = [];
  let conditions = [];
  let paramIndex = 1;

  if (type && type !== "all") {
    conditions.push(`t.type = $${paramIndex}`);
    params.push(type);
    paramIndex++;
  }

  if (startDate && endDate) {
    conditions.push(`t.date >= $${paramIndex} AND t.date <= $${paramIndex + 1}`);
    params.push(startDate, endDate);
    paramIndex += 2;
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  try {
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, transactions: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching transactions", error: error.message });
  }
});

// 📌 READ transactions by client or supplier
router.get("/client-or-supplier", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner" || req.user.role === "client" || req.user.role === "supplier") {
    return next();
  }
  res.status(403).json({ success: false, message: "Unauthorized" });
}, async (req, res) => {
  const { type, startDate, endDate, client_id, supplier_id } = req.query;

  // Validate client/supplier exclusivity
  if (client_id && supplier_id) {
    return res.status(400).json({
      success: false,
      message: "Cannot filter by both client and supplier simultaneously"
    });
  }

  let query = `
    SELECT t.id, t.type, t.amount, t.date, t.description, t.reference_number, 
           t.remaining_balance, t.status, t.total_cost, t.client_id, t.supplier_id,
           c.name AS client_name, s.name AS supplier_name, pm.name AS payment_method_name
    FROM transactions t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN suppliers s ON t.supplier_id = s.id
    LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
  `;
  
  const params = [];
  let conditions = [];
  let paramIndex = 1;

  // Client/Supplier filter
  if (client_id) {
    conditions.push(`t.client_id = $${paramIndex}`);
    params.push(client_id);
    paramIndex++;
  } else if (supplier_id) {
    conditions.push(`t.supplier_id = $${paramIndex}`);
    params.push(supplier_id);
    paramIndex++;
  }

  // Type filter
  if (type && type !== "all") {
    conditions.push(`t.type = $${paramIndex}`);
    params.push(type);
    paramIndex++;
  }

  // Date filter
  if (startDate && endDate) {
    conditions.push(`t.date >= $${paramIndex} AND t.date <= $${paramIndex + 1}`);
    params.push(startDate, endDate);
    paramIndex += 2;
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  try {
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, transactions: result.rows });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching transactions", 
      error: error.message 
    });
  }
});

// 📌 READ active transactions by type with remaining balance
router.get("/active", middleware.auth, (req, res, next) => {
  if (req.user.role === "owner" || req.user.role === "employee") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Unauthorized access",
  });
}, async (req, res) => {
  try {
    const { type } = req.query;
   

    if (!type || !['credit', 'debit'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid type parameter. Use 'credit' or 'debit'",
      });
    }

    const transactionType = type.toLowerCase();


    const query = "SELECT * FROM transactions WHERE type = $1 AND remaining_balance > $2";
   

    const result = await pool.query(query, [transactionType, 0]);

    res.status(200).json({
      success: true,
      count: result.rowCount,
      transactions: result.rows
    });

  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message
    });
  }
});
  
// 📌 READ  client or supplier  ID
router.get("/party-id", middleware.auth, (req, res, next) => {
  if (["owner", "client", "supplier"].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Unauthorized access",
  });
}, async (req, res) => {
  const { email_client, email_supplier } = req.query;

  try {
    if (email_client && email_supplier) {
      return res.status(400).json({
        success: false,
        message: "Fournir soit email_client soit email_supplier, pas les deux"
      });
    }

    if (!email_client && !email_supplier) {
      return res.status(400).json({
        success: false,
        message: "Email client ou fournisseur requis"
      });
    }

    let query, email, entityType;

    if (email_client) {
      query = 'SELECT id FROM clients WHERE email = $1';
      email = email_client;
      entityType = 'Client';
    } else {
      query = 'SELECT id FROM suppliers WHERE email = $1';
      email = email_supplier;
      entityType = 'Fournisseur';
    }

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${entityType} non trouvé`
      });
    }

    res.status(200).json({
      success: true,
      partyId: result.rows[0].id
    });

  } catch (error) {
    console.error("Erreur de recherche:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la recherche"
    });
  }
});

// 📌 READ a single transaction by ID
router.get("/:id", middleware.auth, (req, res, next) => {
  if (["owner", "employee", "client", "supplier"].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Unauthorized access",
  });
}, async (req, res) => {
  const { id } = req.params;

  if (isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: "ID invalide, doit être un entier"
    });
  }

  try {
    const query = `
      SELECT t.*, pm.name AS payment_method_name
      FROM transactions t
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({ success: true, transaction: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching transaction", error: error.message });
  }
});
  export default router;
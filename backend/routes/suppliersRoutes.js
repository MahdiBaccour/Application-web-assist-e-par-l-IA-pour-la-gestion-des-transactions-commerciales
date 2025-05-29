import { Router } from "express";
const router =Router();
import  pool  from "../db.js";
import middleware from "../middleware/auth.js"; // Import middleware

// 📌 CREATE a new supplier
router.post("/",middleware.auth,(req, res, next) => {
  // Check if the user is  an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
  
  const { name, email, phone, address, note } = req.body;

  try {
    await pool.query("BEGIN");
    // Check if the phone number already exists
    const phoneCheck = await pool.query("SELECT id FROM suppliers WHERE phone = $1", [phone]);
    if (phoneCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Phone number already exists" });
    }
    const currentUserId = req.user.id;
    await pool.query(`SET LOCAL myapp.current_user_id = '${currentUserId}'`);
    // Insert the new supplier
    const result = await pool.query(
      `INSERT INTO suppliers (name, email, phone, address, note)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, phone, address, note]
    );
    await pool.query("COMMIT");
    res.status(201).json({ success: true, supplier: result.rows[0] });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Error adding supplier", error: error.message });
  }
});

// 📌 READ all suppliers
router.get("/",middleware.auth,(req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
 
  const { status } = req.query;
  let query = "SELECT * FROM suppliers";
  const params = [];

  if (status && status !== 'all') {
    query += " WHERE status_supplier = $1";
    params.push(status);
  }

  try {
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, suppliers: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching suppliers", error: error.message });
  }
});

// 📌 READ a single supplier by ID
router.get("/:id",middleware.auth,(req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {

  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM suppliers WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    res.status(200).json({ success: true, supplier: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching supplier", error: error.message });
  }
});

// 📌 Check if a phone number already exists
router.post("/check-phone",middleware.auth,(req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
  
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }

  try {
    const result = await pool.query("SELECT * FROM suppliers WHERE phone = $1", [phone]);

    if (result.rows.length > 0) {
      return res.status(200).json({ success: true, supplier: result.rows[0] });
    }

    res.status(200).json({ success: false, message: "Phone number is available" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking phone number", error: error.message });
  }
});

// 📌 UPDATE a supplier
router.put("/:id",middleware.auth,(req, res, next) => {
  // Check if the user is an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
   
  const { id } = req.params;
  const { name, email, phone, address, note } = req.body;

  try {
    await pool.query("BEGIN");
    const existingSupplier = await pool.query("SELECT * FROM suppliers WHERE id = $1", [id]);
    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    const updatedSupplier = {
      name: name ?? existingSupplier.rows[0].name,
      email: email ?? existingSupplier.rows[0].email,
      phone: phone ?? existingSupplier.rows[0].phone,
      address: address ?? existingSupplier.rows[0].address,
      note: note ?? existingSupplier.rows[0].note
    };

    const updateFields = [];
    const values = [];
    let index = 1;

    for (const key in updatedSupplier) {
      if (req.body[key] !== undefined) {
        updateFields.push(`${key} = $${index}`);
        values.push(updatedSupplier[key]);
        index++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided for update" });
    }
    const currentUserId = req.user.id;
    await pool.query(`SET LOCAL myapp.current_user_id = '${currentUserId}'`);
    values.push(id);
    const query = `UPDATE suppliers SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`;

    const result = await pool.query(query, values);
    await pool.query("COMMIT");
    res.status(200).json({ success: true, message: "Supplier updated successfully", supplier: result.rows[0] });

  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Error updating supplier", error: error.message });
  }
});

// Update status endpoint
router.patch("/:id/status",middleware.auth, (req, res, next) => {
  // Check if the user is  an owner
  if (req.user.role === "owner" )  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
},async (req, res) => {
 
  const { id } = req.params;
  const { status_supplier } = req.body;

  if (!["active", "inactive"].includes(status_supplier)) {
    return res.status(400).json({ success: false, message: "Invalid status. Allowed values: 'active' or 'inactive'" });
  }

  try {
    await pool.query("BEGIN");
    const currentUserId = req.user.id;
    await pool.query(`SET LOCAL myapp.current_user_id = '${currentUserId}'`);
    const result = await pool.query(
      "UPDATE suppliers SET status_supplier = $1 WHERE id = $2 RETURNING *",
      [status_supplier, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    await pool.query("COMMIT");
    res.status(200).json({ success: true, message: `Supplier status set to ${status_supplier}`, supplier: result.rows[0] });

  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Error updating supplier status", error: error.message });
  }
});

export default router;
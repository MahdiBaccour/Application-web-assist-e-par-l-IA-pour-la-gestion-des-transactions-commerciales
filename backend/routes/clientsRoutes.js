import { Router } from "express";
import pool from "../db.js";
const router = Router();
import middleware from "../middleware/auth.js"; // Import middleware
// 📌 CREATE a new client
router.post("/",middleware.auth, (req, res, next) => {
  // Check if the user is  an owner
  if (req.user.role === "owner" )  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
  
  const { name, email, phone, address,note } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO clients (name, email, phone, address,note) VALUES ($1, $2, $3, $4,$5) RETURNING *",
      [name, email, phone, address,note]
    );
    
    res.status(201).json({ success: true, client: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating client", error: error.message });
  }
});

// 📌 READ all clients
router.get("/",middleware.auth, (req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
 
  const { status } = req.query;
  let query = "SELECT * FROM clients";
  const params = [];

  if (status && status !== 'all') {
    query += " WHERE status_client = $1";
    params.push(status);
  }

  try {
    const result = await pool.query(query, params);
    res.status(200).json({ success: true, clients: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching clients", error: error.message });
  }
});

// 📌 READ a single client by ID
router.get("/:id",middleware.auth, (req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
  
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM clients WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    res.status(200).json({ success: true, client: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching client", error: error.message });
  }
});

// 📌 Check if a phone number already exists for clients
router.post("/check-phone",middleware.auth , (req, res, next) => {
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
    const result = await pool.query("SELECT * FROM clients WHERE phone = $1", [phone]);

    if (result.rows.length > 0) {
      return res.status(200).json({ success: true, client: result.rows[0] });
    }

    res.status(200).json({ success: false, message: "Phone number is available" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking phone number", error: error.message });
  }
});

// 📌 UPDATE a client
router.put("/:id",middleware.auth, (req, res, next) => {
  // Check if the user is  an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {
 
  const { id } = req.params;
  const { name, email, phone, address,note } = req.body;

  try {
    // Fetch the existing client data
    const existingClient = await pool.query("SELECT * FROM clients WHERE id = $1", [id]);
    if (existingClient.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    // Merge existing data with new updates
    const updatedClient = {
      name: name ?? existingClient.rows[0].name,
      email: email ?? existingClient.rows[0].email,
      phone: phone ?? existingClient.rows[0].phone,
      address: address ?? existingClient.rows[0].address,
      note: note ?? existingClient.rows[0].note,
    };

    // Update only the changed fields dynamically
    const updateFields = [];
    const values = [];
    let index = 1;

    for (const key in updatedClient) {
      if (req.body[key] !== undefined) {
        updateFields.push(`${key} = $${index}`);
        values.push(updatedClient[key]);
        index++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided for update" });
    }

    values.push(id); // Add the ID as the last parameter

    const query = `UPDATE clients SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`;

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, message: "Client updated successfully", client: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating client", error: error.message });
  }
});


// Update status endpoint
router.patch("/:id/status",middleware.auth, (req, res, next) => {
  // Check if the user is either an employee or an owner
  if (req.user.role === "owner" || req.user.role === "employee")  {
   return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
  }
}, async (req, res) => {

  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await pool.query(
      "UPDATE clients SET status_client = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    
    res.status(200).json({ success: true, client: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
});

export default router;

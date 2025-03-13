import { Router } from "express";
import pool from "../db.js";
const router = Router();

// 📌 CREATE a new client
router.post("/", async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO clients (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, phone, address]
    );
    
    res.status(201).json({ success: true, client: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating client", error: error.message });
  }
});

// 📌 READ all clients
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clients");
    res.status(200).json({ success: true, clients: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching clients", error: error.message });
  }
});

// 📌 READ a single client by ID
router.get("/:id", async (req, res) => {
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

// 📌 UPDATE a client
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

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

// 📌 DELETE a client
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM clients WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    res.status(200).json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting client", error: error.message });
  }
});

export default router;

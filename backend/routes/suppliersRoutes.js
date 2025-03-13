import { Router } from "express";
const router =Router();
import  pool  from "../db.js";
// 📌 CREATE a new supplier
router.post("/", async (req, res) => {
  const { name, email, phone, address, balance } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO suppliers (name, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, phone, address, balance || 0.0]
    );
    res.status(201).json({ success: true, supplier: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating supplier", error: error.message });
  }
});

// 📌 READ all suppliers
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM suppliers");
    res.status(200).json({ success: true, suppliers: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching suppliers", error: error.message });
  }
});

// 📌 READ a single supplier by ID
router.get("/:id", async (req, res) => {
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

// 📌 UPDATE a supplier
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  try {
    const existingSupplier = await pool.query("SELECT * FROM suppliers WHERE id = $1", [id]);
    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    const updatedSupplier = {
      name: name ?? existingSupplier.rows[0].name,
      email: email ?? existingSupplier.rows[0].email,
      phone: phone ?? existingSupplier.rows[0].phone,
      address: address ?? existingSupplier.rows[0].address,
    
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

    values.push(id);
    const query = `UPDATE suppliers SET ${updateFields.join(", ")} WHERE id = $${index} RETURNING *`;

    const result = await pool.query(query, values);
    res.status(200).json({ success: true, message: "Supplier updated successfully", supplier: result.rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating supplier", error: error.message });
  }
});

// 📌 DELETE a supplier
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM suppliers WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }
    res.status(200).json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting supplier", error: error.message });
  }
});

export default router;
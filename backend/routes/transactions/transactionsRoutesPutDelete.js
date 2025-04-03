import { Router } from "express";
import pool from "../../db.js";
const router = Router();


// 📌 UPDATE a transaction with improved validation
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { type, amount, date, description, client_id, supplier_id, 
            payment_method_id, reference_number, products, due_date, due_status,
            initial_payment } = req.body;
  
    try {
        await pool.query("BEGIN");
  
        // Fetch existing transaction
        const oldTransaction = await pool.query("SELECT * FROM transactions WHERE id = $1", [id]);
        if (oldTransaction.rows.length === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }
  
        // Validate budget
        const budgetResult = await pool.query("SELECT budget FROM total_budget WHERE id = 1");
        const budget = budgetResult.rows[0]?.budget || 0;
        const amountDifference = amount - oldTransaction.rows[0].amount;
  
        if (amountDifference > 0 && amountDifference > budget) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ success: false, message: "Updated amount exceeds available budget" });
        }
  
        // Restore old product stock before updating
        const oldProducts = await pool.query("SELECT product_id, quantity FROM transaction_products WHERE transaction_id = $1", [id]);
  
        for (const product of oldProducts.rows) {
            await pool.query("UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2", [product.quantity, product.product_id]);
        }
  
        // Validate new product stock
        if (products && products.length > 0) {
            for (const product of products) {
                const stockResult = await pool.query("SELECT stock_quantity FROM products WHERE id = $1", [product.product_id]);
                const stock = stockResult.rows[0]?.stock_quantity || 0;
  
                if (stock < product.quantity) {
                    await pool.query("ROLLBACK");
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for product ${product.product_id}. Available: ${stock}, Requested: ${product.quantity}`
                    });
                }
            }
        }
  
         // Update transaction
         const transactionUpdate = await pool.query(
            `UPDATE transactions 
             SET type = $1, amount = $2, date = $3, description = $4, client_id = $5, 
                 supplier_id = $6, payment_method_id = $7, reference_number = $8, 
                 due_date = $9, due_status = $10 
             WHERE id = $11 RETURNING *`,
            [type, amount, date, description, client_id, supplier_id, 
             payment_method_id, reference_number, due_date, due_status || "pending", id]
        );

        // Handle initial payment if provided
        if (initial_payment && payment_method_id) {
            await pool.query(
                `INSERT INTO payments (transaction_id, amount_paid, payment_date, payment_method_id)
                 VALUES ($1, $2, $3, $4)`,
                [id, initial_payment, new Date(), payment_method_id]
            );
        }

        // Update transaction products (stock handled by trigger)
        if (products && products.length > 0) {
            await pool.query("DELETE FROM transaction_products WHERE transaction_id = $1", [id]);
            
            for (const product of products) {
                await pool.query(
                    `INSERT INTO transaction_products (transaction_id, product_id, quantity, unit_price)
                     VALUES ($1, $2, $3, $4)`,
                    [id, product.product_id, product.quantity, product.unit_price]
                );
            }
        }

        await pool.query("COMMIT");
        res.status(200).json({ success: true, transaction: transactionUpdate.rows[0] });

    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(500).json({ success: false, message: "Error updating transaction", error: error.message });
    }
});


// 📌 DELETE a transaction (Cascade delete related data)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("BEGIN");

    // Delete transaction notifications
    await pool.query("DELETE FROM notifications WHERE transaction_id = $1", [id]);

   

    // Delete transaction products and restore stock
    const products = await pool.query("SELECT product_id, quantity FROM transaction_products WHERE transaction_id = $1", [id]);

    for (const product of products.rows) {
        await pool.query("UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2", [product.quantity, product.product_id]);
    }

    await pool.query("DELETE FROM transaction_products WHERE transaction_id = $1", [id]);

    // Delete the transaction
    const result = await pool.query("DELETE FROM transactions WHERE id = $1 RETURNING *", [id]);
console.log(result);
    await pool.query("COMMIT");

    res.status(200).json({ success: true, message: "Transaction and related data deleted successfully" });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ success: false, message: "Error deleting transaction", error: error.message });
  }
});
export default router;
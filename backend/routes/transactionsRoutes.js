import { Router } from "express";
import pool from "../db.js";
const router = Router();

// 📌 CREATE a new transaction with stock validation
router.post("/", async (req, res) => {
    const { type, amount, date, description, client_id, supplier_id, 
            payment_method_id, reference_number, products, due_date, due_status,
            initial_payment } = req.body;
  
    if (!products || products.length === 0) {
        return res.status(400).json({ success: false, message: "At least one product is required" });
    }
  
    if (amount <= 0) {
        return res.status(400).json({ success: false, message: "Amount must be greater than zero" });
    }
  
    try {
        await pool.query("BEGIN");
  //TO improve
        // Verify budget availability
        const budgetResult = await pool.query("SELECT budget FROM total_budget WHERE id = 1");
        const budget = budgetResult.rows[0]?.budget || 0;
  
        if (amount > budget) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ success: false, message: "No money available, amount exceeds the budget" });
        }
  
        // Ensure client or supplier exists
        if (client_id) {
            const clientCheck = await pool.query("SELECT id FROM clients WHERE id = $1", [client_id]);
            if (clientCheck.rows.length === 0) {
                await pool.query("ROLLBACK");
                return res.status(404).json({ success: false, message: "Client not found" });
            }
        }
  
        if (supplier_id) {
            const supplierCheck = await pool.query("SELECT id FROM suppliers WHERE id = $1", [supplier_id]);
            if (supplierCheck.rows.length === 0) {
                await pool.query("ROLLBACK");
                return res.status(404).json({ success: false, message: "Supplier not found" });
            }
        }
  
        // Check for duplicate reference number
        const refCheck = await pool.query("SELECT id FROM transactions WHERE reference_number = $1", [reference_number]);
        if (refCheck.rows.length > 0) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ success: false, message: "Reference number already exists" });
        }
  
        // Stock validation (check the stock quantity directly in the products table)
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
  
        // Insert transaction
        const transactionResult = await pool.query(
            `INSERT INTO transactions (type, amount, date, description, client_id, 
             supplier_id, payment_method_id, reference_number,remaining_balance, due_date, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11) RETURNING *`,
            [type, amount, date || new Date(), description, client_id, supplier_id, 
             payment_method_id, reference_number,amount, due_date, due_status || "pending"]
        );
        let transaction = transactionResult.rows[0];
  
      // Handle initial payment if provided
      if (initial_payment && payment_method_id) {

        if (amount < initial_payment) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ success: false, message: "Error creating transaction, Initial payment exceeds the total amount" });
        }
        await pool.query(
            `INSERT INTO payments (transaction_id, amount_paid, payment_date, payment_method_id)
             VALUES ($1, $2, $3, $4)`,
            [transaction.id, initial_payment, new Date(), payment_method_id]
        );
    }

    // Insert transaction products (stock handled by trigger)
    for (const product of products) {
        await pool.query(
            `INSERT INTO transaction_products (transaction_id, product_id, quantity, unit_price)
             VALUES ($1, $2, $3, $4)`,
            [transaction.id, product.product_id, product.quantity, product.unit_price]
        );
    }

  
        await pool.query("COMMIT");
        // Check if initial_payment is provided, and adjust remaining_balance in the returned JSON response
if (initial_payment) {
    transaction.remaining_balance = amount - initial_payment; // Adjust the remaining_balance
}
        res.status(201).json({ success: true, transaction });
  
    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(500).json({ success: false, message: "Error creating transaction", error: error.message });
    }
  });


// 📌 READ all transactions
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions");
    res.status(200).json({ success: true, transactions: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching transactions", error: error.message });
  }
});
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

import { Router } from "express";
import pool from "../../db.js";
const router = Router();
import middleware from "../../middleware/auth.js"; // Import middleware

import {appendTransactionToCSV} from "../../../src/utils/generateCSV.js"; // adjust path if needed
// 📌 CREATE a new transaction with stock validation
router.post("/",  middleware.auth, (req, res, next) => {
    // Check if the user is either an employee or an owner
    if (req.user.role === "owner" || req.user.role === "employee")  {
     return next();  // If one of the conditions is true, proceed to the next middleware or the route handler
    }
  }, async (req, res) => {
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
  
        let totalAmount = 0;
        let totalCost = 0;
        const productUpdates = [];

        for (const product of products) {
            const { rows: [dbProduct] } = await pool.query(
                "SELECT selling_price, stock_quantity FROM products WHERE id = $1",
                [product.product_id]
            );

            if (!dbProduct) {
                await pool.query("ROLLBACK");
                return res.status(404).json({ success: false, message: `Product ${product.product_id} not found` });
            }
                    // Fetch latest historical cost price once for both cases
                const historicalCostResult = await pool.query(
                `SELECT tp.historical_cost_price 
                FROM transaction_products tp
                JOIN transactions t ON tp.transaction_id = t.id
                WHERE tp.product_id = $1 
                ORDER BY t.date DESC 
                LIMIT 1`,
                [product.product_id]
            );

            // Use historical cost price if found, otherwise fallback to unit price
            const historicalCostPrice = historicalCostResult.rows.length > 0
                ? historicalCostResult.rows[0].historical_cost_price
                : product.unit_price; 

            if (type === 'credit') { // Sale
                if (dbProduct.stock_quantity < product.quantity) {
                    await pool.query("ROLLBACK");
                    return res.status(400).json({ 
                        success: false, 
                        message: `Insufficient stock for product ${product.product_id}`
                    });
                }
                if (historicalCostPrice > product.unit_price) {
                    await pool.query("ROLLBACK");
                    return res.status(400).json({ 
                        success: false, 
                        message: `Selling price is less than historical cost price for product ${product.product_id}`
                    });
                }

                        totalAmount += product.unit_price * product.quantity;
                        totalCost += historicalCostPrice * product.quantity;

                    } else { // Purchase (Debit)
                        // If unit_price > historical_cost_price, update it
                        product.historical_cost_price = product.unit_price > historicalCostPrice
                            ? product.unit_price 
                            : historicalCostPrice;

                        totalCost += product.unit_price * product.quantity;
                    }
                                productUpdates.push(product);
                            }
                        
        // Insert transaction
        const { rows: [transaction] } = await pool.query(
            `INSERT INTO transactions (
                type, amount,date ,description, client_id, supplier_id, payment_method_id,
                reference_number, remaining_balance,due_date, status,total_cost
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
             RETURNING *`,
            [
                type,
                type === 'credit' ? totalAmount : totalCost,
                date || new Date(),
                description,
                client_id,
                supplier_id,
                payment_method_id,
                reference_number,
                amount,
                due_date,
               due_status || "pending",
                 totalCost
            ]
        );

        let transactionResult = transaction;

        // Handle initial payment if provided
        if (initial_payment && payment_method_id) {
            if (amount < initial_payment) {
                await pool.query("ROLLBACK");
                return res.status(400).json({ success: false, message: "Error creating transaction, Initial payment exceeds the total amount" });
            }

            await pool.query(
                `INSERT INTO payments (transaction_id, amount_paid, payment_date, payment_method_id)
                 VALUES ($1, $2, $3, $4)`,
                [transaction.id, initial_payment, transaction.date, payment_method_id]
            );

        }
         // Define remaining_balance before inserting
         let remaining_balance = amount; // Default: entire amount is due

         // If initial payment is made, deduct from remaining_balance
         if (initial_payment) {
             remaining_balance -= initial_payment;
                                 }
        transactionResult.remaining_balance = remaining_balance;
        // Insert transaction products
        for (const product of productUpdates) {
            await pool.query(
                `INSERT INTO transaction_products (
                    transaction_id, product_id, quantity, 
                    unit_price, historical_cost_price
                ) VALUES ($1, $2, $3, $4, $5)`,
                [
                    transaction.id,
                    product.product_id,
                    product.quantity,
                    product.unit_price,
                    product.historical_cost_price
                ]
            );
        }
        appendTransactionToCSV(transaction, productUpdates, initial_payment, payment_method_id);
        await pool.query("COMMIT");
        res.status(201).json({ success: true, transaction: transactionResult });
    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(500).json({ success: false, message: "Error creating transaction", error: error.message });
    }
});

 

export default router;

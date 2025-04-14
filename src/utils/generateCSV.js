// utils/generateCSV.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Manually define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = path.join(__dirname, "..", "csv_exports");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

/**
 * Generates CSVs for transaction, transaction products, and payment if applicable.
 * @param {Object} transaction - The transaction object
 * @param {Array} productUpdates - List of products with product_id, quantity, unit_price
 * @param {number} initial_payment - Optional initial payment amount
 * @param {number} payment_method_id - Payment method ID (required if initial_payment is present)
 */

const writePaymentRowToCSV = (paymentRowArray) => {
  const paymentCSVPath = path.join(outputDir, "payments.csv");
  const row = paymentRowArray.join(",");

  if (!fs.existsSync(paymentCSVPath)) {
      const header = ["transaction_id", "amount_paid", "payment_date", "payment_method_id"].join(",");
      fs.writeFileSync(paymentCSVPath, `${header}\n${row}\n`);
  } else {
      fs.appendFileSync(paymentCSVPath, `${row}\n`);
  }
};

export const appendTransactionToCSV = (transaction, productUpdates, initial_payment = 0, payment_method_id = null) => {
  try {
      // === 1. Transaction CSV ===
      const transactionCSVPath = path.join(outputDir, "transactions.csv");
      const transactionRow = [
          transaction.id,
          transaction.type,
          transaction.amount,
          transaction.date.toISOString(),
          transaction.client_id || "",
          transaction.supplier_id || "",
          transaction.payment_method_id,
          transaction.reference_number
      ].join(",");

      if (!fs.existsSync(transactionCSVPath)) {
          const transactionHeader = ["id", "type", "amount", "date", "client_id", "supplier_id", "payment_method_id", "reference_number"].join(",");
          fs.writeFileSync(transactionCSVPath, `${transactionHeader}\n${transactionRow}\n`);
      } else {
          fs.appendFileSync(transactionCSVPath, `${transactionRow}\n`);
      }

      // === 2. Transaction Products CSV ===
      const productCSVPath = path.join(outputDir, "transaction_products.csv");
      const productRows = productUpdates.map(prod =>
          [transaction.id, prod.product_id, prod.quantity, prod.unit_price].join(",")
      );

      if (!fs.existsSync(productCSVPath)) {
          const header = ["transaction_id", "product_id", "quantity", "unit_price"].join(",");
          fs.writeFileSync(productCSVPath, `${header}\n${productRows.join("\n")}\n`);
      } else {
          fs.appendFileSync(productCSVPath, `${productRows.join("\n")}\n`);
      }

      // === 3. Payments CSV ===
      if (initial_payment) {
          const paymentRow = [
              transaction.id,
              initial_payment,
              transaction.date.toISOString(),
              payment_method_id
          ];
          writePaymentRowToCSV(paymentRow);
      }

  } catch (err) {
      console.error("CSV Generation Error:", err.message);
  }
};

// Add this below your existing generateCSV
export const appendPaymentToCSV = (payment) => {
  try {
      const paymentRow = [
          payment.transaction_id,
          payment.amount_paid,
          new Date(payment.payment_date).toISOString(),
          payment.payment_method_id
      ];
      writePaymentRowToCSV(paymentRow);
  } catch (err) {
      console.error("Error appending payment:", err.message);
  }
};
  
  export const updatePaymentInCSV = (payment) => {
    try {
      const paymentCSVPath = path.join(outputDir, "payments.csv");
  
      if (!fs.existsSync(paymentCSVPath)) return;
  
      const rows = fs.readFileSync(paymentCSVPath, "utf-8").split("\n");
      const header = rows[0];
      const updatedRows = rows.slice(1).filter(Boolean).map(row => {
        const [t_id, amount] = row.split(",");
        if (t_id === String(payment.transaction_id) && amount === String(payment.old_amount_paid)) {
          return [
            payment.transaction_id,
            payment.amount_paid,
            new Date(payment.payment_date).toISOString(),
            payment.payment_method_id
          ].join(",");
        }
        return row;
      });
  
      fs.writeFileSync(paymentCSVPath, `${header}\n${updatedRows.join("\n")}\n`);
    } catch (err) {
      console.error("Error updating payment:", err.message);
    }
  };
  
  export const deletePaymentFromCSV = (payment) => {
    try {
      const paymentCSVPath = path.join(outputDir, "payments.csv");
  
      if (!fs.existsSync(paymentCSVPath)) return;
  
      const rows = fs.readFileSync(paymentCSVPath, "utf-8").split("\n");
      const header = rows[0];
      const filteredRows = rows.slice(1).filter(Boolean).filter(row => {
        const [t_id, amount] = row.split(",");
        return !(
          t_id === String(payment.transaction_id) &&
          amount === String(payment.amount_paid)
        );
      });
  
      fs.writeFileSync(paymentCSVPath, `${header}\n${filteredRows.join("\n")}\n`);
    } catch (err) {
      console.error("Error deleting payment from CSV:", err.message);
    }
  };
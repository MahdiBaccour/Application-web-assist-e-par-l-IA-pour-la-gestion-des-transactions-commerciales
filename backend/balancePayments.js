import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'ml_dataset_cleaned_final.json');
const outputPath = path.join(__dirname, 'ml_dataset_balanced.json');

async function updatePayments() {
  try {
    console.log('💰 Reading dataset...');
    const rawData = await fs.readFile(inputPath, 'utf-8');
    const dataset = JSON.parse(rawData);

    if (!Array.isArray(dataset.transactions) || !Array.isArray(dataset.payments)) {
      throw new Error('Dataset is missing transactions or payments array.');
    }

    const updatedPayments = [];
    const transactionIdMap = new Map();

    console.log('⚙️ Assigning temporary IDs and updating payments...');

    dataset.transactions.forEach((transaction, index) => {
      const tempId = index + 1;
      transactionIdMap.set(transaction.reference_number, tempId);
      transaction._temp_id = tempId; // Internal use only
    });

    let processedCount = 0;

    for (const transaction of dataset.transactions) {
      const tempId = transaction._temp_id;
      const initial = transaction.initial_payment || 0;
      const amount = transaction.amount;

      let remaining = parseFloat((amount - initial).toFixed(2));
      if (remaining <= 0) continue;

      // Get all related payments and filter only those that belong to this transaction
      const relatedPayments = dataset.payments.filter(
        (p) => p.transaction_id === tempId || p.transaction_id === transaction.id
      );

      // Update all with new temp ID
      relatedPayments.forEach(p => p.transaction_id = tempId);

      // Choose how many payments to generate (2 to 4)
      const numPayments = Math.min(relatedPayments.length, Math.floor(Math.random() * 3) + 2);

      // If not enough, skip for simplicity
      if (relatedPayments.length < numPayments) {
        console.log(`⏭️ Skipping ${transaction.reference_number} - not enough payments`);
        continue;
      }

      // Generate payment splits
      const randomParts = Array(numPayments).fill(0).map(() => Math.random());
      const sum = randomParts.reduce((a, b) => a + b, 0);
      const proportions = randomParts.map(r => r / sum);

      const splitAmounts = [];

for (let i = 0; i < numPayments; i++) {
  const isLast = i === numPayments - 1;
  const amt = isLast
    ? parseFloat((remaining - splitAmounts.reduce((a, b) => a + b, 0)).toFixed(2))
    : parseFloat((remaining * proportions[i]).toFixed(2));
  splitAmounts.push(amt);
}

      // Apply amounts
      for (let i = 0; i < numPayments; i++) {
        relatedPayments[i].amount_paid = splitAmounts[i];
        updatedPayments.push(relatedPayments[i]);
      }

      // Logs
      const totalPaid = splitAmounts.reduce((a, b) => a + b, 0).toFixed(2);
      console.log(`📦 Transaction: ${transaction.reference_number}`);
      splitAmounts.forEach((amt, idx) => {
        console.log(`  ➤ Payment ${idx + 1}:  $${amt}`);
      });
      console.log(`  ➤ Total paid:    $${totalPaid}\n`);

      processedCount++;
    }

    const cleanedTransactions = dataset.transactions.map(({ _temp_id, ...rest }) => rest);

    const finalData = {
      ...dataset,
      transactions: cleanedTransactions,
      payments: updatedPayments
    };

    await fs.writeFile(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');
    console.log(`✅ Done. Processed ${processedCount} transactions.`);
    console.log(`📁 Saved to: ${outputPath}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

updatePayments();
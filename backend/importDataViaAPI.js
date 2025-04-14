// importData.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import https from 'https';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const API_BASE = 'https://supplychainx.local/api';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJtZWRBbGkiLCJyb2xlIjoib3duZXIiLCJpYXQiOjE3NDQ0NzIxNDIsImV4cCI6MTc0NDQ3OTM0Mn0.KcrwaChPRqoN2CBcsjwjLEKIXIQ1s0dXKAyQBqHVbFg'; // Replace or load from env

// Load the trusted CA certificate
const caCertPath = "/opt/homebrew/etc/nginx/supplychainx.local.pem";
const httpsAgent = new https.Agent({
  ca: fs.readFileSync(caCertPath),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'ml_dataset_balanced.json');

export async function importData() {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { transactions, payments } = JSON.parse(raw); // skip total_budget

  for (const item of [...transactions, ...payments]) {
    try {
      if ('reference_number' in item) {
        // Transaction
        const res = await axios.post(`${API_BASE}/transactions`, item, {
          httpsAgent,
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Transaction ${item.reference_number} inserted:`, res.data.message || res.status);
      } else if ('transaction_id' in item && 'amount_paid' in item) {
        // Payment
        const res = await axios.post(`${API_BASE}/payments`, item, {
          httpsAgent,
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`💰 Payment for transaction ${item.transaction_id} inserted:`, res.data.message || res.status);
      }
    } catch (err) {
      console.error(`❌ Error processing item:`, err?.response?.data || err.message);
    }
  }

  console.log('✅ Finished importing transactions and payments.');
}
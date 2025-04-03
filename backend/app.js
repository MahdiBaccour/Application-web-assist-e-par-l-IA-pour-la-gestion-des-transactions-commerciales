import express, { json } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import clientsRoutes from "./routes/clientsRoutes.js";
import suppliersRoutes from "./routes/suppliersRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import transactionsRoutes from "./routes/transactions/exportTransaction.js";
import paymentMethodsRoutes from "./routes/payment_methodsRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import paymentsRoutes from "./routes/payments/exportPayment.js"; // Import payments routes
import transaction_productsRoutes from "./routes/transaction_productsRoutes.js"; // Import transaction products routes
import settingsRoutes from "./routes/settingsRoutes.js";
import pool from "./db.js";


const app = express();
const port = process.env.PORT || 3000;
app.set('trust proxy', 1);
// const allowedOrigins = [
//   process.env.Frontend_URL, // First origin from environment variable
//   "http://192.168.1.14:3000", // Second origin
//   "https://supplychainx.local:3001", // Third origin
//   "https://supplychainx.local:3000", // Fourth origin
//   "http://supplychainx.local/api", // Fourth origin
//   "https://supplychainx.local",
// ];
const allowedOrigins = [
  "https://supplychainx.local",
  "http://localhost:3000",
  "http://192.168.1.14:3000"
];
app.use(json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Add middleware to handle preflight requests
app.options('*', cors());


// Add middleware to set CORS headers
// Custom headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'https://supplychainx.local');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Authorization, Set-Cookie');
  next();
});
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Current time: ${result.rows[0].now}`);
  } catch (err) {
    res.status(500).send("Error executing query");
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/payment_methods", paymentMethodsRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/payments", paymentsRoutes); // Register payments routes
app.use("/api/transaction_products", transaction_productsRoutes); // Register transaction products routes
app.use("/api/user", settingsRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

pool.query("SELECT current_database()")
  .then(res => {
    console.log("Connected to database:", res.rows[0].current_database);
  })
  .catch(err => {
    console.error("Error fetching database name:", err);
  });

export default pool;

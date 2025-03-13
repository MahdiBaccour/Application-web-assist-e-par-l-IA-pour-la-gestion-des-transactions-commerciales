import express, { json } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import clientsRoutes from "./routes/clientsRoutes.js";
import suppliersRoutes from "./routes/suppliersRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";
import paymentMethodsRoutes from "./routes/payment_methodsRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js"; // Import payments routes
import pool from "./db.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(json());
app.use(cors());

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

// db.js
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Destructure Pool from pg
const { Pool } = pg;

// Create a new Pool instance
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Export the pool for use in other modules
export default pool;
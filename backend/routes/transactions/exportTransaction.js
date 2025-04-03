import express from "express";
import transactionsRoutes from "./transactionsRoutes.js";
import transactionsRoutesGet from "./transactionsRoutesGet.js";
import transactionsRoutesPutDelete from "./transactionsRoutesPutDelete.js";

const router = express.Router();

// Use different routers
router.use("/", transactionsRoutes); // Handles POST
router.use("/", transactionsRoutesGet); // Handles GET
router.use("/", transactionsRoutesPutDelete); // Handles PUT & DELETE

export default router;
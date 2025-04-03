import express from "express";
import paymentsRoutes from "./paymentsRoutes.js";
import paymentsRoutesGet from "./paymentsRoutesGet.js";
import paymentsRoutesPutDelete from "./paymentsRoutesPutDelete.js";

const router = express.Router();

// Use different routers
router.use("/", paymentsRoutes); // Handles POST
router.use("/", paymentsRoutesGet); // Handles GET
router.use("/", paymentsRoutesPutDelete); // Handles PUT & DELETE

export default router;
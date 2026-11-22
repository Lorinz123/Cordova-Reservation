import { Router } from "express";
import {
  createBarangayController,
  getBarangayManagementSummaryController,
  getBarangaysController,
} from "../controllers/barangay.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { doubleCsrfProtection } from "../config/csrf.config.js";

const barangayRouter = Router();

barangayRouter.get("/", getBarangaysController);
barangayRouter.get("/management", requireAuth, requireRole("super_admin"), getBarangayManagementSummaryController);
barangayRouter.post(
  "/",
  doubleCsrfProtection,
  requireAuth,
  requireRole("super_admin"),
  createBarangayController,
);

export default barangayRouter;

import { Router } from "express";
import { createEquipmentController, deleteEquipmentController, getEquipmentController, updateEquipmentController } from "../controllers/equipment.controller.js";
import { optionalAuth, requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { doubleCsrfProtection } from "../config/csrf.config.js";

const equipmentRouter = Router();

equipmentRouter.get("/", optionalAuth, getEquipmentController);
equipmentRouter.post(
  "/",
  doubleCsrfProtection,
  requireAuth,
  requireRole("barangay_admin", "barangay_staff"),
  createEquipmentController,
);
equipmentRouter.patch("/:id", doubleCsrfProtection, requireAuth, requireRole("barangay_admin", "barangay_staff"), updateEquipmentController);
equipmentRouter.delete("/:id", doubleCsrfProtection, requireAuth, requireRole("barangay_admin", "barangay_staff"), deleteEquipmentController);

export default equipmentRouter;

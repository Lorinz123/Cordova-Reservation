import { Router } from "express";
import { listResidentsController } from "../controllers/resident.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const residentRouter = Router();
residentRouter.get("/", requireAuth, requireRole("barangay_admin"), listResidentsController);

export default residentRouter;

import { Router } from "express";
import { doubleCsrfProtection } from "../config/csrf.config.js";
import {
  cancelReservationController,
  createReservationController,
  createReservationBatchController,
  listReservationsController,
  reviewReservationController,
} from "../controllers/reservation.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const reservationRouter = Router();

reservationRouter.get("/", requireAuth, listReservationsController);
reservationRouter.post("/", doubleCsrfProtection, requireAuth, requireRole("resident"), createReservationController);
reservationRouter.post("/batch", doubleCsrfProtection, requireAuth, requireRole("resident"), createReservationBatchController);
reservationRouter.post("/:reservationId/cancel", doubleCsrfProtection, requireAuth, requireRole("resident"), cancelReservationController);
reservationRouter.post(
  "/:reservationId/review",
  doubleCsrfProtection,
  requireAuth,
  requireRole("barangay_admin", "barangay_staff", "super_admin"),
  reviewReservationController,
);

export default reservationRouter;

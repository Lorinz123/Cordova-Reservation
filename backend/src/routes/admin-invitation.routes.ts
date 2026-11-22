import { Router } from "express";
import { doubleCsrfProtection } from "../config/csrf.config.js";
import {
  acceptAdminInvitationController,
  confirmAdminInvitationPageController,
  createAdminInvitationController,
} from "../controllers/admin-invitation.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const adminInvitationRouter = Router();

adminInvitationRouter.post(
  "/",
  doubleCsrfProtection,
  requireAuth,
  requireRole("super_admin"),
  createAdminInvitationController,
);
adminInvitationRouter.get("/confirm", confirmAdminInvitationPageController);
// The one-time email token authorizes this action; session CSRF tokens do not apply.
adminInvitationRouter.post("/accept", acceptAdminInvitationController);

export default adminInvitationRouter;

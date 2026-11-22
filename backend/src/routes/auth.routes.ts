import { Router } from "express";
import { doubleCsrfProtection } from "../config/csrf.config.js";
import {
  currentUserController,
  loginController,
  logoutController,
  resendVerificationEmailController,
  registerController,
} from "../controllers/auth.controller.js";
import {
  emailVerificationPageController,
  verifyEmailController,
} from "../controllers/email-verification.controller.js";
import { csrfTokenController } from "../controllers/csrf.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { updateProfileController } from "../controllers/profile.controller.js";

const authRouter = Router();

authRouter.get("/csrf-token", csrfTokenController);
authRouter.post("/register", doubleCsrfProtection, registerController);
authRouter.post("/verification/resend", doubleCsrfProtection, resendVerificationEmailController);
authRouter.get("/verify-email/confirm", emailVerificationPageController);
// The single-use email token authorizes confirmation, so this form does not use session CSRF.
authRouter.post("/verify-email/confirm", verifyEmailController);
authRouter.post("/login", doubleCsrfProtection, loginController);
authRouter.post("/logout", doubleCsrfProtection, logoutController);
authRouter.get("/me", requireAuth, currentUserController);
authRouter.patch("/profile", doubleCsrfProtection, requireAuth, updateProfileController);

export default authRouter;

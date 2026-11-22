import { Router } from "express";
import { doubleCsrfProtection } from "../config/csrf.config.js";
import { getNotificationsController, markNotificationsReadController } from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const notificationRouter = Router();

notificationRouter.get("/", requireAuth, getNotificationsController);
notificationRouter.post("/read-all", doubleCsrfProtection, requireAuth, markNotificationsReadController);

export default notificationRouter;

import type { RequestHandler } from "express";
import { listUserNotifications, markUserNotificationsRead } from "../services/notification.service.js";

type AuthContext = { userId: string };

export const getNotificationsController: RequestHandler = async (_req, res, next) => {
  try {
    const { userId } = res.locals.auth as AuthContext;
    const data = await listUserNotifications(userId);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsReadController: RequestHandler = async (_req, res, next) => {
  try {
    const { userId } = res.locals.auth as AuthContext;
    await markUserNotificationsRead(userId);
    res.status(200).json({ message: "Notifications marked as read." });
  } catch (error) {
    next(error);
  }
};

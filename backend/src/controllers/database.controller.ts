import type { RequestHandler } from "express";
import { checkDatabaseService } from "../services/database.service.js";

export const databaseHealthController: RequestHandler = async (
  _req,
  res,
  next,
) => {
  try {
    await checkDatabaseService();
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
};
import type { RequestHandler } from "express";
import { generateCsrfToken } from "../config/csrf.config.js";

export const csrfTokenController: RequestHandler = (req, res) => {
  const csrfToken = generateCsrfToken(req, res);
  res.status(200).json({ csrfToken });
};
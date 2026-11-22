import type { RequestHandler } from "express";
import { listBarangayResidents, ResidentServiceError } from "../services/resident.service.js";

export const listResidentsController: RequestHandler = async (_req, res, next) => {
  try {
    const auth = res.locals.auth as { barangayId: string | null };
    const data = await listBarangayResidents(auth.barangayId);
    res.status(200).json({ data });
  } catch (error) {
    if (error instanceof ResidentServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};

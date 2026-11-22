import type { RequestHandler } from "express";
import { createBarangaySchema } from "../lib/validation/barangay.validation.js";
import {
  BarangayServiceError,
  createNewBarangay,
  listBarangayManagementSummary,
  listBarangays,
} from "../services/barangay.service.js";

export const getBarangaysController: RequestHandler = async (_req, res, next) => {
  try {
    const barangayList = await listBarangays();
    res.status(200).json({ data: barangayList });
  } catch (error) {
    next(error);
  }
};

export const getBarangayManagementSummaryController: RequestHandler = async (_req, res, next) => {
  try {
    const data = await listBarangayManagementSummary();
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const createBarangayController: RequestHandler = async (req, res, next) => {
  try {
    const result = createBarangaySchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: "Invalid barangay data",
        issues: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const barangay = await createNewBarangay(result.data.name);
    res.status(201).json({ data: barangay });
  } catch (error) {
    if (error instanceof BarangayServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    next(error);
  }
};

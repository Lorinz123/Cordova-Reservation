import type { RequestHandler } from "express";
import { getCurrentUser } from "../services/auth.service.js";
import { createEquipmentSchema } from "../lib/validation/equipment.validation.js";
import { createBarangayEquipment, editBarangayEquipment, EquipmentServiceError, listActiveEquipment, removeBarangayEquipment } from "../services/equipment.service.js";
import { updateEquipmentSchema } from "../lib/validation/equipment.validation.js";

export const getEquipmentController: RequestHandler = async (_req, res, next) => {
  try {
    const auth = res.locals.auth as { role: string; barangayId: string | null } | undefined;
    const barangayId = !auth || auth.role === "super_admin" ? undefined : auth.barangayId;
    const items = await listActiveEquipment(barangayId);
    res.status(200).json({ data: items });
  } catch (error) {
    next(error);
  }
};

export const createEquipmentController: RequestHandler = async (req, res, next) => {
  const parsed = createEquipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid equipment details.",
      issues: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
    return;
  }
  try {
    const auth = res.locals.auth as { userId: string };
    const user = await getCurrentUser(auth.userId);
    if (!user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }
    const item = await createBarangayEquipment({ ...parsed.data, barangayId: user.barangayId });
    res.status(201).json({ data: item });
  } catch (error) {
    if (error instanceof EquipmentServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const updateEquipmentController: RequestHandler = async (req, res, next) => {
  const parsed = updateEquipmentSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid equipment details.", issues: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) }); return; }
  try {
    const auth = res.locals.auth as { userId: string };
    const user = await getCurrentUser(auth.userId);
    if (!user) { res.status(401).json({ error: "Authentication required." }); return; }
    const item = await editBarangayEquipment({ ...parsed.data, id: String(req.params.id), barangayId: user.barangayId });
    res.status(200).json({ data: item });
  } catch (error) { if (error instanceof EquipmentServiceError) { res.status(error.statusCode).json({ error: error.message }); return; } next(error); }
};

export const deleteEquipmentController: RequestHandler = async (req, res, next) => {
  try {
    const auth = res.locals.auth as { userId: string };
    const user = await getCurrentUser(auth.userId);
    if (!user) { res.status(401).json({ error: "Authentication required." }); return; }
    await removeBarangayEquipment(String(req.params.id), user.barangayId);
    res.status(200).json({ message: "Equipment removed from the catalogue." });
  } catch (error) { if (error instanceof EquipmentServiceError) { res.status(error.statusCode).json({ error: error.message }); return; } next(error); }
};

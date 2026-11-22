import { archiveEquipmentByBarangay, findActiveEquipment, insertEquipment, updateEquipmentByBarangay } from "../repositories/equipment.repository.js";
import type { z } from "zod";
import type { createEquipmentSchema, updateEquipmentSchema } from "../lib/validation/equipment.validation.js";

export class EquipmentServiceError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "EquipmentServiceError";
  }
}

export async function listActiveEquipment(barangayId?: string | null) {
  return findActiveEquipment(barangayId);
}

export async function createBarangayEquipment(input: z.infer<typeof createEquipmentSchema> & { barangayId: string | null }) {
  if (!input.barangayId) throw new EquipmentServiceError(403, "Your account is not assigned to a barangay.");
  return insertEquipment({ ...input, barangayId: input.barangayId });
}

export async function editBarangayEquipment(input: z.infer<typeof updateEquipmentSchema> & { id: string; barangayId: string | null }) {
  if (!input.barangayId) throw new EquipmentServiceError(403, "Your account is not assigned to a barangay.");
  const item = await updateEquipmentByBarangay({ ...input, barangayId: input.barangayId });
  if (!item) throw new EquipmentServiceError(404, "Equipment was not found in your barangay.");
  return item;
}

export async function removeBarangayEquipment(id: string, barangayId: string | null) {
  if (!barangayId) throw new EquipmentServiceError(403, "Your account is not assigned to a barangay.");
  const item = await archiveEquipmentByBarangay(id, barangayId);
  if (!item) throw new EquipmentServiceError(404, "Equipment was not found in your barangay.");
}

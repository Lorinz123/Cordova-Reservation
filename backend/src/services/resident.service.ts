import { findResidentsByBarangay } from "../repositories/resident.repository.js";

export class ResidentServiceError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ResidentServiceError";
  }
}

export async function listBarangayResidents(barangayId: string | null) {
  if (!barangayId) throw new ResidentServiceError(403, "Your account is not assigned to a barangay.");
  return findResidentsByBarangay(barangayId);
}

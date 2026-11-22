import {
  createBarangay,
  findAllBarangays,
  findBarangayManagementSummary,
  findBarangayByName,
} from "../repositories/barangay.repository.js";

export async function listBarangays() {
  return findAllBarangays();
}

export async function listBarangayManagementSummary() {
  return findBarangayManagementSummary();
}

export class BarangayServiceError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "BarangayServiceError";
  }
}

export async function createNewBarangay(name: string) {
  const existingBarangay = await findBarangayByName(name);

  if (existingBarangay) {
    throw new BarangayServiceError(409, "That barangay already exists.");
  }

  return createBarangay(name);
}

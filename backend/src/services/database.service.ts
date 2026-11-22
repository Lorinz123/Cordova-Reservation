import { checkDatabaseConnection } from "../repositories/database.repository.js";

export async function checkDatabaseService(): Promise<void> {
  await checkDatabaseConnection();
}
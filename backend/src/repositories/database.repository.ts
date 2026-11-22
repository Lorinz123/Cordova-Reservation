import { sql } from "drizzle-orm";
import { db } from "../db/index.js";

export async function checkDatabaseConnection(): Promise<void> {
  await db.execute(sql`select 1`);
}
import { and, asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../schema/index.js";

export async function findResidentsByBarangay(barangayId: string) {
  return db.select({
    id: users.id,
    fullName: users.fullName,
    email: users.email,
    phoneNumber: users.phoneNumber,
    addressLine: users.addressLine,
    subdivision: users.subdivision,
    postalCode: users.postalCode,
    emailVerifiedAt: users.emailVerifiedAt,
    createdAt: users.createdAt,
  }).from(users)
    .where(and(eq(users.barangayId, barangayId), eq(users.role, "resident")))
    .orderBy(asc(users.fullName));
}

import { and, asc, count, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { barangays, equipment, reservations, users } from "../schema/index.js";

export async function findAllBarangays() {
  return db.select().from(barangays).orderBy(asc(barangays.name));
}

export async function findBarangayManagementSummary() {
  const [communities, residentCounts, equipmentCounts, requestCounts] = await Promise.all([
    db.select({
      id: barangays.id,
      name: barangays.name,
      createdAt: barangays.createdAt,
      adminId: users.id,
      adminName: users.fullName,
      adminEmail: users.email,
    }).from(barangays)
      .leftJoin(users, and(eq(users.barangayId, barangays.id), eq(users.role, "barangay_admin")))
      .orderBy(asc(barangays.name)),
    db.select({ barangayId: users.barangayId, total: count() }).from(users)
      .where(eq(users.role, "resident")).groupBy(users.barangayId),
    db.select({ barangayId: equipment.barangayId, total: count() }).from(equipment)
      .where(eq(equipment.isActive, true)).groupBy(equipment.barangayId),
    db.select({ barangayId: equipment.barangayId, total: count() }).from(reservations)
      .innerJoin(equipment, eq(reservations.equipmentId, equipment.id))
      .groupBy(equipment.barangayId),
  ]);
  const toMap = (rows: { barangayId: string | null; total: number }[]) => new Map(rows.map((row) => [row.barangayId, row.total]));
  const residentsByBarangay = toMap(residentCounts);
  const equipmentByBarangay = toMap(equipmentCounts);
  const requestsByBarangay = toMap(requestCounts);
  return communities.map((community) => ({
    ...community,
    residentCount: residentsByBarangay.get(community.id) ?? 0,
    equipmentCount: equipmentByBarangay.get(community.id) ?? 0,
    requestCount: requestsByBarangay.get(community.id) ?? 0,
  }));
}

export async function findBarangayByName(name: string) {
  const [barangay] = await db
    .select()
    .from(barangays)
    .where(eq(barangays.name, name))
    .limit(1);

  return barangay ?? null;
}

export async function findBarangayById(id: string) {
  const [barangay] = await db.select().from(barangays).where(eq(barangays.id, id)).limit(1);
  return barangay ?? null;
}

export async function createBarangay(name: string) {
  const [barangay] = await db
    .insert(barangays)
    .values({ name })
    .returning();

  if (!barangay) {
    throw new Error("Barangay creation did not return a record.");
  }

  return barangay;
}

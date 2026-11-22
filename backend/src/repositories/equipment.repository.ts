import { and, asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { barangays, equipment } from "../schema/index.js";

export async function findActiveEquipment(barangayId?: string | null) {
  if (barangayId === null) return [];
  const filters = [eq(equipment.isActive, true)];
  if (barangayId) filters.push(eq(equipment.barangayId, barangayId));
  return db
    .select({
      id: equipment.id,
      barangayId: equipment.barangayId,
      barangayName: barangays.name,
      name: equipment.name,
      description: equipment.description,
      imageData: equipment.imageData,
      totalQuantity: equipment.totalQuantity,
      createdAt: equipment.createdAt,
    })
    .from(equipment)
    .innerJoin(barangays, eq(equipment.barangayId, barangays.id))
    .where(and(...filters))
    .orderBy(asc(equipment.name));
}

export async function insertEquipment(input: {
  barangayId: string;
  name: string;
  description?: string;
  imageData: string;
  totalQuantity: number;
}) {
  const [item] = await db.insert(equipment).values({
    ...input,
    description: input.description || null,
  }).returning();
  if (!item) throw new Error("Equipment creation did not return a record.");
  return item;
}

export async function updateEquipmentByBarangay(input: {
  id: string;
  barangayId: string;
  name?: string;
  description?: string;
  imageData?: string;
  totalQuantity?: number;
}) {
  const [item] = await db.update(equipment)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.imageData !== undefined ? { imageData: input.imageData } : {}),
      ...(input.totalQuantity !== undefined ? { totalQuantity: input.totalQuantity } : {}),
    })
    .where(and(eq(equipment.id, input.id), eq(equipment.barangayId, input.barangayId), eq(equipment.isActive, true)))
    .returning();
  return item;
}

export async function archiveEquipmentByBarangay(id: string, barangayId: string) {
  const [item] = await db.update(equipment)
    .set({ isActive: false })
    .where(and(eq(equipment.id, id), eq(equipment.barangayId, barangayId), eq(equipment.isActive, true)))
    .returning({ id: equipment.id });
  return item;
}

import { and, desc, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { barangays, equipment, notifications, reservations, users } from "../schema/index.js";

const blockingStatuses = ["pending", "approved"] as const;

export async function findReservationsForUser(userId: string) {
  return db.select({
    id: reservations.id,
    equipmentId: reservations.equipmentId,
    equipmentName: equipment.name,
    barangayId: equipment.barangayId,
    barangayName: barangays.name,
    requesterId: reservations.requesterId,
    requesterName: users.fullName,
    requesterEmail: users.email,
    requesterPhone: users.phoneNumber,
    quantity: reservations.quantity,
    startsAt: reservations.startsAt,
    endsAt: reservations.endsAt,
    purpose: reservations.purpose,
    status: reservations.status,
    reviewNote: reservations.reviewNote,
    createdAt: reservations.createdAt,
  }).from(reservations)
    .innerJoin(equipment, eq(reservations.equipmentId, equipment.id))
    .innerJoin(barangays, eq(equipment.barangayId, barangays.id))
    .innerJoin(users, eq(reservations.requesterId, users.id))
    .where(eq(reservations.requesterId, userId))
    .orderBy(desc(reservations.createdAt));
}

export async function findReservationsForBarangay(barangayId: string) {
  return db.select({
    id: reservations.id,
    equipmentId: reservations.equipmentId,
    equipmentName: equipment.name,
    barangayId: equipment.barangayId,
    barangayName: barangays.name,
    requesterId: reservations.requesterId,
    requesterName: users.fullName,
    requesterEmail: users.email,
    requesterPhone: users.phoneNumber,
    quantity: reservations.quantity,
    startsAt: reservations.startsAt,
    endsAt: reservations.endsAt,
    purpose: reservations.purpose,
    status: reservations.status,
    reviewNote: reservations.reviewNote,
    createdAt: reservations.createdAt,
  }).from(reservations)
    .innerJoin(equipment, eq(reservations.equipmentId, equipment.id))
    .innerJoin(barangays, eq(equipment.barangayId, barangays.id))
    .innerJoin(users, eq(reservations.requesterId, users.id))
    .where(eq(equipment.barangayId, barangayId))
    .orderBy(desc(reservations.createdAt));
}

export async function findAllReservations() {
  return db.select({
    id: reservations.id,
    equipmentId: reservations.equipmentId,
    equipmentName: equipment.name,
    barangayId: equipment.barangayId,
    barangayName: barangays.name,
    requesterId: reservations.requesterId,
    requesterName: users.fullName,
    requesterEmail: users.email,
    requesterPhone: users.phoneNumber,
    quantity: reservations.quantity,
    startsAt: reservations.startsAt,
    endsAt: reservations.endsAt,
    purpose: reservations.purpose,
    status: reservations.status,
    reviewNote: reservations.reviewNote,
    createdAt: reservations.createdAt,
  }).from(reservations)
    .innerJoin(equipment, eq(reservations.equipmentId, equipment.id))
    .innerJoin(barangays, eq(equipment.barangayId, barangays.id))
    .innerJoin(users, eq(reservations.requesterId, users.id))
    .orderBy(desc(reservations.createdAt));
}

export async function insertReservation(input: {
  equipmentId: string;
  requesterId: string;
  quantity: number;
  startsAt: Date;
  endsAt: Date;
  purpose: string;
  requesterBarangayId: string;
}) {
  return db.transaction(async (tx) => {
    const [item] = await tx.select({
      id: equipment.id,
      barangayId: equipment.barangayId,
      totalQuantity: equipment.totalQuantity,
      isActive: equipment.isActive,
    }).from(equipment).where(eq(equipment.id, input.equipmentId)).for("update").limit(1);

    if (!item || !item.isActive) return { error: "unavailable-equipment" as const };
    if (item.barangayId !== input.requesterBarangayId) return { error: "wrong-barangay" as const };

    const [reserved] = await tx.select({
      quantity: sql<number>`coalesce(sum(${reservations.quantity}), 0)::int`,
    }).from(reservations).where(and(
      eq(reservations.equipmentId, input.equipmentId),
      inArray(reservations.status, [...blockingStatuses]),
      lt(reservations.startsAt, input.endsAt),
      gt(reservations.endsAt, input.startsAt),
    ));

    if ((reserved?.quantity ?? 0) + input.quantity > item.totalQuantity) {
      return { error: "insufficient-availability" as const };
    }

    const [reservation] = await tx.insert(reservations).values({
      equipmentId: input.equipmentId,
      requesterId: input.requesterId,
      quantity: input.quantity,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      purpose: input.purpose,
    }).returning({ id: reservations.id });
    if (!reservation) throw new Error("Reservation creation did not return a record.");
    return { reservationId: reservation.id };
  });
}

export async function insertReservationBatch(input: {
  items: { equipmentId: string; quantity: number }[];
  requesterId: string;
  startsAt: Date;
  endsAt: Date;
  purpose: string;
  requesterBarangayId: string;
}) {
  return db.transaction(async (tx) => {
    // Lock equipment rows in a stable order so overlapping multi-item requests
    // cannot overbook inventory or acquire locks in conflicting order.
    const ids = [...input.items.map((item) => item.equipmentId)].sort();
    const locked = new Map<string, { barangayId: string; totalQuantity: number; isActive: boolean }>();
    for (const id of ids) {
      const [item] = await tx.select({
        id: equipment.id,
        barangayId: equipment.barangayId,
        totalQuantity: equipment.totalQuantity,
        isActive: equipment.isActive,
      }).from(equipment).where(eq(equipment.id, id)).for("update").limit(1);
      if (!item || !item.isActive) return { error: "unavailable-equipment" as const };
      if (item.barangayId !== input.requesterBarangayId) return { error: "wrong-barangay" as const };
      locked.set(id, item);
    }

    for (const requested of input.items) {
      const item = locked.get(requested.equipmentId);
      if (!item) return { error: "unavailable-equipment" as const };
      const [reserved] = await tx.select({
        quantity: sql<number>`coalesce(sum(${reservations.quantity}), 0)::int`,
      }).from(reservations).where(and(
        eq(reservations.equipmentId, requested.equipmentId),
        inArray(reservations.status, [...blockingStatuses]),
        lt(reservations.startsAt, input.endsAt),
        gt(reservations.endsAt, input.startsAt),
      ));
      if ((reserved?.quantity ?? 0) + requested.quantity > item.totalQuantity) {
        return { error: "insufficient-availability" as const };
      }
    }

    const created = await tx.insert(reservations).values(input.items.map((item) => ({
      equipmentId: item.equipmentId,
      requesterId: input.requesterId,
      quantity: item.quantity,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      purpose: input.purpose,
    }))).returning({ id: reservations.id });
    return { reservationIds: created.map((item) => item.id) };
  });
}

export async function cancelReservation(reservationId: string, requesterId: string) {
  const [reservation] = await db.update(reservations)
    .set({ status: "cancelled" })
    .where(and(
      eq(reservations.id, reservationId),
      eq(reservations.requesterId, requesterId),
      eq(reservations.status, "pending"),
    ))
    .returning({ id: reservations.id });
  return reservation ?? null;
}

export async function reviewReservation(input: {
  reservationId: string;
  reviewerId: string;
  barangayId: string | null;
  status: "approved" | "rejected";
  reviewNote?: string;
}) {
  return db.transaction(async (tx) => {
    const [target] = await tx.select({
      id: reservations.id,
      status: reservations.status,
      barangayId: equipment.barangayId,
      requesterId: reservations.requesterId,
      equipmentName: equipment.name,
      startsAt: reservations.startsAt,
    }).from(reservations)
      .innerJoin(equipment, eq(reservations.equipmentId, equipment.id))
      .where(eq(reservations.id, input.reservationId))
      .for("update");

    if (!target || (input.barangayId && target.barangayId !== input.barangayId)) {
      return { error: "not-found" as const };
    }
    if (target.status !== "pending") return { error: "already-reviewed" as const };

    const [updated] = await tx.update(reservations)
      .set({ status: input.status, reviewNote: input.reviewNote || null, reviewedBy: input.reviewerId })
      .where(and(eq(reservations.id, input.reservationId), eq(reservations.status, "pending")))
      .returning({ id: reservations.id });

    if (updated) {
      const decision = input.status === "approved" ? "approved" : "declined";
      await tx.insert(notifications).values({
        userId: target.requesterId,
        reservationId: target.id,
        title: `Reservation ${decision}`,
        message: `Your request for ${target.equipmentName}, starting ${target.startsAt.toLocaleString()}, was ${decision}.${input.reviewNote ? ` Note: ${input.reviewNote}` : ""}`,
      });
    }

    return updated ? { reservationId: updated.id } : { error: "already-reviewed" as const };
  });
}

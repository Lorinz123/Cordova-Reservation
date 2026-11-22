import type { UserRole } from "../types/auth.types.js";
import type { CreateReservationInput } from "../types/reservation.types.js";
import {
  cancelReservation as cancelReservationRecord,
  findAllReservations,
  findReservationsForBarangay,
  findReservationsForUser,
  insertReservation,
  insertReservationBatch,
  reviewReservation as reviewReservationRecord,
} from "../repositories/reservation.repository.js";

export class ReservationServiceError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ReservationServiceError";
  }
}

function cordovaDateKey(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function calendarDayDistance(start: Date, end: Date) {
  const dayNumber = (date: Date) => Date.parse(`${cordovaDateKey(date)}T00:00:00Z`);
  return Math.round((dayNumber(end) - dayNumber(start)) / 86_400_000);
}

export async function listReservations(input: { userId: string; role: UserRole; barangayId: string | null }) {
  if (input.role === "resident") return findReservationsForUser(input.userId);
  if (input.role === "super_admin") return findAllReservations();
  if (!input.barangayId) throw new ReservationServiceError(403, "Your account is not assigned to a barangay.");
  return findReservationsForBarangay(input.barangayId);
}

export async function createReservation(input: CreateReservationInput & { requesterId: string; addressLine: string | null; requesterBarangayId: string | null }) {
  if (!input.addressLine?.trim()) {
    throw new ReservationServiceError(403, "Complete your home address in Profile before requesting equipment.");
  }
  if (!input.requesterBarangayId) {
    throw new ReservationServiceError(403, "Choose your barangay in Profile before requesting equipment.");
  }
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (startsAt <= new Date()) {
    throw new ReservationServiceError(400, "Choose a start time in the future.");
  }
  const daysUntilStart = calendarDayDistance(new Date(), startsAt);
  if (daysUntilStart < 7) throw new ReservationServiceError(400, "Reservations must start at least 7 days from today.");
  if (calendarDayDistance(startsAt, endsAt) > 14) throw new ReservationServiceError(400, "The end date can be no more than 14 days after the start date.");
  const result = await insertReservation({
    equipmentId: input.equipmentId,
    requesterId: input.requesterId,
    quantity: input.quantity,
    purpose: input.purpose,
    startsAt,
    endsAt,
    requesterBarangayId: input.requesterBarangayId,
  });
  if ("error" in result) {
    if (result.error === "unavailable-equipment") throw new ReservationServiceError(404, "That equipment is not available.");
    if (result.error === "wrong-barangay") throw new ReservationServiceError(403, "You can only request equipment from your assigned barangay.");
    throw new ReservationServiceError(409, "There isn’t enough equipment available for those dates.");
  }
  return result;
}

export async function createReservationBatch(input: {
  items: { equipmentId: string; quantity: number }[];
  startsAt: string;
  endsAt: string;
  purpose: string;
  requesterId: string;
  addressLine: string | null;
  requesterBarangayId: string | null;
}) {
  if (!input.addressLine?.trim()) throw new ReservationServiceError(403, "Complete your home address in Profile before requesting equipment.");
  if (!input.requesterBarangayId) throw new ReservationServiceError(403, "Choose your barangay in Profile before requesting equipment.");
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (startsAt <= new Date()) throw new ReservationServiceError(400, "Choose a start time in the future.");
  const daysUntilStart = calendarDayDistance(new Date(), startsAt);
  if (daysUntilStart < 7) throw new ReservationServiceError(400, "Reservations must start at least 7 days from today.");
  if (calendarDayDistance(startsAt, endsAt) > 14) throw new ReservationServiceError(400, "The end date can be no more than 14 days after the start date.");
  const result = await insertReservationBatch({
    items: input.items,
    requesterId: input.requesterId,
    startsAt,
    endsAt,
    purpose: input.purpose,
    requesterBarangayId: input.requesterBarangayId,
  });
  if ("error" in result) {
    if (result.error === "unavailable-equipment") throw new ReservationServiceError(404, "One of the selected equipment items is no longer available.");
    if (result.error === "wrong-barangay") throw new ReservationServiceError(403, "You can only request equipment from your assigned barangay.");
    throw new ReservationServiceError(409, "There isn’t enough equipment available for one or more selected items on those dates. Nothing was submitted.");
  }
  return result;
}

export async function cancelOwnReservation(reservationId: string, requesterId: string) {
  const result = await cancelReservationRecord(reservationId, requesterId);
  if (!result) throw new ReservationServiceError(409, "Only your pending reservations can be cancelled.");
  return result;
}

export async function reviewBarangayReservation(input: {
  reservationId: string;
  reviewerId: string;
  role: UserRole;
  barangayId: string | null;
  status: "approved" | "rejected";
  reviewNote?: string;
}) {
  if (input.role !== "super_admin" && !input.barangayId) {
    throw new ReservationServiceError(403, "Your account is not assigned to a barangay.");
  }
  const result = await reviewReservationRecord(input);
  if ("error" in result) {
    if (result.error === "not-found") throw new ReservationServiceError(404, "Reservation not found.");
    throw new ReservationServiceError(409, "This reservation has already been reviewed.");
  }
  return result;
}

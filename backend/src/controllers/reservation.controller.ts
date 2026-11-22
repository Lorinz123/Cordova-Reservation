import type { RequestHandler } from "express";
import { getCurrentUser } from "../services/auth.service.js";
import {
  cancelOwnReservation,
  createReservation,
  createReservationBatch,
  listReservations,
  ReservationServiceError,
  reviewBarangayReservation,
} from "../services/reservation.service.js";
import {
  createReservationSchema,
  createReservationBatchSchema,
  reservationIdSchema,
  reviewReservationSchema,
} from "../lib/validation/reservation.validation.js";
import type { UserRole } from "../types/auth.types.js";

async function currentAuth(res: Parameters<RequestHandler>[1]) {
  const auth = res.locals.auth as { userId: string; role: UserRole };
  const user = await getCurrentUser(auth.userId);
  if (!user) throw new ReservationServiceError(401, "Authentication required.");
  return { ...auth, barangayId: user.barangayId, addressLine: user.addressLine };
}

function sendError(error: unknown, next: Parameters<RequestHandler>[2]) {
  if (error instanceof ReservationServiceError) {
    return { statusCode: error.statusCode, message: error.message };
  }
  next(error);
  return null;
}

export const listReservationsController: RequestHandler = async (_req, res, next) => {
  try {
    const auth = await currentAuth(res);
    const data = await listReservations(auth);
    res.status(200).json({ data });
  } catch (error) {
    const response = sendError(error, next);
    if (response) res.status(response.statusCode).json({ error: response.message });
  }
};

export const createReservationController: RequestHandler = async (req, res, next) => {
  const parsed = createReservationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid reservation details.",
      issues: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
    return;
  }
  try {
    const auth = await currentAuth(res);
    const reservation = await createReservation({ ...parsed.data, requesterId: auth.userId, addressLine: auth.addressLine, requesterBarangayId: auth.barangayId });
    res.status(201).json({ data: reservation });
  } catch (error) {
    const response = sendError(error, next);
    if (response) res.status(response.statusCode).json({ error: response.message });
  }
};

export const createReservationBatchController: RequestHandler = async (req, res, next) => {
  const parsed = createReservationBatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid reservation request.",
      issues: parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
    return;
  }
  try {
    const auth = await currentAuth(res);
    const result = await createReservationBatch({
      ...parsed.data,
      requesterId: auth.userId,
      addressLine: auth.addressLine,
      requesterBarangayId: auth.barangayId,
    });
    res.status(201).json({ data: result, message: `Request submitted for ${result.reservationIds.length} equipment item${result.reservationIds.length === 1 ? "" : "s"}.` });
  } catch (error) {
    const response = sendError(error, next);
    if (response) res.status(response.statusCode).json({ error: response.message });
  }
};

export const cancelReservationController: RequestHandler = async (req, res, next) => {
  const parsedId = reservationIdSchema.safeParse(req.params.reservationId);
  if (!parsedId.success) {
    res.status(400).json({ error: "Invalid reservation id." });
    return;
  }
  try {
    const auth = await currentAuth(res);
    const result = await cancelOwnReservation(parsedId.data, auth.userId);
    res.status(200).json({ data: result });
  } catch (error) {
    const response = sendError(error, next);
    if (response) res.status(response.statusCode).json({ error: response.message });
  }
};

export const reviewReservationController: RequestHandler = async (req, res, next) => {
  const parsedId = reservationIdSchema.safeParse(req.params.reservationId);
  const parsedBody = reviewReservationSchema.safeParse(req.body);
  if (!parsedId.success || !parsedBody.success) {
    res.status(400).json({ error: "Provide a valid reservation and review decision." });
    return;
  }
  try {
    const auth = await currentAuth(res);
    const result = await reviewBarangayReservation({
      ...parsedBody.data,
      reservationId: parsedId.data,
      reviewerId: auth.userId,
      role: auth.role,
      barangayId: auth.barangayId,
    });
    res.status(200).json({ data: result });
  } catch (error) {
    const response = sendError(error, next);
    if (response) res.status(response.statusCode).json({ error: response.message });
  }
};

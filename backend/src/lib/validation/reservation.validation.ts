import { z } from "zod";

export const createReservationSchema = z.object({
  equipmentId: z.uuid(),
  quantity: z.number().int().min(1).max(100),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  purpose: z.string().trim().min(5).max(1000),
}).refine((reservation) => new Date(reservation.endsAt) > new Date(reservation.startsAt), {
  path: ["endsAt"],
  message: "End date and time must be after the start date and time.",
});

export const createReservationBatchSchema = z.object({
  items: z.array(z.object({
    equipmentId: z.uuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1).max(3).refine((items) => new Set(items.map((item) => item.equipmentId)).size === items.length, {
    message: "Choose up to 3 different equipment items.",
  }),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  purpose: z.string().trim().min(5).max(1000),
}).refine((reservation) => new Date(reservation.endsAt) > new Date(reservation.startsAt), {
  path: ["endsAt"],
  message: "End date and time must be after the start date and time.",
});

export const reviewReservationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNote: z.string().trim().max(1000).optional(),
});

export const reservationIdSchema = z.uuid();

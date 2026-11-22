import { z } from "zod";

export const createAdminInvitationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  barangayId: z.uuid(),
});

export const invitationTokenSchema = z.object({
  token: z.string().min(40).max(100),
});

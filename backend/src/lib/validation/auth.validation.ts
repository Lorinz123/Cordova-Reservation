import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must be no more than 72 bytes",
  );

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: passwordSchema,
  barangayId: z.uuid(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const verificationEmailSchema = z.object({ email: emailSchema });
export const verificationTokenSchema = z.object({ token: z.string().min(40).max(100) });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

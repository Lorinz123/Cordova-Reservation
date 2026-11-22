import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../schema/index.js";

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}

type NewResident = {
  fullName: string;
  email: string;
  passwordHash: string;
  emailVerificationTokenHash: string;
  emailVerificationExpiresAt: Date;
  barangayId: string;
};

export async function createResidentUser(input: NewResident) {
  const [user] = await db
    .insert(users)
    .values({
      fullName: input.fullName,
      email: input.email,
      passwordHash: input.passwordHash,
      emailVerificationTokenHash: input.emailVerificationTokenHash,
      emailVerificationExpiresAt: input.emailVerificationExpiresAt,
      role: "resident",
      barangayId: input.barangayId,
    })
    .returning({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      barangayId: users.barangayId,
      addressLine: users.addressLine,
      subdivision: users.subdivision,
      postalCode: users.postalCode,
      phoneNumber: users.phoneNumber,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
    });

  if (!user) {
    throw new Error("User creation did not return a record.");
  }

  return user;
}

export async function findUserById(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      barangayId: users.barangayId,
      addressLine: users.addressLine,
      subdivision: users.subdivision,
      postalCode: users.postalCode,
      phoneNumber: users.phoneNumber,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export async function updateUserProfile(userId: string, input: { fullName: string; addressLine: string | null; subdivision: string | null; postalCode: string | null; phoneNumber: string | null; barangayId?: string }) {
  const [user] = await db.update(users).set({
    fullName: input.fullName,
    addressLine: input.addressLine,
    subdivision: input.subdivision,
    postalCode: input.postalCode,
    phoneNumber: input.phoneNumber,
    ...(input.barangayId ? { barangayId: input.barangayId } : {}),
  }).where(eq(users.id, userId)).returning({
    id: users.id,
    fullName: users.fullName,
    email: users.email,
    role: users.role,
    barangayId: users.barangayId,
    addressLine: users.addressLine,
    subdivision: users.subdivision,
    postalCode: users.postalCode,
    phoneNumber: users.phoneNumber,
  });
  return user ?? null;
}

export async function replaceEmailVerificationToken(
  email: string,
  tokenHash: string,
  expiresAt: Date,
) {
  const [user] = await db
    .update(users)
    .set({ emailVerificationTokenHash: tokenHash, emailVerificationExpiresAt: expiresAt })
    .where(and(
      eq(users.email, email),
      eq(users.role, "resident"),
      isNull(users.emailVerifiedAt),
    ))
    .returning({ id: users.id });
  return user ?? null;
}

export async function verifyResidentEmail(tokenHash: string) {
  const [user] = await db
    .update(users)
    .set({
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    })
    .where(and(
      eq(users.emailVerificationTokenHash, tokenHash),
      gt(users.emailVerificationExpiresAt, new Date()),
      isNull(users.emailVerifiedAt),
      eq(users.role, "resident"),
    ))
    .returning({ id: users.id });
  return user ?? null;
}

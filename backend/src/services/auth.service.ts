import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { sendResidentVerificationEmail } from "../config/email.config.js";
import { jwtConfig } from "../config/auth.config.js";
import type {
  LoginInput,
  RegisterInput,
} from "../lib/validation/auth.validation.js";
import {
  createResidentUser,
  findUserByEmail,
  findUserById,
  replaceEmailVerificationToken,
  verifyResidentEmail as verifyResidentEmailRecord,
  updateUserProfile,
} from "../repositories/auth.repository.js";


export class AuthServiceError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

type StoredUser = NonNullable<Awaited<ReturnType<typeof findUserByEmail>>>;
const VERIFICATION_LIFETIME_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createToken(userId: string, role: string): string {
  return jwt.sign({ role }, jwtConfig.secret, {
    subject: userId,
    expiresIn: jwtConfig.expiresIn,
  });
}

function toPublicUser(user: StoredUser) {
  const {
    passwordHash: _passwordHash,
    emailVerificationTokenHash: _tokenHash,
    emailVerificationExpiresAt: _tokenExpiry,
    ...publicUser
  } = user;
  return publicUser;
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AuthServiceError(409, "That email is already registered.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const verificationToken = randomBytes(32).toString("base64url");
  const user = await createResidentUser({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    emailVerificationTokenHash: hashToken(verificationToken),
    emailVerificationExpiresAt: new Date(Date.now() + VERIFICATION_LIFETIME_MS),
    barangayId: input.barangayId,
  });

  try {
    await sendResidentVerificationEmail({
      to: user.email,
      fullName: user.fullName,
      token: verificationToken,
    });
  } catch {
    console.error("Resident verification email could not be sent.");
    throw new AuthServiceError(
      503,
      "Your account was created, but the verification email could not be sent. Request a new verification email and try again.",
    );
  }

  return { user };
}

export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AuthServiceError(401, "Invalid email or password.");
  }

  if (user.role === "resident" && !user.emailVerifiedAt) {
    throw new AuthServiceError(
      403,
      "Verify your email before signing in. Check your inbox or request a new verification email.",
    );
  }

  return {
    user: toPublicUser(user),
    token: createToken(user.id, user.role),
  };
}

export async function resendResidentVerificationEmail(email: string) {
  const user = await findUserByEmail(email);
  if (!user || user.role !== "resident" || user.emailVerifiedAt) return;

  const token = randomBytes(32).toString("base64url");
  const updatedUser = await replaceEmailVerificationToken(
    user.email,
    hashToken(token),
    new Date(Date.now() + VERIFICATION_LIFETIME_MS),
  );
  if (!updatedUser) return;

  try {
    await sendResidentVerificationEmail({ to: user.email, fullName: user.fullName, token });
  } catch {
    console.error("Resident verification email could not be sent.");
    throw new AuthServiceError(503, "The verification email could not be sent. Check the mail settings and try again.");
  }
}

export async function verifyResidentEmail(token: string) {
  const user = await verifyResidentEmailRecord(hashToken(token));
  if (!user) {
    throw new AuthServiceError(410, "This verification link is invalid, expired, or already used.");
  }
}

export async function getCurrentUser(userId: string) {
  return findUserById(userId);
}

export async function updateCurrentUserProfile(userId: string, input: { fullName: string; addressLine: string | null; subdivision: string | null; postalCode: string | null; phoneNumber: string | null; barangayId?: string }) {
  return updateUserProfile(userId, { ...input, fullName: input.fullName.trim() });
}

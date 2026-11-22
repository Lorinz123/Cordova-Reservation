import "dotenv/config";
import type { Request, RequestHandler, Response } from "express";
import { generateCsrfToken } from "../config/csrf.config.js";
import {
  loginSchema,
  registerSchema,
  verificationEmailSchema,
} from "../lib/validation/auth.validation.js";
import {
  AuthServiceError,
  getCurrentUser,
  loginUser,
  resendResidentVerificationEmail,
  registerUser,
} from "../services/auth.service.js";

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function setAuthCookieAndCsrfToken(
  req: Request,
  res: Response,
  token: string,
): string {
  res.cookie("auth_token", token, authCookieOptions);
  req.cookies = { ...(req.cookies ?? {}), auth_token: token };

  return generateCsrfToken(req, res, { overwrite: true });
}

export const registerController: RequestHandler = async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid registration data",
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const result = await registerUser(parsed.data);
    res.status(201).json({
      message: "Account created. Check your email to verify it before signing in.",
      data: result.user,
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    next(error);
  }
};

export const resendVerificationEmailController: RequestHandler = async (req, res, next) => {
  const parsed = verificationEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }

  try {
    await resendResidentVerificationEmail(parsed.data.email);
    res.status(202).json({
      message: "If this address has an unverified resident account, a new verification email has been sent.",
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid login data",
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const result = await loginUser(parsed.data);
    const csrfToken = setAuthCookieAndCsrfToken(req, res, result.token);

    res.status(200).json({ data: result.user, csrfToken });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    next(error);
  }
};

export const logoutController: RequestHandler = (req, res) => {
  res.clearCookie("auth_token", authCookieOptions);
  req.cookies = { ...(req.cookies ?? {}) };
  delete req.cookies.auth_token;

  const csrfToken = generateCsrfToken(req, res, { overwrite: true });
  res.status(200).json({ message: "Logged out.", csrfToken });
};

export const currentUserController: RequestHandler = async (_req, res, next) => {
  try {
    const auth = res.locals.auth as { userId: string };
    const user = await getCurrentUser(auth.userId);

    if (!user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

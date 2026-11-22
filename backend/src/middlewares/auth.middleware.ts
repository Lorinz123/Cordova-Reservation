import jwt from "jsonwebtoken";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { jwtConfig } from "../config/auth.config.js";
import { findUserById } from "../repositories/auth.repository.js";

const userRoles = [
  "super_admin",
  "barangay_admin",
  "barangay_staff",
  "resident",
] as const;
type UserRole = (typeof userRoles)[number];

async function authenticate(req: Request, res: Response, next: NextFunction, optional: boolean) {
  const token = req.cookies?.auth_token;

  if (!token) {
    if (optional) {
      next();
      return;
    }
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(token, jwtConfig.secret, {
      algorithms: ["HS256"],
    });
  } catch {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  if (typeof payload === "string" || typeof payload.sub !== "string") {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const user = await findUserById(payload.sub);
    if (!user || !userRoles.includes(user.role as UserRole)) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    res.locals.auth = { userId: user.id, role: user.role as UserRole, barangayId: user.barangayId };
    next();
  } catch (error) {
    next(error);
  }
}

export const requireAuth: RequestHandler = (req, res, next) => authenticate(req, res, next, false);
export const optionalAuth: RequestHandler = (req, res, next) => authenticate(req, res, next, true);

export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (_req, res, next) => {
    const auth = res.locals.auth as { role?: UserRole } | undefined;

    if (!auth) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    if (!allowedRoles.includes(auth.role as UserRole)) {
      res.status(403).json({ error: "You do not have permission to do that." });
      return;
    }

    next();
  };
}

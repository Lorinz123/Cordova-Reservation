import "dotenv/config";
import { doubleCsrf } from "csrf-csrf";

const secret = process.env.CSRF_SECRET;

if (!secret || secret.length < 64) {
  throw new Error("CSRF_SECRET must be set to the generated secret.");
}

const isProduction = process.env.NODE_ENV === "production";

export const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => secret,
  getSessionIdentifier: (req) => req.cookies?.auth_token ?? "anonymous",
  cookieName: isProduction ? "__Host-csrf-token" : "csrf_token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  },
});
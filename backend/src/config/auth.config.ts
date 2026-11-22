import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 64) {
  throw new Error("JWT_SECRET must be set to the generated secret.");
}

const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

export const jwtConfig: {
  secret: string;
  expiresIn: SignOptions["expiresIn"];
} = {
  secret,
  expiresIn: expiresIn as SignOptions["expiresIn"],
};
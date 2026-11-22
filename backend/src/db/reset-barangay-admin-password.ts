import "dotenv/config";
import bcrypt from "bcrypt";
import { Pool } from "pg";

const email = process.env.BARANGAY_ADMIN_EMAIL?.trim().toLowerCase();
const newPassword = process.env.BARANGAY_ADMIN_NEW_PASSWORD;
const connectionString = process.env.DATABASE_URL;

if (!email || !newPassword || !connectionString) {
  console.error("Missing reset input or DATABASE_URL.");
  process.exitCode = 1;
} else if (newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
  console.error("Password must be at least 8 characters and no more than 72 bytes.");
  process.exitCode = 1;
} else {
  const pool = new Pool({ connectionString });

  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE lower(email) = $2 AND role = 'barangay_admin'",
      [passwordHash, email],
    );

    if (result.rowCount !== 1) {
      console.error("Password was not changed. Check that this email belongs to a barangay admin.");
      process.exitCode = 1;
    } else {
      console.log("Barangay admin password changed successfully.");
    }
  } catch {
    console.error("Password reset failed. Check the database connection and try again.");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

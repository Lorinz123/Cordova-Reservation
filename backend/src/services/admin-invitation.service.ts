import { createHash, randomBytes } from "node:crypto";
import { sendBarangayAdminInvitationEmail } from "../config/email.config.js";
import {
  acceptAdminInvitation,
  createAdminInvitation,
  findInvitationTarget,
  findPendingInvitation,
  revokeInvitation,
} from "../repositories/admin-invitation.repository.js";

const INVITATION_LIFETIME_MS = 24 * 60 * 60 * 1000;

export class AdminInvitationError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AdminInvitationError";
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function inviteBarangayAdmin(input: {
  fullName: string;
  email: string;
  barangayId: string;
  invitedBy: string;
}) {
  const target = await findInvitationTarget(input.email);
  if (!target) {
    throw new AdminInvitationError(404, "The invited person must register an account first.");
  }
  if (target.role !== "resident" ||
      target.fullName.trim().toLowerCase() !== input.fullName.trim().toLowerCase()) {
    throw new AdminInvitationError(409, "The name and email must match an existing resident account.");
  }

  const token = randomBytes(32).toString("base64url");
  const created = await createAdminInvitation({
    ...input,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + INVITATION_LIFETIME_MS),
  });

  if (!created) throw new AdminInvitationError(404, "Barangay not found.");
  if ("conflict" in created) {
    throw new AdminInvitationError(409, "This barangay already has an admin.");
  }

  try {
    await sendBarangayAdminInvitationEmail({
      to: input.email,
      fullName: input.fullName,
      barangayName: created.barangayName,
      token,
    });
  } catch (error) {
    await revokeInvitation(created.invitationId);
    const mailError = error as { code?: unknown; command?: unknown; responseCode?: unknown };
    console.error("Could not send barangay admin invitation email.", {
      code: mailError.code,
      command: mailError.command,
      responseCode: mailError.responseCode,
    });
    throw new AdminInvitationError(503, "Email could not be sent. Check the SMTP settings and try again.");
  }

  return { fullName: input.fullName, email: input.email, barangayName: created.barangayName };
}

export async function previewAdminInvitation(token: string) {
  const invitation = await findPendingInvitation(hashToken(token));
  if (!invitation) throw new AdminInvitationError(410, "This invitation is invalid or has already been used.");
  if (invitation.expiresAt <= new Date()) {
    throw new AdminInvitationError(410, "This invitation has expired. Ask the super admin to send a new one.");
  }
  return invitation;
}

export async function acceptBarangayAdminInvitation(token: string) {
  const result = await acceptAdminInvitation(hashToken(token));
  if ("error" in result) {
    if (result.error === "expired") {
      throw new AdminInvitationError(410, "This invitation has expired. Ask the super admin to send a new one.");
    }
    if (result.error === "already-admin") {
      throw new AdminInvitationError(409, "This barangay already has an admin.");
    }
    if (result.error === "not-eligible") {
      throw new AdminInvitationError(409, "The invited account is no longer eligible for this invitation.");
    }
    throw new AdminInvitationError(410, "This invitation is invalid or has already been used.");
  }
  return result;
}

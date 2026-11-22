import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { adminInvitations, barangays, users } from "../schema/index.js";

export async function findInvitationTarget(email: string) {
  const [user] = await db
    .select({ id: users.id, fullName: users.fullName, role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user ?? null;
}

export async function createAdminInvitation(input: {
  barangayId: string;
  invitedBy: string;
  fullName: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  return db.transaction(async (tx) => {
    const [barangay] = await tx
      .select({ id: barangays.id, name: barangays.name })
      .from(barangays)
      .where(eq(barangays.id, input.barangayId))
      .for("update");

    if (!barangay) return null;

    const [existingAdmin] = await tx
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.barangayId, input.barangayId), eq(users.role, "barangay_admin")))
      .limit(1);

    if (existingAdmin) {
      return { conflict: "already-admin" as const };
    }

    await tx
      .update(adminInvitations)
      .set({ status: "revoked" })
      .where(and(
        eq(adminInvitations.barangayId, input.barangayId),
        eq(adminInvitations.status, "pending"),
      ));

    const [invitation] = await tx
      .insert(adminInvitations)
      .values({
        barangayId: input.barangayId,
        invitedBy: input.invitedBy,
        fullName: input.fullName,
        email: input.email,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      })
      .returning({ id: adminInvitations.id });

    if (!invitation) throw new Error("Invitation creation did not return a record.");
    return { invitationId: invitation.id, barangayName: barangay.name };
  });
}

export async function revokeInvitation(invitationId: string) {
  await db.update(adminInvitations)
    .set({ status: "revoked" })
    .where(eq(adminInvitations.id, invitationId));
}

export async function findPendingInvitation(tokenHash: string) {
  const [invitation] = await db
    .select({
      id: adminInvitations.id,
      fullName: adminInvitations.fullName,
      email: adminInvitations.email,
      barangayName: barangays.name,
      expiresAt: adminInvitations.expiresAt,
    })
    .from(adminInvitations)
    .innerJoin(barangays, eq(adminInvitations.barangayId, barangays.id))
    .where(and(
      eq(adminInvitations.tokenHash, tokenHash),
      eq(adminInvitations.status, "pending"),
    ))
    .limit(1);
  return invitation ?? null;
}

export async function acceptAdminInvitation(tokenHash: string) {
  return db.transaction(async (tx) => {
    const [invitationReference] = await tx
      .select({ id: adminInvitations.id, barangayId: adminInvitations.barangayId })
      .from(adminInvitations)
      .where(eq(adminInvitations.tokenHash, tokenHash))
      .limit(1);

    if (!invitationReference) {
      return { error: "invalid" as const };
    }

    // Keep row-lock ordering consistent with invitation creation to avoid deadlocks.
    const [barangay] = await tx
      .select({ id: barangays.id, name: barangays.name })
      .from(barangays)
      .where(eq(barangays.id, invitationReference.barangayId))
      .for("update");

    const [invitation] = await tx
      .select()
      .from(adminInvitations)
      .where(eq(adminInvitations.id, invitationReference.id))
      .for("update");

    if (!invitation || invitation.status !== "pending") {
      return { error: "invalid" as const };
    }

    if (invitation.expiresAt <= new Date()) {
      await tx.update(adminInvitations)
        .set({ status: "revoked" })
        .where(eq(adminInvitations.id, invitation.id));
      return { error: "expired" as const };
    }

    const [user] = await tx
      .select({
        id: users.id,
        fullName: users.fullName,
        role: users.role,
        emailVerifiedAt: users.emailVerifiedAt,
      })
      .from(users)
      .where(eq(users.email, invitation.email))
      .for("update");

    if (!barangay || !user || user.role !== "resident" ||
        user.fullName.trim().toLowerCase() !== invitation.fullName.trim().toLowerCase()) {
      await tx.update(adminInvitations)
        .set({ status: "revoked" })
        .where(eq(adminInvitations.id, invitation.id));
      return { error: "not-eligible" as const };
    }

    const [existingAdmin] = await tx
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.barangayId, barangay.id), eq(users.role, "barangay_admin")))
      .limit(1);

    if (existingAdmin) {
      await tx.update(adminInvitations)
        .set({ status: "revoked" })
        .where(eq(adminInvitations.id, invitation.id));
      return { error: "already-admin" as const };
    }

    await tx.update(users)
      .set({
        role: "barangay_admin",
        barangayId: barangay.id,
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      })
      .where(eq(users.id, user.id));
    await tx.update(adminInvitations)
      .set({ status: "accepted", acceptedAt: new Date() })
      .where(eq(adminInvitations.id, invitation.id));

    return { fullName: user.fullName, barangayName: barangay.name };
  });
}

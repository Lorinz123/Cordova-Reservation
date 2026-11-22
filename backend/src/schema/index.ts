import {
  boolean,
  integer,
  index,
  pgEnum,
  pgTable,
  uniqueIndex,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "barangay_admin",
  "barangay_staff",
  "resident",
]);

export const adminInvitationStatusEnum = pgEnum("admin_invitation_status", [
  "pending",
  "accepted",
  "revoked",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const barangays = pgTable("barangays", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  barangayId: uuid("barangay_id").references(() => barangays.id, {
    onDelete: "set null",
  }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  addressLine: text("address_line"),
  subdivision: text("subdivision"),
  postalCode: text("postal_code"),
  phoneNumber: text("phone_number"),
  passwordHash: text("password_hash").notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  emailVerificationTokenHash: text("email_verification_token_hash"),
  emailVerificationExpiresAt: timestamp("email_verification_expires_at", { withTimezone: true }),
  role: userRoleEnum("role").default("resident").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  uniqueIndex("users_one_barangay_admin_per_barangay_idx")
    .on(table.barangayId)
    .where(sql.raw(`"role" = 'barangay_admin'`)),
  uniqueIndex("users_email_verification_token_hash_idx")
    .on(table.emailVerificationTokenHash)
    .where(sql.raw(`"email_verification_token_hash" IS NOT NULL`)),
]);

export const adminInvitations = pgTable("admin_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  barangayId: uuid("barangay_id")
    .notNull()
    .references(() => barangays.id, { onDelete: "cascade" }),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  status: adminInvitationStatusEnum("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  uniqueIndex("admin_invitations_one_pending_per_barangay_idx")
    .on(table.barangayId)
    .where(sql.raw(`"status" = 'pending'`)),
]);

export const equipment = pgTable("equipment", {
  id: uuid("id").defaultRandom().primaryKey(),
  barangayId: uuid("barangay_id")
    .notNull()
    .references(() => barangays.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  description: text("description"),
  imageData: text("image_data"),
  totalQuantity: integer("total_quantity").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  equipmentId: uuid("equipment_id")
    .notNull()
    .references(() => equipment.id, { onDelete: "restrict" }),
  requesterId: uuid("requester_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  quantity: integer("quantity").default(1).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  purpose: text("purpose").notNull(),
  status: reservationStatusEnum("status").default("pending").notNull(),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reservationId: uuid("reservation_id").references(() => reservations.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("notifications_user_created_idx").on(table.userId, table.createdAt)]);

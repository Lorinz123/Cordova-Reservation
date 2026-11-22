DROP INDEX "admin_invitations_one_pending_per_barangay_idx";--> statement-breakpoint
DROP INDEX "users_one_barangay_admin_per_barangay_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "admin_invitations_one_pending_per_barangay_idx" ON "admin_invitations" USING btree ("barangay_id") WHERE "status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX "users_one_barangay_admin_per_barangay_idx" ON "users" USING btree ("barangay_id") WHERE "role" = 'barangay_admin';
CREATE TYPE "public"."admin_invitation_status" AS ENUM('pending', 'accepted', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."user_role_new" AS ENUM('super_admin', 'barangay_admin', 'barangay_staff', 'resident');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."user_role_new" USING (CASE "role"::text WHEN 'admin' THEN 'super_admin' ELSE "role"::text END)::"public"."user_role_new";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'resident';--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
ALTER TYPE "public"."user_role_new" RENAME TO "user_role";--> statement-breakpoint
CREATE TABLE "admin_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barangay_id" uuid NOT NULL,
	"invited_by" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"status" "admin_invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "admin_invitations" ADD CONSTRAINT "admin_invitations_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_invitations" ADD CONSTRAINT "admin_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_invitations_one_pending_per_barangay_idx" ON "admin_invitations" USING btree ("barangay_id") WHERE "status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX "users_one_barangay_admin_per_barangay_idx" ON "users" USING btree ("barangay_id") WHERE "role" = 'barangay_admin';

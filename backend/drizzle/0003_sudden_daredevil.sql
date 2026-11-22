ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_expires_at" timestamp with time zone;--> statement-breakpoint
UPDATE "users" SET "email_verified_at" = "created_at" WHERE "email_verified_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_verification_token_hash_idx" ON "users" USING btree ("email_verification_token_hash") WHERE "email_verification_token_hash" IS NOT NULL;

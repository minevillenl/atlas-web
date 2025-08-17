CREATE TABLE "atlas_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"details" text NOT NULL,
	"backup_data" text,
	"restore_possible" boolean DEFAULT false NOT NULL,
	"restored_at" timestamp,
	"restored_by" text,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp NOT NULL,
	"success" boolean NOT NULL,
	"error_message" text
);
--> statement-breakpoint
ALTER TABLE "atlas_audit_logs" ADD CONSTRAINT "atlas_audit_logs_user_id_atlas_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."atlas_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atlas_audit_logs" ADD CONSTRAINT "atlas_audit_logs_restored_by_atlas_users_id_fk" FOREIGN KEY ("restored_by") REFERENCES "public"."atlas_users"("id") ON DELETE no action ON UPDATE no action;
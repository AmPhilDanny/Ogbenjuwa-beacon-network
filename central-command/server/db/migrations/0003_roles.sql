CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"permission_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_unique" UNIQUE("name");
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "village_id" uuid;
--> statement-breakpoint
INSERT INTO "roles" ("name", "label", "description", "permission_keys") VALUES
('super_admin', 'Super Admin', 'Full platform control', '["users:*","lgas:*","wards:*","alerts:*","incidents:*","patrols:*","announcements:*","analytics:*","audit:*","api-keys:*","settings:*","sos:*","comms:*","reports:*"]'),
('state_observer', 'State Observer', 'Read-only oversight across all LGAs', '["alerts:read","incidents:read","patrols:read","analytics:read","audit:read","lgas:read","wards:read","users:read","reports:read"]'),
('lga_coordinator', 'LGA Coordinator', 'Coordinate a local government area', '["users:read","users:create","users:update","lgas:read","wards:read","wards:create","wards:update","alerts:read","alerts:create","alerts:update","alerts:resolve","incidents:read","incidents:create","incidents:update","patrols:read","patrols:create","patrols:update","announcements:create","announcements:read","sos:read","sos:respond","reports:read","reports:review","comms:send","analytics:read"]'),
('vigilante_leader', 'Vigilante Leader', 'Leads a vigilante patrol team', '["alerts:read","alerts:update","incidents:read","incidents:update","patrols:read","patrols:update","patrols:checkin","sos:read","sos:respond","users:read","comms:send"]'),
('community_admin', 'Community Leader', 'Community-level administration', '["alerts:read","alerts:create","incidents:read","incidents:create","patrols:read","reports:read","comms:send","users:read"]'),
('resident', 'Resident', 'Regular community member', '["alerts:read","reports:create","reports:read","comms:send","sos:create"]');
--> statement-breakpoint
CREATE INDEX "users_village_id_idx" ON "users" USING btree ("village_id");

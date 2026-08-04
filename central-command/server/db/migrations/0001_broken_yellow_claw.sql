ALTER TABLE "lgas" ADD COLUMN "lat" numeric;--> statement-breakpoint
ALTER TABLE "lgas" ADD COLUMN "lng" numeric;--> statement-breakpoint
ALTER TABLE "lgas" ADD COLUMN "radius" numeric(6, 2) DEFAULT '10';--> statement-breakpoint
ALTER TABLE "patrol_teams" ADD COLUMN "village_id" uuid;--> statement-breakpoint
ALTER TABLE "patrol_teams" ADD CONSTRAINT "patrol_teams_ward_id_wards_id_fk" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patrol_teams" ADD CONSTRAINT "patrol_teams_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE no action ON UPDATE no action;
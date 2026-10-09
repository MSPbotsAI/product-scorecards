CREATE TABLE "yke0x6nvil03yca1cx686ioxx6wbi4fg"."pm_captures" (
	"at" timestamp with time zone PRIMARY KEY NOT NULL,
	"source" varchar(16) NOT NULL,
	"rows" integer NOT NULL,
	"oldest" timestamp with time zone,
	"newest" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "yke0x6nvil03yca1cx686ioxx6wbi4fg"."pm_events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"ticket" varchar(32) NOT NULL,
	"seq" integer NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"who" text NOT NULL,
	"outcome" text NOT NULL,
	"from_dept" text,
	"from_person" text,
	"to_dept" text,
	"to_person" text,
	"prd" text[] DEFAULT '{}'::text[] NOT NULL,
	"mb" text[] DEFAULT '{}'::text[] NOT NULL,
	"canny" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "yke0x6nvil03yca1cx686ioxx6wbi4fg"."pm_tickets" (
	"ticket" varchar(32) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone,
	"summary" text,
	"client" text
);

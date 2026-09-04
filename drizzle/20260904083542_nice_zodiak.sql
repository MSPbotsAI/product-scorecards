CREATE TABLE "yke0x6nvil03yca1cx686ioxx6wbi4fg"."metric_thresholds" (
	"metric_id" varchar(32) PRIMARY KEY NOT NULL,
	"target" integer NOT NULL,
	"yellow_min" integer,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

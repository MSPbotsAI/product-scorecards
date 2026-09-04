CREATE TABLE "yke0x6nvil03yca1cx686ioxx6wbi4fg"."metric_values" (
	"metric_id" varchar(32) NOT NULL,
	"week" varchar(10) NOT NULL,
	"value" integer NOT NULL,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "metric_values_metric_id_week_pk" PRIMARY KEY("metric_id","week")
);

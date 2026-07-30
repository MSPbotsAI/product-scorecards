CREATE TABLE "yke0x6nvil03yca1cx686ioxx6wbi4fg"."settings" (
	"key" varchar(128) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

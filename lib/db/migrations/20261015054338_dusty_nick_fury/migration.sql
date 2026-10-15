CREATE TABLE "logs" (
	"id" text PRIMARY KEY,
	"request_id" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"timestamp" text NOT NULL,
	"created_at" text NOT NULL
);

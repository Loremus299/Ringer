import { createId } from "@paralleldrive/cuid2";
import { pgTable, text } from "drizzle-orm/pg-core";

export const loggerTable = pgTable("logs", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	requestId: text("request_id").notNull(),
	key: text("key").notNull(),
	value: text("value").notNull(),
	timeStamp: text("timestamp").notNull(),

	createdAt: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
});

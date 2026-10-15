import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	name: text("name").notNull(),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

export const userSessionsTable = pgTable("user_sessions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  token: text("token").notNull(),
	userAgent: text("user_agent").notNull(),
	
	userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	expiredAt: timestamp("expired_at").notNull().$defaultFn(() => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30))
})
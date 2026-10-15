import { createId } from "@paralleldrive/cuid2";
import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const projectsTable = pgTable("projects", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	name: text("name").notNull(),
	description: text("description"),
	apiKey: text("api_key").notNull(),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

export const projectMembersRoles = pgEnum("project_members_roles", ["admin", "member"]);
export const projectMembersTable = pgTable("project_members", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	role: projectMembersRoles().notNull(),

	userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
	projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),

	createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const projectNotificationsTable = pgTable("project_notifications", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	title: text("title").notNull(),
	description: text("description"),
	acknowledged: boolean("acknowledged").notNull().default(false),

	projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),

	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})
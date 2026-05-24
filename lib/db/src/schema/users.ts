import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["admin", "agent"]);
export const userStatusEnum = pgEnum("user_status", ["pending", "approved", "rejected"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  agencyName: text("agency_name").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  cellNumber: text("cell_number").notNull(),
  city: text("city").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("agent"),
  status: userStatusEnum("status").notNull().default("pending"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

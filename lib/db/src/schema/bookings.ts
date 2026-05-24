import { pgTable, text, serial, timestamp, integer, real, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const bookingTypeEnum = pgEnum("booking_type", ["group", "umrah", "package"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "approved", "rejected", "cancelled"]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingReference: text("booking_reference").notNull().unique(),
  type: bookingTypeEnum("type").notNull(),
  ticketId: integer("ticket_id"),
  packageId: integer("package_id"),
  agentId: integer("agent_id").notNull().references(() => usersTable.id),
  passengers: jsonb("passengers").notNull().default([]),
  totalAmount: real("total_amount").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  ticketDetails: jsonb("ticket_details").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;

import { pgTable, text, serial, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ticketStatusEnum = pgEnum("ticket_status", ["active", "soldout", "cancelled"]);
export const groupCategoryEnum = pgEnum("group_category", ["KSA", "UAE", "Qatar"]);

export const groupTicketsTable = pgTable("group_tickets", {
  id: serial("id").primaryKey(),
  airline: text("airline").notNull(),
  airlineLogo: text("airline_logo"),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  country: text("country").notNull(),
  travelDate: text("travel_date").notNull(),
  seatsAvailable: integer("seats_available").notNull(),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("PKR"),
  flightNumber: text("flight_number"),
  category: groupCategoryEnum("category").notNull(),
  status: ticketStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const umrahTicketsTable = pgTable("umrah_tickets", {
  id: serial("id").primaryKey(),
  airline: text("airline").notNull(),
  airlineLogo: text("airline_logo"),
  origin: text("origin").notNull(),
  travelDate: text("travel_date").notNull(),
  returnDate: text("return_date").notNull(),
  seatsAvailable: integer("seats_available").notNull(),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("PKR"),
  flightNumber: text("flight_number"),
  status: ticketStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGroupTicketSchema = createInsertSchema(groupTicketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGroupTicket = z.infer<typeof insertGroupTicketSchema>;
export type GroupTicket = typeof groupTicketsTable.$inferSelect;

export const insertUmrahTicketSchema = createInsertSchema(umrahTicketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUmrahTicket = z.infer<typeof insertUmrahTicketSchema>;
export type UmrahTicket = typeof umrahTicketsTable.$inferSelect;

import { pgTable, text, serial, timestamp, integer, real, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const packageTierEnum = pgEnum("package_tier", ["economy", "vip", "luxury"]);
export const packageStatusEnum = pgEnum("package_status", ["active", "inactive"]);

export const umrahPackagesTable = pgTable("umrah_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tier: packageTierEnum("tier").notNull(),
  hotel: text("hotel").notNull(),
  makkahHotel: text("makkah_hotel"),
  madinahHotel: text("madinah_hotel"),
  hotelStars: integer("hotel_stars").notNull(),
  transport: text("transport").notNull(),
  visaIncluded: boolean("visa_included").notNull().default(true),
  duration: integer("duration").notNull(),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("PKR"),
  description: text("description").notNull(),
  amenities: text("amenities").array().notNull().default([]),
  image: text("image"),
  flightNumber: text("flight_number"),
  returnFlightNumber: text("return_flight_number"),
  originCity: text("origin_city"),
  travelDate: text("travel_date"),
  returnDate: text("return_date"),
  departureTime: text("departure_time"),
  returnTime: text("return_time"),
  baggage: text("baggage"),
  mealIncluded: boolean("meal_included").default(true),
  status: packageStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUmrahPackageSchema = createInsertSchema(umrahPackagesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUmrahPackage = z.infer<typeof insertUmrahPackageSchema>;
export type UmrahPackage = typeof umrahPackagesTable.$inferSelect;

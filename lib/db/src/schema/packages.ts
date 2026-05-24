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
  makkahNights: integer("makkah_nights"),
  madinahNights: integer("madinah_nights"),
  makkahHotelDistance: text("makkah_hotel_distance"),
  madinahHotelDistance: text("madinah_hotel_distance"),
  hotelStars: integer("hotel_stars").notNull(),
  transport: text("transport").notNull(),
  visaIncluded: boolean("visa_included").notNull().default(true),
  duration: integer("duration").notNull(),
  price: real("price").notNull(),
  priceShared: real("price_shared"),
  priceDouble: real("price_double"),
  priceTriple: real("price_triple"),
  priceQuad: real("price_quad"),
  currency: text("currency").notNull().default("PKR"),
  description: text("description").notNull(),
  amenities: text("amenities").array().notNull().default([]),
  image: text("image"),
  flightNumber: text("flight_number"),
  returnFlightNumber: text("return_flight_number"),
  originCity: text("origin_city"),
  originCode: text("origin_code"),
  destinationCode: text("destination_code"),
  travelDate: text("travel_date"),
  returnDate: text("return_date"),
  departureTime: text("departure_time"),
  arrivalTime: text("arrival_time"),
  returnTime: text("return_time"),
  returnArrivalTime: text("return_arrival_time"),
  baggage: text("baggage"),
  mealIncluded: boolean("meal_included").default(true),
  seatsAvailable: integer("seats_available"),
  status: packageStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUmrahPackageSchema = createInsertSchema(umrahPackagesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUmrahPackage = z.infer<typeof insertUmrahPackageSchema>;
export type UmrahPackage = typeof umrahPackagesTable.$inferSelect;

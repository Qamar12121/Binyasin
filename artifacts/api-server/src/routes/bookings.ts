import { Router, type IRouter } from "express";
import { db, bookingsTable, usersTable, groupTicketsTable, umrahTicketsTable, umrahPackagesTable, transactionsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import {
  CreateBookingBody,
  ListBookingsQueryParams,
  GetBookingParams,
  UpdateBookingStatusParams,
  UpdateBookingStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function genRef(): string {
  return "BYT-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

async function formatBooking(b: typeof bookingsTable.$inferSelect) {
  const [agent] = await db.select({ fullName: usersTable.fullName, agencyName: usersTable.agencyName }).from(usersTable).where(eq(usersTable.id, b.agentId));
  return {
    ...b,
    passengers: b.passengers as any[],
    ticketDetails: b.ticketDetails as any,
    agentName: agent?.agencyName || agent?.fullName || "Unknown",
    createdAt: b.createdAt.toISOString(),
  };
}

router.get("/bookings", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const params = ListBookingsQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const conditions: any[] = [eq(bookingsTable.agentId, req.userId!)];
  if (params.data.type) conditions.push(eq(bookingsTable.type, params.data.type as any));
  if (params.data.status) conditions.push(eq(bookingsTable.status, params.data.status as any));
  const bookings = await db.select().from(bookingsTable).where(and(...conditions)).orderBy(sql`${bookingsTable.createdAt} DESC`);
  const formatted = await Promise.all(bookings.map(formatBooking));
  res.json(formatted);
});

router.post("/bookings", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { type, ticketId, packageId, passengers } = parsed.data;

  let totalAmount = 0;
  let ticketDetails: any = {};

  if (type === "group" && ticketId) {
    const [t] = await db.select().from(groupTicketsTable).where(eq(groupTicketsTable.id, ticketId));
    if (!t) { res.status(404).json({ error: "Ticket not found" }); return; }
    totalAmount = t.price * passengers.length;
    ticketDetails = { airline: t.airline, origin: t.origin, destination: t.destination, travelDate: t.travelDate, flightNumber: t.flightNumber, currency: t.currency };
  } else if (type === "umrah" && ticketId) {
    const [t] = await db.select().from(umrahTicketsTable).where(eq(umrahTicketsTable.id, ticketId));
    if (!t) { res.status(404).json({ error: "Ticket not found" }); return; }
    totalAmount = t.price * passengers.length;
    ticketDetails = { airline: t.airline, origin: t.origin, travelDate: t.travelDate, returnDate: t.returnDate, flightNumber: t.flightNumber, currency: t.currency };
  } else if (type === "package" && packageId) {
    const [p] = await db.select().from(umrahPackagesTable).where(eq(umrahPackagesTable.id, packageId));
    if (!p) { res.status(404).json({ error: "Package not found" }); return; }
    totalAmount = p.price * passengers.length;
    ticketDetails = { packageName: p.name, hotel: p.hotel, tier: p.tier, duration: p.duration, visaIncluded: p.visaIncluded, currency: p.currency };
  }

  const bookingReference = genRef();
  const [booking] = await db.insert(bookingsTable).values({
    bookingReference, type: type as any, ticketId: ticketId ?? null, packageId: packageId ?? null,
    agentId: req.userId!, passengers: passengers as any, totalAmount, status: "pending", ticketDetails,
  }).returning();

  await db.insert(transactionsTable).values({
    agentId: req.userId!, type: "debit", amount: totalAmount,
    description: `Booking ${bookingReference}`, bookingReference,
  });

  res.status(201).json(await formatBooking(booking));
});

router.get("/bookings/:id", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const params = GetBookingParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(await formatBooking(booking));
});

router.patch("/bookings/:id", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateBookingStatusParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [booking] = await db.update(bookingsTable).set({ status: parsed.data.status as any }).where(eq(bookingsTable.id, params.data.id)).returning();
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(await formatBooking(booking));
});

export default router;

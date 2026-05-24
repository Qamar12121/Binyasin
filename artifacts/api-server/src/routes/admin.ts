import { Router, type IRouter } from "express";
import { db, usersTable, bookingsTable, transactionsTable } from "@workspace/db";
import { eq, sql, count, sum } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../lib/auth";
import {
  ApproveAgentBody,
  ApproveAgentParams,
  AdminUpdateBookingStatusParams,
  AdminUpdateBookingStatusBody,
  CreateTransactionBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function safeUser(u: typeof usersTable.$inferSelect) {
  const { passwordHash: _p, ...rest } = u;
  return { ...rest, createdAt: rest.createdAt.toISOString() };
}

async function formatBooking(b: typeof bookingsTable.$inferSelect) {
  const [agent] = await db.select({ agencyName: usersTable.agencyName, fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, b.agentId));
  return {
    ...b,
    passengers: b.passengers as any[],
    ticketDetails: b.ticketDetails as any,
    agentName: agent?.agencyName || agent?.fullName || "Unknown",
    createdAt: b.createdAt.toISOString(),
  };
}

router.get("/admin/dashboard", requireAdmin as any, async (_req, res): Promise<void> => {
  const [totalAgents] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "agent"));
  const [pendingAgents] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.status, "pending"));
  const [totalBookings] = await db.select({ count: count() }).from(bookingsTable);
  const [pendingBookings] = await db.select({ count: count() }).from(bookingsTable).where(eq(bookingsTable.status, "pending"));
  const [totalRevenueRow] = await db.select({ total: sum(bookingsTable.totalAmount) }).from(bookingsTable).where(eq(bookingsTable.status, "approved"));

  const bookingsByType = await db.select({ type: bookingsTable.type, count: count() }).from(bookingsTable).groupBy(bookingsTable.type);

  const recentBookingsRaw = await db.select().from(bookingsTable).orderBy(sql`${bookingsTable.createdAt} DESC`).limit(10);
  const recentBookings = await Promise.all(recentBookingsRaw.map(formatBooking));

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyBookings = months.map((month, i) => ({
    month, count: Math.floor(Math.random() * 30) + 5, revenue: Math.floor(Math.random() * 500000) + 100000,
  }));

  res.json({
    totalAgents: totalAgents.count, pendingAgents: pendingAgents.count,
    totalBookings: totalBookings.count, pendingBookings: pendingBookings.count,
    totalRevenue: Number(totalRevenueRow.total) || 0,
    monthlyBookings,
    bookingsByType: bookingsByType.map(b => ({ type: b.type, count: b.count })),
    recentBookings,
  });
});

router.get("/admin/agents", requireAdmin as any, async (_req, res): Promise<void> => {
  const agents = await db.select().from(usersTable).where(eq(usersTable.role, "agent")).orderBy(sql`${usersTable.createdAt} DESC`);
  res.json(agents.map(safeUser));
});

router.patch("/admin/agents/:id/approve", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const params = ApproveAgentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = ApproveAgentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [user] = await db.update(usersTable).set({ status: parsed.data.status }).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "Agent not found" }); return; }
  res.json(safeUser(user));
});

router.get("/admin/bookings", requireAdmin as any, async (_req, res): Promise<void> => {
  const bookings = await db.select().from(bookingsTable).orderBy(sql`${bookingsTable.createdAt} DESC`);
  const formatted = await Promise.all(bookings.map(formatBooking));
  res.json(formatted);
});

router.patch("/admin/bookings/:id", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const params = AdminUpdateBookingStatusParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = AdminUpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [booking] = await db.update(bookingsTable).set({ status: parsed.data.status as any }).where(eq(bookingsTable.id, params.data.id)).returning();
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(await formatBooking(booking));
});

router.get("/admin/transactions", requireAdmin as any, async (_req, res): Promise<void> => {
  const txs = await db.select({ tx: transactionsTable, agencyName: usersTable.agencyName, fullName: usersTable.fullName })
    .from(transactionsTable)
    .innerJoin(usersTable, eq(transactionsTable.agentId, usersTable.id))
    .orderBy(sql`${transactionsTable.createdAt} DESC`);
  res.json(txs.map(r => ({
    ...r.tx,
    agentName: r.agencyName || r.fullName,
    createdAt: r.tx.createdAt.toISOString(),
  })));
});

router.post("/admin/transactions", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [tx] = await db.insert(transactionsTable).values({
    agentId: parsed.data.agentId,
    type: parsed.data.type as any,
    amount: parsed.data.amount,
    description: parsed.data.description,
    bookingReference: parsed.data.bookingReference ?? null,
  }).returning();
  const [agent] = await db.select({ agencyName: usersTable.agencyName, fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, tx.agentId));
  res.status(201).json({ ...tx, agentName: agent?.agencyName || agent?.fullName || "Unknown", createdAt: tx.createdAt.toISOString() });
});

export default router;

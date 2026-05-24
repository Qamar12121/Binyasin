import { Router, type IRouter } from "express";
import { db, groupTicketsTable, umrahTicketsTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../lib/auth";
import {
  CreateGroupTicketBody,
  UpdateGroupTicketBody,
  GetGroupTicketParams,
  UpdateGroupTicketParams,
  DeleteGroupTicketParams,
  CreateUmrahTicketBody,
  UpdateUmrahTicketParams,
  UpdateUmrahTicketBody,
  DeleteUmrahTicketParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatTicket(t: any) {
  return { ...t, createdAt: t.createdAt?.toISOString?.() ?? t.createdAt };
}

// Group Tickets
router.get("/tickets/group", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const { country, airline, date, minPrice, maxPrice } = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (country) conditions.push(eq(groupTicketsTable.country, country));
  if (airline) conditions.push(eq(groupTicketsTable.airline, airline));
  if (date) conditions.push(eq(groupTicketsTable.travelDate, date));
  if (minPrice) conditions.push(gte(groupTicketsTable.price, parseFloat(minPrice)));
  if (maxPrice) conditions.push(lte(groupTicketsTable.price, parseFloat(maxPrice)));

  const tickets = conditions.length > 0
    ? await db.select().from(groupTicketsTable).where(and(...conditions))
    : await db.select().from(groupTicketsTable);
  res.json(tickets.map(formatTicket));
});

router.post("/tickets/group", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateGroupTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [ticket] = await db.insert(groupTicketsTable).values(parsed.data as any).returning();
  res.status(201).json(formatTicket(ticket));
});

router.get("/tickets/group/:id", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const params = GetGroupTicketParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [ticket] = await db.select().from(groupTicketsTable).where(eq(groupTicketsTable.id, params.data.id));
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  res.json(formatTicket(ticket));
});

router.patch("/tickets/group/:id", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateGroupTicketParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateGroupTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [ticket] = await db.update(groupTicketsTable).set(parsed.data as any).where(eq(groupTicketsTable.id, params.data.id)).returning();
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  res.json(formatTicket(ticket));
});

router.delete("/tickets/group/:id", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteGroupTicketParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(groupTicketsTable).where(eq(groupTicketsTable.id, params.data.id));
  res.json({ message: "Deleted successfully" });
});

// Umrah Tickets
router.get("/tickets/umrah", requireAuth as any, async (_req, res): Promise<void> => {
  const tickets = await db.select().from(umrahTicketsTable);
  res.json(tickets.map(formatTicket));
});

router.post("/tickets/umrah", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateUmrahTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [ticket] = await db.insert(umrahTicketsTable).values(parsed.data as any).returning();
  res.status(201).json(formatTicket(ticket));
});

router.patch("/tickets/umrah/:id", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateUmrahTicketParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateUmrahTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [ticket] = await db.update(umrahTicketsTable).set(parsed.data as any).where(eq(umrahTicketsTable.id, params.data.id)).returning();
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  res.json(formatTicket(ticket));
});

router.delete("/tickets/umrah/:id", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteUmrahTicketParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(umrahTicketsTable).where(eq(umrahTicketsTable.id, params.data.id));
  res.json({ message: "Deleted successfully" });
});

export default router;

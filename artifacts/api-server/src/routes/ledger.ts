import { Router, type IRouter } from "express";
import { db, transactionsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

function formatTx(t: any, agentName: string) {
  return { ...t, agentName, createdAt: t.createdAt?.toISOString?.() ?? t.createdAt };
}

router.get("/ledger", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const [agent] = await db.select({ agencyName: usersTable.agencyName }).from(usersTable).where(eq(usersTable.id, req.userId!));
  const txs = await db.select().from(transactionsTable).where(eq(transactionsTable.agentId, req.userId!)).orderBy(sql`${transactionsTable.createdAt} DESC`);
  const totalCredit = txs.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebit = txs.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  res.json({
    totalCredit, totalDebit, balance: totalCredit - totalDebit,
    transactions: txs.map(t => formatTx(t, agent?.agencyName ?? "Unknown")),
  });
});

router.get("/ledger/transactions", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const [agent] = await db.select({ agencyName: usersTable.agencyName }).from(usersTable).where(eq(usersTable.id, req.userId!));
  const txs = await db.select().from(transactionsTable).where(eq(transactionsTable.agentId, req.userId!)).orderBy(sql`${transactionsTable.createdAt} DESC`);
  res.json(txs.map(t => formatTx(t, agent?.agencyName ?? "Unknown")));
});

export default router;

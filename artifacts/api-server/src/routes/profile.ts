import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { UpdateProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

function safeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _p, ...rest } = user;
  return { ...rest, createdAt: rest.createdAt.toISOString() };
}

router.get("/profile", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(safeUser(user));
});

router.patch("/profile", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [user] = await db.update(usersTable).set(parsed.data as any).where(eq(usersTable.id, req.userId!)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(safeUser(user));
});

export default router;

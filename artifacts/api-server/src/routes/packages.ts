import { Router, type IRouter } from "express";
import { db, umrahPackagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../lib/auth";
import {
  CreateUmrahPackageBody,
  UpdateUmrahPackageParams,
  UpdateUmrahPackageBody,
  DeleteUmrahPackageParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatPkg(p: any) {
  return { ...p, createdAt: p.createdAt?.toISOString?.() ?? p.createdAt };
}

router.get("/packages/umrah", requireAuth as any, async (_req, res): Promise<void> => {
  const packages = await db.select().from(umrahPackagesTable);
  res.json(packages.map(formatPkg));
});

router.post("/packages/umrah", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateUmrahPackageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [pkg] = await db.insert(umrahPackagesTable).values(parsed.data as any).returning();
  res.status(201).json(formatPkg(pkg));
});

router.patch("/packages/umrah/:id", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateUmrahPackageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateUmrahPackageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [pkg] = await db.update(umrahPackagesTable).set(parsed.data as any).where(eq(umrahPackagesTable.id, params.data.id)).returning();
  if (!pkg) { res.status(404).json({ error: "Package not found" }); return; }
  res.json(formatPkg(pkg));
});

router.delete("/packages/umrah/:id", requireAdmin as any, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteUmrahPackageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(umrahPackagesTable).where(eq(umrahPackagesTable.id, params.data.id));
  res.json({ message: "Deleted successfully" });
});

export default router;

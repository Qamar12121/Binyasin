import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, hashPassword, comparePassword, requireAuth, type AuthRequest } from "../lib/auth";
import {
  RegisterBody,
  LoginBody,
  ForgotPasswordBody,
  ChangePasswordBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function safeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _p, ...rest } = user;
  return {
    ...rest,
    createdAt: rest.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { agencyName, fullName, email, cellNumber, city, password, confirmPassword } = parsed.data;
  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    agencyName, fullName, email, cellNumber, city, passwordHash,
    role: "agent", status: "pending",
  }).returning();
  const token = signToken(user.id, user.role);
  res.status(201).json({ token, user: safeUser(user) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = signToken(user.id, user.role);
  res.json({ token, user: safeUser(user) });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.json({ message: "If an account with that email exists, a password reset link has been sent." });
});

router.post("/auth/change-password", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { currentPassword, newPassword, confirmPassword } = parsed.data;
  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }
  const passwordHash = await hashPassword(newPassword);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
  res.json({ message: "Password updated successfully" });
});

router.get("/auth/me", requireAuth as any, async (req: AuthRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(safeUser(user));
});

export default router;

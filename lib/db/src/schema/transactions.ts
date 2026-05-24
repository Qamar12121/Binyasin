import { pgTable, text, serial, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const transactionTypeEnum = pgEnum("transaction_type", ["credit", "debit"]);

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => usersTable.id),
  type: transactionTypeEnum("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  bookingReference: text("booking_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;

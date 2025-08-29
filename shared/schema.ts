import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const dcaStrategies = pgTable("dca_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(), // weekly, biweekly, monthly
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dcaTransactions = pgTable("dca_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  strategyId: varchar("strategy_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  btcPrice: decimal("btc_price", { precision: 10, scale: 2 }).notNull(),
  btcAmount: decimal("btc_amount", { precision: 10, scale: 8 }).notNull(),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  totalBTC: decimal("total_btc", { precision: 10, scale: 8 }).default('0'),
  totalInvested: decimal("total_invested", { precision: 10, scale: 2 }).default('0'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketData = pgTable("market_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  change24h: decimal("change_24h", { precision: 10, scale: 2 }),
  changePercent24h: decimal("change_percent_24h", { precision: 5, scale: 2 }),
  volume24h: decimal("volume_24h", { precision: 15, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 15, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDCAStrategySchema = createInsertSchema(dcaStrategies).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertDCATransactionSchema = createInsertSchema(dcaTransactions).omit({
  id: true,
  executedAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  updatedAt: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  timestamp: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type DCAStrategy = typeof dcaStrategies.$inferSelect;
export type InsertDCAStrategy = z.infer<typeof insertDCAStrategySchema>;
export type DCATransaction = typeof dcaTransactions.$inferSelect;
export type InsertDCATransaction = z.infer<typeof insertDCATransactionSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

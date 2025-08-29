import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('active'), // active, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default('medium'), // low, medium, high, critical
  status: text("status").notNull().default('open'), // open, in_progress, resolved, closed
  type: text("type").notNull().default('bug'), // bug, feature, task, support
  assignedTo: varchar("assigned_to"), // user ID
  reportedBy: varchar("reported_by").notNull(), // user ID
  tags: text("tags"), // comma-separated tags
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ticketComments = pgTable("ticket_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false), // internal comments vs public
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({
  id: true,
  createdAt: true,
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  dcaStrategies: many(dcaStrategies),
  portfolio: one(portfolios),
}));

export const dcaStrategiesRelations = relations(dcaStrategies, ({ one, many }) => ({
  user: one(users, {
    fields: [dcaStrategies.userId],
    references: [users.id],
  }),
  transactions: many(dcaTransactions),
}));

export const dcaTransactionsRelations = relations(dcaTransactions, ({ one }) => ({
  strategy: one(dcaStrategies, {
    fields: [dcaTransactions.strategyId],
    references: [dcaStrategies.id],
  }),
}));

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  project: one(projects, {
    fields: [tickets.projectId],
    references: [projects.id],
  }),
  comments: many(ticketComments),
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketComments.userId],
    references: [users.id],
  }),
}));

export type UpsertUser = typeof users.$inferInsert;
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
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;
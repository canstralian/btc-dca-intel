import {
  type User,
  type InsertUser,
  type UpsertUser,
  type DCAStrategy,
  type InsertDCAStrategy,
  type DCATransaction,
  type InsertDCATransaction,
  type Portfolio,
  type InsertPortfolio,
  type MarketData,
  type InsertMarketData,
  users,
  dcaStrategies,
  dcaTransactions,
  portfolios,
  marketData,
  // Import ticketing system types and schemas
  type Project,
  type InsertProject,
  type Ticket,
  type InsertTicket,
  type TicketComment,
  type InsertTicketComment,
  projects,
  tickets,
  ticketComments
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // DCA Strategy methods
  getDCAStrategies(userId: string): Promise<DCAStrategy[]>;
  getDCAStrategy(id: string): Promise<DCAStrategy | undefined>;
  createDCAStrategy(strategy: InsertDCAStrategy & { userId: string }): Promise<DCAStrategy>;
  updateDCAStrategy(id: string, strategy: Partial<InsertDCAStrategy>): Promise<DCAStrategy | undefined>;

  // DCA Transaction methods
  getDCATransactions(strategyId: string): Promise<DCATransaction[]>;
  createDCATransaction(transaction: InsertDCATransaction): Promise<DCATransaction>;

  // Portfolio methods
  getPortfolio(userId: string): Promise<Portfolio | undefined>;
  updatePortfolio(userId: string, portfolio: Partial<InsertPortfolio>): Promise<Portfolio>;

  // Market Data methods
  getLatestMarketData(symbol: string): Promise<MarketData | undefined>;
  saveMarketData(data: InsertMarketData): Promise<MarketData>;

  // Project methods
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;

  // Ticket methods
  getTickets(projectId?: string): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, ticket: Partial<InsertTicket>): Promise<Ticket | undefined>;

  // Ticket comment methods
  getTicketComments(ticketId: string): Promise<TicketComment[]>;
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Note: For Replit Auth, we don't use username-based lookup
    // This method is kept for interface compatibility
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();

    // Create default portfolio for new user
    await db.insert(portfolios).values({
      userId: user.id,
      totalBTC: '0',
      totalInvested: '0',
    });

    return user;
  }

  async getDCAStrategies(userId: string): Promise<DCAStrategy[]> {
    return await db.select().from(dcaStrategies).where(eq(dcaStrategies.userId, userId));
  }

  async getDCAStrategy(id: string): Promise<DCAStrategy | undefined> {
    const [strategy] = await db.select().from(dcaStrategies).where(eq(dcaStrategies.id, id));
    return strategy || undefined;
  }

  async createDCAStrategy(strategy: InsertDCAStrategy & { userId: string }): Promise<DCAStrategy> {
    const [dcaStrategy] = await db
      .insert(dcaStrategies)
      .values(strategy)
      .returning();
    return dcaStrategy;
  }

  async updateDCAStrategy(id: string, updates: Partial<InsertDCAStrategy>): Promise<DCAStrategy | undefined> {
    const [updatedStrategy] = await db
      .update(dcaStrategies)
      .set(updates)
      .where(eq(dcaStrategies.id, id))
      .returning();
    return updatedStrategy || undefined;
  }

  async getDCATransactions(strategyId: string): Promise<DCATransaction[]> {
    return await db.select().from(dcaTransactions).where(eq(dcaTransactions.strategyId, strategyId));
  }

  async createDCATransaction(transaction: InsertDCATransaction): Promise<DCATransaction> {
    const [dcaTransaction] = await db
      .insert(dcaTransactions)
      .values(transaction)
      .returning();
    return dcaTransaction;
  }

  async getPortfolio(userId: string): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.userId, userId));
    return portfolio || undefined;
  }

  async updatePortfolio(userId: string, updates: Partial<InsertPortfolio>): Promise<Portfolio> {
    const [updatedPortfolio] = await db
      .update(portfolios)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolios.userId, userId))
      .returning();

    if (updatedPortfolio) {
      return updatedPortfolio;
    }

    // If portfolio doesn't exist, create it
    const [newPortfolio] = await db
      .insert(portfolios)
      .values({
        userId,
        totalBTC: updates.totalBTC || '0',
        totalInvested: updates.totalInvested || '0',
      })
      .returning();

    return newPortfolio;
  }

  async getLatestMarketData(symbol: string): Promise<MarketData | undefined> {
    const result = await db
      .select()
      .from(marketData)
      .where(eq(marketData.symbol, symbol.toUpperCase()))
      .orderBy(desc(marketData.timestamp))
      .limit(1);

    return result[0];
  }

  async saveMarketData(data: InsertMarketData): Promise<MarketData> {
    const [marketDataRecord] = await db
      .insert(marketData)
      .values(data)
      .returning();
    return marketDataRecord;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values({
      id: randomUUID(),
      ...project,
    }).returning();

    return result[0];
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    return result[0];
  }

  // Ticket methods
  async getTickets(projectId?: string): Promise<Ticket[]> {
    const query = db.select().from(tickets);

    if (projectId) {
      return await query.where(eq(tickets.projectId, projectId)).orderBy(desc(tickets.createdAt));
    }

    return await query.orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const result = await db.select().from(tickets).where(eq(tickets.id, id));
    return result[0];
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const result = await db.insert(tickets).values({
      id: randomUUID(),
      ...ticket,
    }).returning();

    return result[0];
  }

  async updateTicket(id: string, ticket: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const result = await db
      .update(tickets)
      .set({ ...ticket, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();

    return result[0];
  }

  // Ticket comment methods
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    return await db
      .select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(desc(ticketComments.createdAt));
  }

  async createTicketComment(comment: InsertTicketComment): Promise<TicketComment> {
    const result = await db.insert(ticketComments).values({
      id: randomUUID(),
      ...comment,
    }).returning();

    return result[0];
  }
};

export const storage = new DatabaseStorage();
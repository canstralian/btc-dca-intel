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
  marketData
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
    const [data] = await db
      .select()
      .from(marketData)
      .where(eq(marketData.symbol, symbol))
      .orderBy(desc(marketData.timestamp))
      .limit(1);
    
    return data || undefined;
  }

  async saveMarketData(data: InsertMarketData): Promise<MarketData> {
    const [savedData] = await db
      .insert(marketData)
      .values(data)
      .returning();
    return savedData;
  }
}

export const storage = new DatabaseStorage();

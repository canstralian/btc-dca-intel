import { 
  type User, 
  type InsertUser, 
  type DCAStrategy, 
  type InsertDCAStrategy,
  type DCATransaction,
  type InsertDCATransaction,
  type Portfolio,
  type InsertPortfolio,
  type MarketData,
  type InsertMarketData
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private dcaStrategies: Map<string, DCAStrategy>;
  private dcaTransactions: Map<string, DCATransaction>;
  private portfolios: Map<string, Portfolio>;
  private marketData: Map<string, MarketData>;

  constructor() {
    this.users = new Map();
    this.dcaStrategies = new Map();
    this.dcaTransactions = new Map();
    this.portfolios = new Map();
    this.marketData = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create default portfolio for new user
    const portfolio: Portfolio = {
      id: randomUUID(),
      userId: id,
      totalBTC: '0',
      totalInvested: '0',
      updatedAt: new Date(),
    };
    this.portfolios.set(id, portfolio);
    
    return user;
  }

  async getDCAStrategies(userId: string): Promise<DCAStrategy[]> {
    return Array.from(this.dcaStrategies.values()).filter(
      (strategy) => strategy.userId === userId
    );
  }

  async getDCAStrategy(id: string): Promise<DCAStrategy | undefined> {
    return this.dcaStrategies.get(id);
  }

  async createDCAStrategy(strategy: InsertDCAStrategy & { userId: string }): Promise<DCAStrategy> {
    const id = randomUUID();
    const dcaStrategy: DCAStrategy = {
      ...strategy,
      id,
      createdAt: new Date(),
    };
    this.dcaStrategies.set(id, dcaStrategy);
    return dcaStrategy;
  }

  async updateDCAStrategy(id: string, updates: Partial<InsertDCAStrategy>): Promise<DCAStrategy | undefined> {
    const strategy = this.dcaStrategies.get(id);
    if (!strategy) return undefined;

    const updatedStrategy = { ...strategy, ...updates };
    this.dcaStrategies.set(id, updatedStrategy);
    return updatedStrategy;
  }

  async getDCATransactions(strategyId: string): Promise<DCATransaction[]> {
    return Array.from(this.dcaTransactions.values()).filter(
      (transaction) => transaction.strategyId === strategyId
    );
  }

  async createDCATransaction(transaction: InsertDCATransaction): Promise<DCATransaction> {
    const id = randomUUID();
    const dcaTransaction: DCATransaction = {
      ...transaction,
      id,
      executedAt: new Date(),
    };
    this.dcaTransactions.set(id, dcaTransaction);
    return dcaTransaction;
  }

  async getPortfolio(userId: string): Promise<Portfolio | undefined> {
    return this.portfolios.get(userId);
  }

  async updatePortfolio(userId: string, updates: Partial<InsertPortfolio>): Promise<Portfolio> {
    const portfolio = this.portfolios.get(userId);
    const updatedPortfolio: Portfolio = {
      id: portfolio?.id || randomUUID(),
      userId,
      totalBTC: updates.totalBTC || portfolio?.totalBTC || '0',
      totalInvested: updates.totalInvested || portfolio?.totalInvested || '0',
      updatedAt: new Date(),
    };
    this.portfolios.set(userId, updatedPortfolio);
    return updatedPortfolio;
  }

  async getLatestMarketData(symbol: string): Promise<MarketData | undefined> {
    const symbolData = Array.from(this.marketData.values())
      .filter(data => data.symbol === symbol)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return symbolData[0];
  }

  async saveMarketData(data: InsertMarketData): Promise<MarketData> {
    const id = randomUUID();
    const marketData: MarketData = {
      ...data,
      id,
      timestamp: new Date(),
    };
    this.marketData.set(id, marketData);
    return marketData;
  }
}

export const storage = new MemStorage();

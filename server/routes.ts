import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDCAStrategySchema, insertDCATransactionSchema, insertMarketDataSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Market data routes
  app.get("/api/market/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      
      // Fetch from CoinGecko API
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
      const data = await response.json();
      
      if (!data[symbol]) {
        return res.status(404).json({ error: "Symbol not found" });
      }
      
      const marketData = {
        symbol: symbol.toUpperCase(),
        price: data[symbol].usd.toString(),
        change24h: (data[symbol].usd_24h_change || 0).toString(),
        changePercent24h: (data[symbol].usd_24h_change || 0).toString(),
        volume24h: (data[symbol].usd_24h_vol || 0).toString(),
        marketCap: (data[symbol].usd_market_cap || 0).toString(),
      };
      
      // Save to storage
      await storage.saveMarketData(marketData);
      
      res.json(marketData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // Historical price data
  app.get("/api/market/:symbol/history", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { days = "30" } = req.query;
      
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${days}`);
      const data = await response.json();
      
      if (!data.prices) {
        return res.status(404).json({ error: "Historical data not found" });
      }
      
      const formattedData = data.prices.map((price: [number, number]) => ({
        timestamp: new Date(price[0]).toISOString(),
        price: price[1],
      }));
      
      res.json(formattedData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  // Fear & Greed Index
  app.get("/api/fear-greed", async (req, res) => {
    try {
      const response = await fetch("https://api.alternative.me/fng/");
      const data = await response.json();
      
      if (data.data && data.data[0]) {
        res.json({
          value: parseInt(data.data[0].value),
          classification: data.data[0].value_classification,
          timestamp: data.data[0].timestamp,
        });
      } else {
        res.json({ value: 50, classification: "Neutral", timestamp: Date.now() });
      }
    } catch (error) {
      res.json({ value: 50, classification: "Neutral", timestamp: Date.now() });
    }
  });

  // DCA Strategy routes
  app.post("/api/dca-strategies", async (req, res) => {
    try {
      const validatedData = insertDCAStrategySchema.parse(req.body);
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      
      const strategy = await storage.createDCAStrategy({
        ...validatedData,
        userId,
      });
      
      res.json(strategy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create DCA strategy" });
      }
    }
  });

  app.get("/api/dca-strategies", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const strategies = await storage.getDCAStrategies(userId);
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DCA strategies" });
    }
  });

  // DCA calculation endpoint
  app.post("/api/calculate-dca", async (req, res) => {
    try {
      const { amount, frequency, duration } = req.body;
      
      if (!amount || !frequency || !duration) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Calculate frequency multiplier
      const frequencyMap = {
        'weekly': 52,
        'biweekly': 26,
        'monthly': 12
      };
      
      const purchasesPerYear = frequencyMap[frequency as keyof typeof frequencyMap] || 12;
      const totalPurchases = Math.floor((duration / 12) * purchasesPerYear);
      const totalInvestment = parseFloat(amount) * totalPurchases;
      
      // Get current BTC price for projection
      const btcData = await storage.getLatestMarketData('BITCOIN');
      const currentPrice = parseFloat(btcData?.price || '43287');
      
      // Simple projection (this could be enhanced with more sophisticated models)
      const estimatedReturn = 0.12; // 12% annual return assumption
      const projectedValue = totalInvestment * (1 + (estimatedReturn * duration / 12));
      const potentialReturn = ((projectedValue - totalInvestment) / totalInvestment) * 100;
      
      res.json({
        totalInvestment,
        projectedValue,
        potentialReturn,
        totalPurchases,
        avgPurchaseAmount: parseFloat(amount),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate DCA strategy" });
    }
  });

  // Portfolio route
  app.get("/api/portfolio", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const portfolio = await storage.getPortfolio(userId);
      
      if (!portfolio) {
        // Create default portfolio
        const newPortfolio = await storage.updatePortfolio(userId, {
          totalBTC: '1.2847',
          totalInvested: '42500.00',
        });
        return res.json(newPortfolio);
      }
      
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Simulation endpoint
  app.post("/api/simulate-dca", async (req, res) => {
    try {
      const { startDate, endDate, amount } = req.body;
      
      if (!startDate || !endDate || !amount) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // This is a simplified simulation - in production you'd use historical price data
      const monthsInPeriod = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      const totalInvested = parseFloat(amount) * monthsInPeriod;
      
      // Mock simulation results
      const totalReturn = 34.7;
      const finalValue = totalInvested * (1 + totalReturn / 100);
      
      res.json({
        totalReturn,
        finalValue,
        totalInvested,
        bestEntry: 15487,
        worstEntry: 48300,
        avgEntry: 33087,
        vs_lump_sum: 12.3,
        vs_buy_hold: 8.7,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to run simulation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

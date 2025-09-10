import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDCAStrategySchema, insertDCATransactionSchema, insertMarketDataSchema, insertProjectSchema, insertTicketSchema, insertTicketCommentSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { handleError, wrapDatabaseOperation, wrapExternalServiceCall, ExternalServiceError, ValidationError } from "./errorHandler";

// In-memory cache for historical data
interface HistoricalCacheEntry {
  data: Array<{ timestamp: string; price: number }>;
  timestamp: number;
}

const historicalCache = new Map<string, HistoricalCacheEntry>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!userId) {
        throw new ValidationError("User ID not found in token");
      }
      
      const user = await wrapDatabaseOperation(
        () => storage.getUser(userId),
        "User fetch"
      );
      
      if (!user) {
        return res.status(404).json({ 
          error: "User not found", 
          code: "USER_NOT_FOUND" 
        });
      }
      
      res.json(user);
    } catch (error) {
      handleError(error, res, "GET /api/auth/user");
    }
  });
  // Market data routes with intelligent caching and error handling
  app.get("/api/market/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const symbolLower = symbol.toLowerCase();
      const symbolUpper = symbol.toUpperCase();
      
      // Cache configuration - 3 minutes for production reliability
      const CACHE_DURATION_MS = 3 * 60 * 1000; // 3 minutes
      
      console.log(`[Market API] Fetching data for symbol: ${symbolUpper}`);
      
      // Check cache first
      const cachedData = await storage.getLatestMarketData(symbolUpper);
      const now = new Date();
      
      if (cachedData && cachedData.timestamp) {
        const cacheAge = now.getTime() - new Date(cachedData.timestamp).getTime();
        console.log(`[Market API] Cache age for ${symbolUpper}: ${Math.round(cacheAge / 1000)}s`);
        
        if (cacheAge < CACHE_DURATION_MS) {
          console.log(`[Market API] Serving cached data for ${symbolUpper}`);
          return res.json(cachedData);
        }
      }
      
      // Cache miss or stale - fetch from CoinGecko with retry logic
      console.log(`[Market API] Cache miss/stale for ${symbolUpper}, fetching from CoinGecko`);
      
      let lastError: Error | null = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
          
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${symbolLower}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
            { 
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'DCAlytics/1.0'
              }
            }
          );
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log(`[Market API] CoinGecko response for ${symbolLower}:`, Object.keys(data));
          
          if (!data[symbolLower]) {
            console.log(`[Market API] Symbol ${symbolLower} not found in CoinGecko response`);
            
            // If we have stale cache data, serve it as fallback
            if (cachedData) {
              console.log(`[Market API] Serving stale cached data for ${symbolUpper} as fallback`);
              return res.json(cachedData);
            }
            
            return res.status(404).json({ error: "Symbol not found" });
          }
          
          // Calculate absolute price change from percentage and current price
          const currentPrice = data[symbolLower].usd;
          const changePercent = data[symbolLower].usd_24h_change || 0;
          const absoluteChange = (currentPrice * changePercent) / 100;
          
          const marketData = {
            symbol: symbolUpper,
            price: currentPrice.toString(),
            change24h: absoluteChange.toFixed(2), // Absolute USD change
            changePercent24h: changePercent.toFixed(2), // Percentage change
            volume24h: (data[symbolLower].usd_24h_vol || 0).toString(),
            marketCap: (data[symbolLower].usd_market_cap || 0).toString(),
          };
          
          // Save to cache
          await storage.saveMarketData(marketData);
          console.log(`[Market API] Successfully fetched and cached data for ${symbolUpper}`);
          
          return res.json(marketData);
          
        } catch (error) {
          lastError = error as Error;
          console.log(`[Market API] Attempt ${attempt}/${maxRetries} failed for ${symbolUpper}:`, error instanceof Error ? error.message : error);
          
          if (attempt < maxRetries) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`[Market API] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // All retries failed - check for fallback options
      console.error(`[Market API] All attempts failed for ${symbolUpper}:`, lastError?.message);
      
      // Serve stale cache as last resort
      if (cachedData && cachedData.timestamp) {
        const cacheAge = now.getTime() - new Date(cachedData.timestamp).getTime();
        console.log(`[Market API] Serving stale cached data (${Math.round(cacheAge / 60000)} min old) for ${symbolUpper}`);
        return res.json(cachedData);
      }
      
      // No cache available - return error
      res.status(500).json({ 
        error: "Failed to fetch market data", 
        details: lastError?.message || "Unknown error"
      });
      
    } catch (error) {
      console.error(`[Market API] Unexpected error for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Historical price data with intelligent caching and error handling
  app.get("/api/market/:symbol/history", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { days = "30" } = req.query;
      const symbolLower = symbol.toLowerCase();
      const symbolUpper = symbol.toUpperCase();
      
      // Cache configuration - 10 minutes for historical data
      const HISTORY_CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
      const cacheKey = `${symbolLower}:${days}`;
      
      console.log(`[History API] Fetching historical data for ${symbolUpper} (${days} days)`);
      
      // Check in-memory cache first
      const cachedEntry = historicalCache.get(cacheKey);
      const now = Date.now();
      
      if (cachedEntry) {
        const cacheAge = now - cachedEntry.timestamp;
        console.log(`[History API] Cache age for ${cacheKey}: ${Math.round(cacheAge / 1000)}s`);
        
        if (cacheAge < HISTORY_CACHE_DURATION_MS) {
          console.log(`[History API] Serving cached historical data for ${cacheKey}`);
          return res.json(cachedEntry.data);
        }
      }
      
      console.log(`[History API] Cache miss/stale for ${cacheKey}, fetching from CoinGecko`);
      
      let lastError: Error | null = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for historical data
          
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${symbolLower}/market_chart?vs_currency=usd&days=${days}`,
            { 
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'DCAlytics/1.0'
              }
            }
          );
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`CoinGecko History API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log(`[History API] CoinGecko historical response for ${symbolLower}: ${data.prices?.length || 0} price points`);
          
          if (!data.prices || !Array.isArray(data.prices)) {
            console.log(`[History API] No price data found for ${symbolLower}`);
            
            // Serve stale cache as fallback for invalid responses
            if (cachedEntry) {
              const cacheAge = now - cachedEntry.timestamp;
              console.log(`[History API] Serving stale cached data (${Math.round(cacheAge / 60000)} min old) due to invalid CoinGecko response for ${cacheKey}`);
              return res.json(cachedEntry.data);
            }
            
            return res.status(404).json({ error: "Historical data not found" });
          }
          
          const formattedData = data.prices.map((price: [number, number]) => ({
            timestamp: new Date(price[0]).toISOString(),
            price: price[1],
          }));
          
          // Cache the successful response
          historicalCache.set(cacheKey, {
            data: formattedData,
            timestamp: now
          });
          
          console.log(`[History API] Successfully fetched and cached ${formattedData.length} historical price points for ${symbolUpper}`);
          res.json(formattedData);
          return;
          
        } catch (error) {
          lastError = error as Error;
          console.log(`[History API] Attempt ${attempt}/${maxRetries} failed for ${symbolUpper}:`, error instanceof Error ? error.message : error);
          
          if (attempt < maxRetries) {
            // Exponential backoff: 2s, 4s, 8s
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`[History API] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // All retries failed - check for stale cache fallback
      console.error(`[History API] All attempts failed for ${symbolUpper}:`, lastError?.message);
      
      // Serve stale cache as last resort
      if (cachedEntry) {
        const cacheAge = now - cachedEntry.timestamp;
        console.log(`[History API] Serving stale cached data (${Math.round(cacheAge / 60000)} min old) for ${cacheKey}`);
        return res.json(cachedEntry.data);
      }
      
      res.status(500).json({ 
        error: "Failed to fetch historical data", 
        details: lastError?.message || "Unknown error"
      });
      
    } catch (error) {
      console.error(`[History API] Unexpected error for ${req.params.symbol}:`, error);
      res.status(500).json({ error: "Internal server error" });
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
  app.post("/api/dca-strategies", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertDCAStrategySchema.parse(req.body);
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        throw new ValidationError("User ID not found in token");
      }
      
      const strategy = await wrapDatabaseOperation(
        () => storage.createDCAStrategy({
          ...validatedData,
          userId,
        }),
        "DCA strategy creation"
      );
      
      res.json(strategy);
    } catch (error) {
      handleError(error, res, "POST /api/dca-strategies");
    }
  });

  app.get("/api/dca-strategies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        throw new ValidationError("User ID not found in token");
      }
      
      const strategies = await wrapDatabaseOperation(
        () => storage.getDCAStrategies(userId),
        "DCA strategies fetch"
      );
      
      res.json(strategies);
    } catch (error) {
      handleError(error, res, "GET /api/dca-strategies");
    }
  });

  // DCA calculation endpoint
  app.post("/api/calculate-dca", async (req, res) => {
    try {
      const { amount, frequency, duration } = req.body;
      
      if (!amount || !frequency || !duration) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "Invalid amount: must be a positive number" });
      }
      
      // Calculate frequency multiplier
      const frequencyMap = {
        'weekly': 52,
        'biweekly': 26,
        'monthly': 12
      };
      
      const purchasesPerYear = frequencyMap[frequency as keyof typeof frequencyMap] || 12;
      const totalPurchases = Math.floor((duration / 12) * purchasesPerYear);
      const totalInvestment = parsedAmount * totalPurchases;
      
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
        avgPurchaseAmount: parsedAmount,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate DCA strategy" });
    }
  });

  // Portfolio route
  app.get("/api/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        throw new ValidationError("User ID not found in token");
      }
      
      const portfolio = await wrapDatabaseOperation(
        () => storage.getPortfolio(userId),
        "Portfolio fetch"
      );
      
      if (!portfolio) {
        // Create default portfolio
        const newPortfolio = await wrapDatabaseOperation(
          () => storage.updatePortfolio(userId, {
            totalBTC: '1.2847',
            totalInvested: '42500.00',
          }),
          "Default portfolio creation"
        );
        return res.json(newPortfolio);
      }
      
      res.json(portfolio);
    } catch (error) {
      handleError(error, res, "GET /api/portfolio");
    }
  });

  // ML-Enhanced Simulation endpoint
  app.post("/api/simulate-dca", async (req, res) => {
    try {
      const { startDate, endDate, amount } = req.body;
      
      if (!startDate || !endDate || !amount) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: "Invalid amount: must be a positive number" });
      }
      
      // This is a simplified simulation - in production you'd use historical price data
      const monthsInPeriod = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      const totalInvested = parsedAmount * monthsInPeriod;
      
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

  // ML Price Prediction endpoint
  app.post("/api/ml/predict-price", async (req, res) => {
    try {
      const { days_ahead = 7, model_type = "lstm" } = req.body;
      
      // Call ML service
      const response = await fetch("http://localhost:8001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days_ahead, model_type })
      });
      
      if (!response.ok) {
        throw new Error(`ML service responded with ${response.status}`);
      }
      
      const prediction = await response.json();
      res.json(prediction);
    } catch (error) {
      console.error("ML prediction error:", error);
      res.status(500).json({ error: "Failed to get price prediction" });
    }
  });

  // ML DCA Optimization endpoint
  app.post("/api/ml/optimize-dca", async (req, res) => {
    try {
      const { investment_amount, duration_months, risk_tolerance = "medium" } = req.body;
      
      if (!investment_amount || !duration_months) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Call ML service
      const response = await fetch("http://localhost:8001/optimize-dca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investment_amount, duration_months, risk_tolerance })
      });
      
      if (!response.ok) {
        throw new Error(`ML service responded with ${response.status}`);
      }
      
      const optimization = await response.json();
      res.json(optimization);
    } catch (error) {
      console.error("ML optimization error:", error);
      res.status(500).json({ error: "Failed to optimize DCA strategy" });
    }
  });

  // ML Model Performance endpoint
  app.get("/api/ml/model-performance", async (req, res) => {
    try {
      const response = await fetch("http://localhost:8001/model-performance");
      
      if (!response.ok) {
        throw new Error(`ML service responded with ${response.status}`);
      }
      
      const performance = await response.json();
      res.json(performance);
    } catch (error) {
      console.error("ML performance error:", error);
      res.status(500).json({ error: "Failed to get model performance" });
    }
  });

  // Project routes
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create project" });
      }
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.put("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update project" });
      }
    }
  });

  // Ticket routes
  app.get("/api/tickets", isAuthenticated, async (req, res) => {
    try {
      const { projectId } = req.query;
      const tickets = await storage.getTickets(projectId as string);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTicketSchema.parse(req.body);
      const userId = req.user?.claims?.sub;
      
      const ticket = await storage.createTicket({
        ...validatedData,
        reportedBy: userId,
      });
      
      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create ticket" });
      }
    }
  });

  app.get("/api/tickets/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await storage.getTicket(id);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  app.put("/api/tickets/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTicketSchema.partial().parse(req.body);
      const ticket = await storage.updateTicket(id, validatedData);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update ticket" });
      }
    }
  });

  // Ticket comment routes
  app.get("/api/tickets/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getTicketComments(id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket comments" });
    }
  });

  app.post("/api/tickets/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTicketCommentSchema.parse(req.body);
      const userId = req.user?.claims?.sub;
      
      const comment = await storage.createTicketComment({
        ...validatedData,
        ticketId: id,
        userId,
      });
      
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create comment" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

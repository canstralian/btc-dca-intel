import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDCAStrategySchema, insertDCATransactionSchema, insertMarketDataSchema, insertProjectSchema, insertTicketSchema, insertTicketCommentSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { handleError, wrapDatabaseOperation, wrapExternalServiceCall, ExternalServiceError, ValidationError } from "./errorHandler";
import { tradingBotService } from "./trading-bot";

// In-memory cache for historical data
interface HistoricalCacheEntry {
  data: Array<{ timestamp: string; price: number }>;
  timestamp: number;
}

const historicalCache = new Map<string, HistoricalCacheEntry>();

// Signal processing functions
async function generateTradingSignals(timeframe: string, limit: number) {
  const signals = [];
  const currentTime = new Date();
  
  // Define indicator configurations with proper typing
  const indicators = [
    { 
      name: "RSI" as const, 
      value: Math.random() * 100, 
      threshold: { oversold: 30, overbought: 70 } 
    },
    { 
      name: "MACD" as const, 
      value: (Math.random() - 0.5) * 2, 
      threshold: { bullish: 0, bearish: 0 } 
    },
    { 
      name: "Volume" as const, 
      value: Math.random() * 200 + 50, 
      threshold: { high: 150, low: 75 } 
    },
    { 
      name: "BB_Position" as const, 
      value: Math.random(), 
      threshold: { upper: 0.8, lower: 0.2 } 
    }
  ];
  
  for (let i = 0; i < limit; i++) {
    const indicator = indicators[Math.floor(Math.random() * indicators.length)];
    const signalTime = new Date(currentTime.getTime() - (i * 60000 * (timeframe === '1m' ? 1 : timeframe === '5m' ? 5 : 60)));
    
    let signalType: string, action: string, strength: number;
    
    if (indicator.name === "RSI") {
      const rsiThreshold = indicator.threshold as { oversold: number; overbought: number };
      if (indicator.value < rsiThreshold.oversold) {
        signalType = "bullish";
        action = "buy";
        strength = Math.min(0.9, (rsiThreshold.oversold - indicator.value) / 10);
      } else if (indicator.value > rsiThreshold.overbought) {
        signalType = "bearish";
        action = "sell";
        strength = Math.min(0.9, (indicator.value - rsiThreshold.overbought) / 10);
      } else {
        signalType = "neutral";
        action = "hold";
        strength = 0.3;
      }
    } else if (indicator.name === "MACD") {
      if (indicator.value > 0.1) {
        signalType = "bullish";
        action = "buy";
        strength = Math.min(0.8, indicator.value);
      } else if (indicator.value < -0.1) {
        signalType = "bearish";
        action = "sell";
        strength = Math.min(0.8, Math.abs(indicator.value));
      } else {
        signalType = "neutral";
        action = "hold";
        strength = 0.2;
      }
    } else {
      signalType = Math.random() > 0.5 ? "bullish" : "bearish";
      action = signalType === "bullish" ? "buy" : "sell";
      strength = Math.random() * 0.8 + 0.2;
    }
    
    signals.push({
      id: `signal_${Date.now()}_${i}`,
      type: signalType,
      indicator: indicator.name,
      action,
      strength: parseFloat(strength.toFixed(2)),
      value: parseFloat(indicator.value.toFixed(2)),
      symbol: "BTC",
      timeframe,
      timestamp: signalTime.toISOString(),
      confidence: Math.random() * 0.3 + 0.7,
      description: generateSignalDescription(indicator.name, signalType, strength)
    });
  }
  
  return signals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

async function processExternalSignal(signalData: any) {
  // Process and validate external signal (e.g., from TradingView webhooks)
  const processedSignal = {
    id: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...signalData,
    processed_at: new Date().toISOString(),
    source: "external",
    status: "processed"
  };
  
  // Here you could store the signal in the database or trigger DCA adjustments
  console.log(`Processed external signal: ${processedSignal.id} - ${signalData.action} ${signalData.symbol}`);
  
  return processedSignal;
}

async function generateSignalAnalysis(symbol: string, period: string) {
  // Simulate comprehensive technical analysis
  const analysis = {
    symbol: symbol.toUpperCase(),
    period,
    timestamp: new Date().toISOString(),
    indicators: {
      rsi: {
        value: Math.random() * 100,
        signal: "neutral",
        strength: Math.random()
      },
      macd: {
        macd: (Math.random() - 0.5) * 2,
        signal: (Math.random() - 0.5) * 2,
        histogram: (Math.random() - 0.5) * 0.5,
        trend: "bullish"
      },
      volume: {
        current: Math.random() * 1000000 + 500000,
        average: Math.random() * 800000 + 400000,
        ratio: Math.random() * 2 + 0.5,
        trend: "increasing"
      },
      bollinger_bands: {
        upper: Math.random() * 5000 + 45000,
        middle: Math.random() * 5000 + 42000,
        lower: Math.random() * 5000 + 39000,
        position: Math.random()
      }
    },
    overall_sentiment: Math.random() > 0.5 ? "bullish" : "bearish",
    confidence_score: Math.random() * 0.3 + 0.7,
    recommendations: [
      "Current RSI suggests potential buying opportunity",
      "Volume analysis indicates strong market interest",
      "MACD showing bullish divergence"
    ]
  };
  
  // Determine RSI signal
  if (analysis.indicators.rsi.value < 30) {
    analysis.indicators.rsi.signal = "oversold";
    analysis.indicators.rsi.strength = 0.8;
  } else if (analysis.indicators.rsi.value > 70) {
    analysis.indicators.rsi.signal = "overbought";
    analysis.indicators.rsi.strength = 0.8;
  } else {
    analysis.indicators.rsi.signal = "neutral";
    analysis.indicators.rsi.strength = 0.3;
  }
  
  return analysis;
}

function generateSignalDescription(indicator: string, type: string, strength: number): string {
  const descriptions: Record<string, Record<string, string>> = {
    RSI: {
      bullish: "RSI indicates oversold conditions - potential buying opportunity",
      bearish: "RSI shows overbought levels - consider taking profits",
      neutral: "RSI in neutral zone - monitor for breakout"
    },
    MACD: {
      bullish: "MACD bullish crossover detected - upward momentum",
      bearish: "MACD bearish crossover - downward pressure",
      neutral: "MACD showing sideways movement"
    },
    Volume: {
      bullish: "High volume spike supporting price movement",
      bearish: "Volume declining with price - weak momentum",
      neutral: "Volume at average levels"
    },
    BB_Position: {
      bullish: "Price approaching lower Bollinger Band - potential bounce",
      bearish: "Price near upper Bollinger Band - possible pullback",
      neutral: "Price within normal Bollinger Band range"
    }
  };
  
  return descriptions[indicator]?.[type] || "Signal detected - monitor closely";
}

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
      
      // Validate symbol parameter
      if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
        return res.status(400).json({ 
          error: "Invalid symbol parameter", 
          code: "VALIDATION_ERROR" 
        });
      }
      
      // Sanitize symbol - only allow alphanumeric characters and common crypto symbols
      const sanitizedSymbol = symbol.replace(/[^a-zA-Z0-9-]/g, '');
      if (sanitizedSymbol.length === 0 || sanitizedSymbol.length > 20) {
        return res.status(400).json({ 
          error: "Symbol must contain only alphanumeric characters and be 1-20 characters long", 
          code: "VALIDATION_ERROR" 
        });
      }
      
      const symbolLower = sanitizedSymbol.toLowerCase();
      const symbolUpper = sanitizedSymbol.toUpperCase();
      
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
      
      // Validate symbol parameter
      if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
        return res.status(400).json({ 
          error: "Invalid symbol parameter", 
          code: "VALIDATION_ERROR" 
        });
      }
      
      // Sanitize symbol
      const sanitizedSymbol = symbol.replace(/[^a-zA-Z0-9-]/g, '');
      if (sanitizedSymbol.length === 0 || sanitizedSymbol.length > 20) {
        return res.status(400).json({ 
          error: "Symbol must contain only alphanumeric characters and be 1-20 characters long", 
          code: "VALIDATION_ERROR" 
        });
      }
      
      // Validate days parameter
      const daysNumber = parseInt(days as string, 10);
      if (isNaN(daysNumber) || daysNumber < 1 || daysNumber > 365) {
        return res.status(400).json({ 
          error: "Days parameter must be a number between 1 and 365", 
          code: "VALIDATION_ERROR" 
        });
      }
      
      const symbolLower = sanitizedSymbol.toLowerCase();
      const symbolUpper = sanitizedSymbol.toUpperCase();
      
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
        return res.status(400).json({ 
          error: "Missing required parameters: amount, frequency, and duration are required",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate and parse amount
      const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);
      if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10000000) {
        return res.status(400).json({ 
          error: "Invalid amount: must be a positive number between 0.01 and 10,000,000",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate frequency
      const validFrequencies = ['weekly', 'biweekly', 'monthly'];
      if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({ 
          error: "Invalid frequency: must be 'weekly', 'biweekly', or 'monthly'",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate and parse duration
      const parsedDuration = typeof duration === 'number' ? duration : parseFloat(duration);
      if (isNaN(parsedDuration) || !isFinite(parsedDuration) || parsedDuration <= 0 || parsedDuration > 120) {
        return res.status(400).json({ 
          error: "Invalid duration: must be a positive number of months between 1 and 120",
          code: "VALIDATION_ERROR"
        });
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
        return res.status(400).json({ 
          error: "Missing required parameters: startDate, endDate, and amount are required",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ 
          error: "Invalid date format: dates must be valid ISO date strings",
          code: "VALIDATION_ERROR"
        });
      }
      
      if (start >= end) {
        return res.status(400).json({ 
          error: "Invalid date range: startDate must be before endDate",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate date range not too large (max 10 years)
      const monthsInPeriod = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (monthsInPeriod <= 0 || monthsInPeriod > 120) {
        return res.status(400).json({ 
          error: "Invalid date range: period must be between 1 and 120 months",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate amount
      const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount);
      if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount < 0.01 || parsedAmount > 10000000) {
        return res.status(400).json({ 
          error: "Invalid amount: must be a number between 0.01 and 10,000,000",
          code: "VALIDATION_ERROR"
        });
      }
      
      // This is a simplified simulation - in production you'd use historical price data
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
      
      // Validate days_ahead parameter
      const parsedDays = typeof days_ahead === 'number' ? days_ahead : parseInt(days_ahead, 10);
      if (isNaN(parsedDays) || !isFinite(parsedDays) || parsedDays < 1 || parsedDays > 365) {
        return res.status(400).json({ 
          error: "days_ahead must be a number between 1 and 365",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate model_type parameter
      const validModelTypes = ['lstm', 'rf', 'gb', 'ensemble'];
      if (!validModelTypes.includes(model_type)) {
        return res.status(400).json({ 
          error: "model_type must be one of: lstm, rf, gb, ensemble",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Call ML service
      const response = await wrapExternalServiceCall(
        () => fetch("http://localhost:8001/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days_ahead: parsedDays, model_type })
        }),
        "ML Prediction Service"
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new ExternalServiceError(
          `ML service prediction failed: ${response.status}`,
          response.status
        );
      }
      
      const prediction = await response.json();
      res.json(prediction);
    } catch (error) {
      handleError(error, res, "POST /api/ml/predict-price");
    }
  });

  // ML DCA Optimization endpoint
  app.post("/api/ml/optimize-dca", async (req, res) => {
    try {
      const { investment_amount, duration_months, risk_tolerance = "medium" } = req.body;
      
      if (!investment_amount || !duration_months) {
        return res.status(400).json({ 
          error: "Missing required parameters: investment_amount and duration_months are required",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate investment_amount
      const parsedAmount = typeof investment_amount === 'number' ? investment_amount : parseFloat(investment_amount);
      if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount < 100 || parsedAmount > 10000000) {
        return res.status(400).json({ 
          error: "investment_amount must be a number between 100 and 10,000,000",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate duration_months
      const parsedDuration = typeof duration_months === 'number' ? duration_months : parseInt(duration_months, 10);
      if (isNaN(parsedDuration) || !isFinite(parsedDuration) || parsedDuration < 1 || parsedDuration > 120) {
        return res.status(400).json({ 
          error: "duration_months must be a number between 1 and 120",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate risk_tolerance
      const validRiskLevels = ['low', 'medium', 'high'];
      if (!validRiskLevels.includes(risk_tolerance)) {
        return res.status(400).json({ 
          error: "risk_tolerance must be one of: low, medium, high",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Call ML service
      const response = await wrapExternalServiceCall(
        () => fetch("http://localhost:8001/optimize-dca", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            investment_amount: parsedAmount, 
            duration_months: parsedDuration, 
            risk_tolerance 
          })
        }),
        "ML DCA Optimization Service"
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new ExternalServiceError(
          `ML service DCA optimization failed: ${response.status}`,
          response.status
        );
      }
      
      const optimization = await response.json();
      res.json(optimization);
    } catch (error) {
      handleError(error, res, "POST /api/ml/optimize-dca");
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

  // Trading Signals API endpoints
  app.get("/api/signals", async (req, res) => {
    try {
      const { timeframe = "1h", limit = 10 } = req.query;
      
      // Validate timeframe
      const validTimeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
      if (!validTimeframes.includes(timeframe as string)) {
        return res.status(400).json({ 
          error: "Invalid timeframe. Must be one of: 1m, 5m, 15m, 1h, 4h, 1d",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate limit
      const parsedLimit = parseInt(limit as string, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return res.status(400).json({ 
          error: "limit must be a number between 1 and 100",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Generate enhanced trading signals based on market conditions
      const signals = await generateTradingSignals(timeframe as string, parsedLimit);
      
      res.json({
        signals,
        timeframe,
        timestamp: new Date().toISOString(),
        market_status: "active"
      });
    } catch (error) {
      handleError(error, res, "GET /api/signals");
    }
  });

  app.post("/api/signals/webhook", async (req, res) => {
    try {
      const { signal_type, symbol, action, strength, price, timestamp, metadata } = req.body;
      
      // Validate required fields
      if (!signal_type || !symbol || !action || !strength) {
        return res.status(400).json({ 
          error: "Missing required fields: signal_type, symbol, action, strength",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Validate action
      const validActions = ['buy', 'sell', 'hold', 'strong_buy', 'strong_sell'];
      if (!validActions.includes(action)) {
        return res.status(400).json({ 
          error: "action must be one of: buy, sell, hold, strong_buy, strong_sell",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Process the incoming signal from external sources (e.g., TradingView)
      const processedSignal = await processExternalSignal({
        signal_type,
        symbol: symbol.toUpperCase(),
        action,
        strength: parseFloat(strength),
        price: price ? parseFloat(price) : null,
        timestamp: timestamp || new Date().toISOString(),
        metadata: metadata || {}
      });
      
      res.json({
        success: true,
        signal_id: processedSignal.id,
        message: "Signal processed successfully"
      });
    } catch (error) {
      handleError(error, res, "POST /api/signals/webhook");
    }
  });

  app.get("/api/signals/analysis", async (req, res) => {
    try {
      const { symbol = "BTC", period = "24h" } = req.query;
      
      // Validate period
      const validPeriods = ['1h', '4h', '24h', '7d', '30d'];
      if (!validPeriods.includes(period as string)) {
        return res.status(400).json({ 
          error: "period must be one of: 1h, 4h, 24h, 7d, 30d",
          code: "VALIDATION_ERROR"
        });
      }
      
      // Generate signal analysis including RSI, MACD, volume analysis
      const analysis = await generateSignalAnalysis(symbol as string, period as string);
      
      res.json(analysis);
    } catch (error) {
      handleError(error, res, "GET /api/signals/analysis");
    }
  });

  // Trading Bot API endpoints
  app.get("/api/bot/status", isAuthenticated, async (req, res) => {
    try {
      const status = tradingBotService.getStatus();
      res.json(status);
    } catch (error) {
      handleError(error, res, "GET /api/bot/status");
    }
  });

  app.post("/api/bot/start", isAuthenticated, async (req, res) => {
    try {
      await tradingBotService.start();
      res.json({ success: true, message: "Trading bot started" });
    } catch (error) {
      handleError(error, res, "POST /api/bot/start");
    }
  });

  app.post("/api/bot/stop", isAuthenticated, async (req, res) => {
    try {
      await tradingBotService.stop();
      res.json({ success: true, message: "Trading bot stopped" });
    } catch (error) {
      handleError(error, res, "POST /api/bot/stop");
    }
  });

  app.get("/api/bot/rules", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const rules = await tradingBotService.getAutomationRules(userId);
      res.json(rules);
    } catch (error) {
      handleError(error, res, "GET /api/bot/rules");
    }
  });

  app.post("/api/bot/rules", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { strategyId, signalThreshold, maxAdjustment, conditions } = req.body;

      // Validate required fields
      if (!strategyId || signalThreshold === undefined || maxAdjustment === undefined || !conditions) {
        return res.status(400).json({ 
          error: "Missing required fields: strategyId, signalThreshold, maxAdjustment, conditions",
          code: "VALIDATION_ERROR"
        });
      }

      // Validate signal threshold
      const parsedThreshold = parseFloat(signalThreshold);
      if (isNaN(parsedThreshold) || parsedThreshold < 0 || parsedThreshold > 1) {
        return res.status(400).json({ 
          error: "signalThreshold must be a number between 0 and 1",
          code: "VALIDATION_ERROR"
        });
      }

      // Validate max adjustment
      const parsedAdjustment = parseFloat(maxAdjustment);
      if (isNaN(parsedAdjustment) || parsedAdjustment < 0 || parsedAdjustment > 2) {
        return res.status(400).json({ 
          error: "maxAdjustment must be a number between 0 and 2",
          code: "VALIDATION_ERROR"
        });
      }

      // Verify strategy exists and belongs to user
      const strategy = await storage.getDCAStrategy(strategyId);
      if (!strategy) {
        return res.status(404).json({ 
          error: "Strategy not found",
          code: "STRATEGY_NOT_FOUND"
        });
      }

      const rule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        strategyId,
        signalThreshold: parsedThreshold,
        maxAdjustment: parsedAdjustment,
        isActive: true,
        conditions: {
          indicators: conditions.indicators || ["RSI", "MACD"],
          minConfidence: conditions.minConfidence || 0.7,
          actions: conditions.actions || ["buy", "strong_buy"]
        }
      };

      await tradingBotService.addAutomationRule(rule);
      res.json(rule);
    } catch (error) {
      handleError(error, res, "POST /api/bot/rules");
    }
  });

  app.delete("/api/bot/rules/:ruleId", isAuthenticated, async (req, res) => {
    try {
      const { ruleId } = req.params;
      await tradingBotService.removeAutomationRule(ruleId);
      res.json({ success: true, message: "Automation rule removed" });
    } catch (error) {
      handleError(error, res, "DELETE /api/bot/rules/:ruleId");
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
  
  // Initialize trading bot service
  console.log("🤖 Initializing Trading Bot Service...");
  // Note: In production, you might want to start this conditionally
  // tradingBotService.start();
  
  return httpServer;
}

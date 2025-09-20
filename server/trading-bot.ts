import { storage } from "./storage";
import { insertDCATransactionSchema } from "@shared/schema";

interface TradingSignal {
  id: string;
  type: string;
  indicator: string;
  action: string;
  strength: number;
  symbol: string;
  timestamp: string;
  confidence: number;
}

interface AutomationRule {
  id: string;
  userId: string;
  strategyId: string;
  signalThreshold: number;
  maxAdjustment: number;
  isActive: boolean;
  conditions: {
    indicators: string[];
    minConfidence: number;
    actions: string[];
  };
}

class TradingBotService {
  private rules: Map<string, AutomationRule> = new Map();
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.loadAutomationRules();
  }

  async start() {
    if (this.isRunning) {
      console.log("Trading bot is already running");
      return;
    }

    this.isRunning = true;
    console.log("🤖 Trading Bot Service started");

    // Run signal processing every 30 seconds
    this.intervalId = setInterval(async () => {
      await this.processSignals();
    }, 30000);

    // Initial run
    await this.processSignals();
  }

  async stop() {
    if (!this.isRunning) {
      console.log("Trading bot is not running");
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log("🤖 Trading Bot Service stopped");
  }

  async processSignals() {
    try {
      console.log("🔍 Processing trading signals...");
      
      // Fetch current market signals
      const signals = await this.fetchCurrentSignals();
      
      // Process each active automation rule
      const rules = Array.from(this.rules.values());
      for (const rule of rules) {
        if (!rule.isActive) continue;
        
        await this.processRuleAgainstSignals(rule, signals);
      }
    } catch (error) {
      console.error("Error processing signals:", error);
    }
  }

  private async fetchCurrentSignals(): Promise<TradingSignal[]> {
    // In a real implementation, this would fetch from your signals API
    // For now, we'll simulate some signals
    return [
      {
        id: `signal_${Date.now()}`,
        type: "bullish",
        indicator: "RSI",
        action: "buy",
        strength: 0.75,
        symbol: "BTC",
        timestamp: new Date().toISOString(),
        confidence: 0.85
      }
    ];
  }

  private async processRuleAgainstSignals(rule: AutomationRule, signals: TradingSignal[]) {
    try {
      // Filter signals based on rule conditions
      const relevantSignals = signals.filter(signal => 
        rule.conditions.indicators.includes(signal.indicator) &&
        rule.conditions.actions.includes(signal.action) &&
        signal.confidence >= rule.conditions.minConfidence &&
        signal.strength >= rule.signalThreshold
      );

      if (relevantSignals.length === 0) {
        return;
      }

      console.log(`📊 Found ${relevantSignals.length} relevant signals for rule ${rule.id}`);

      // Get the DCA strategy
      const strategy = await storage.getDCAStrategy(rule.strategyId);
      if (!strategy || !strategy.isActive) {
        console.log(`Strategy ${rule.strategyId} not found or inactive`);
        return;
      }

      // Calculate adjustment based on signal strength
      const avgSignalStrength = relevantSignals.reduce((sum, s) => sum + s.strength, 0) / relevantSignals.length;
      const adjustment = Math.min(rule.maxAdjustment, avgSignalStrength);
      
      // Determine if we should execute a DCA transaction
      const shouldExecute = await this.shouldExecuteTransaction(rule, relevantSignals, adjustment);
      
      if (shouldExecute) {
        await this.executeDCATransaction(rule, strategy, adjustment, relevantSignals[0]);
      }
    } catch (error) {
      console.error(`Error processing rule ${rule.id}:`, error);
    }
  }

  private async shouldExecuteTransaction(
    rule: AutomationRule, 
    signals: TradingSignal[], 
    adjustment: number
  ): Promise<boolean> {
    // Basic logic to prevent over-trading
    const recentTransactions = await storage.getDCATransactions(rule.strategyId);
    const lastTransaction = recentTransactions[0];
    
    if (lastTransaction && lastTransaction.executedAt) {
      const timeSinceLastTransaction = Date.now() - new Date(lastTransaction.executedAt).getTime();
      const minInterval = 15 * 60 * 1000; // 15 minutes minimum between transactions
      
      if (timeSinceLastTransaction < minInterval) {
        console.log(`Skipping transaction for rule ${rule.id}: too soon since last transaction`);
        return false;
      }
    }

    // Check if signals are strong enough
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    return avgConfidence >= 0.7 && adjustment >= 0.5;
  }

  private async executeDCATransaction(
    rule: AutomationRule, 
    strategy: any, 
    adjustment: number, 
    signal: TradingSignal
  ) {
    try {
      // Calculate adjusted amount based on signal strength
      const baseAmount = parseFloat(strategy.amount);
      const adjustedAmount = baseAmount * (1 + (adjustment - 0.5)); // Adjust by ±50% based on signal
      
      // Get current BTC price (mock for now)
      const currentPrice = 45000 + (Math.random() - 0.5) * 10000; // Mock price
      const btcAmount = adjustedAmount / currentPrice;
      
      console.log(`🚀 Executing DCA transaction for strategy ${strategy.id}:`);
      console.log(`   Amount: $${adjustedAmount.toFixed(2)} (adjusted from $${baseAmount})`);
      console.log(`   BTC Price: $${currentPrice.toFixed(2)}`);
      console.log(`   BTC Amount: ${btcAmount.toFixed(8)}`);
      console.log(`   Signal: ${signal.indicator} ${signal.action} (strength: ${signal.strength})`);

      // Create transaction record
      const transaction = await storage.createDCATransaction({
        strategyId: strategy.id,
        amount: adjustedAmount.toFixed(2),
        btcPrice: currentPrice.toFixed(2),
        btcAmount: btcAmount.toFixed(8)
      });

      console.log(`✅ Transaction created: ${transaction.id}`);
      
      // In a real implementation, you would:
      // 1. Execute the actual trade via exchange API
      // 2. Update portfolio balances
      // 3. Send notifications to user
      // 4. Log the transaction with signal metadata
      
    } catch (error) {
      console.error(`Error executing DCA transaction:`, error);
    }
  }

  private async loadAutomationRules() {
    // In a real implementation, load from database
    // For now, create some default rules
    const defaultRule: AutomationRule = {
      id: "default-btc-rule",
      userId: "default-user",
      strategyId: "default-strategy",
      signalThreshold: 0.6,
      maxAdjustment: 0.5, // Max 50% adjustment
      isActive: true,
      conditions: {
        indicators: ["RSI", "MACD", "Volume"],
        minConfidence: 0.7,
        actions: ["buy", "strong_buy"]
      }
    };

    this.rules.set(defaultRule.id, defaultRule);
    console.log(`Loaded ${this.rules.size} automation rules`);
  }

  async addAutomationRule(rule: AutomationRule) {
    this.rules.set(rule.id, rule);
    console.log(`Added automation rule: ${rule.id}`);
  }

  async removeAutomationRule(ruleId: string) {
    this.rules.delete(ruleId);
    console.log(`Removed automation rule: ${ruleId}`);
  }

  async getAutomationRules(userId?: string): Promise<AutomationRule[]> {
    const rules = Array.from(this.rules.values());
    return userId ? rules.filter(rule => rule.userId === userId) : rules;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeRules: this.rules.size,
      uptime: this.isRunning ? Date.now() : null
    };
  }
}

// Export singleton instance
export const tradingBotService = new TradingBotService();
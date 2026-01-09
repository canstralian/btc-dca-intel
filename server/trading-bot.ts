import { storage } from "./storage";

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

interface AutomationRuleConditions {
  indicators: string[];
  minConfidence: number;
  actions: string[];
}

interface AutomationRule {
  id: string;
  userId: string;
  strategyId: string;
  signalThreshold: number;
  maxAdjustment: number;
  isActive: boolean;
  conditions: AutomationRuleConditions;
}

const PROCESS_INTERVAL_MS = 30_000;
const MINUTES_15_MS = 15 * 60 * 1000;

/**
 * Orchestrates trading automation by pairing incoming signals with DCA rules
 * and executing trades when thresholds are met.
 */
class TradingBotService {
  private rules: Map<string, AutomationRule> = new Map();
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.loadAutomationRules();
  }

  /**
   * Starts the automation loop if it is not already running.
   */
  async start() {
    if (this.isRunning) {
      console.log("Trading bot is already running");
      return;
    }

    this.isRunning = true;
    console.log("🤖 Trading Bot Service started");

    this.intervalId = setInterval(() => void this.processSignals(), PROCESS_INTERVAL_MS);
    await this.processSignals();
  }

  /**
   * Stops the automation loop and prevents additional processing cycles.
   */
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

  /**
   * Fetches trading signals and evaluates them against all active rules.
   */
  async processSignals() {
    try {
      console.log("🔍 Processing trading signals...");
      const signals = await this.fetchCurrentSignals();

      await Promise.all(
        Array.from(this.rules.values())
          .filter(rule => rule.isActive)
          .map(rule => this.processRuleAgainstSignals(rule, signals))
      );
    } catch (error) {
      console.error("Error processing signals:", error);
    }
  }

  /**
   * TODO: Replace mock signal generation with live signal ingestion from telemetry services.
   */
  private async fetchCurrentSignals(): Promise<TradingSignal[]> {
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
      const relevantSignals = this.filterSignals(signals, rule.conditions, rule.signalThreshold);
      if (relevantSignals.length === 0) return;

      console.log(`📊 Found ${relevantSignals.length} relevant signals for rule ${rule.id}`);

      const strategy = await storage.getDCAStrategy(rule.strategyId);
      if (!strategy || !strategy.isActive) {
        console.log(`Strategy ${rule.strategyId} not found or inactive`);
        return;
      }

      const adjustment = this.calculateAdjustment(relevantSignals, rule.maxAdjustment);
      const shouldExecute = await this.shouldExecuteTransaction(rule, relevantSignals, adjustment);

      if (shouldExecute) {
        await this.executeDCATransaction(rule, strategy, adjustment, relevantSignals[0]);
      }
    } catch (error) {
      console.error(`Error processing rule ${rule.id}:`, error);
    }
  }

  private filterSignals(
    signals: TradingSignal[],
    conditions: AutomationRuleConditions,
    signalThreshold: number
  ) {
    return signals.filter(signal =>
      conditions.indicators.includes(signal.indicator) &&
      conditions.actions.includes(signal.action) &&
      signal.confidence >= conditions.minConfidence &&
      signal.strength >= signalThreshold
    );
  }

  private calculateAdjustment(signals: TradingSignal[], maxAdjustment: number) {
    const averageStrength = this.calculateAverage(signals.map(signal => signal.strength));
    return Math.min(maxAdjustment, averageStrength);
  }

  private calculateAverage(values: number[]) {
    const total = values.reduce((sum, value) => sum + value, 0);
    return values.length ? total / values.length : 0;
  }

  private async shouldExecuteTransaction(
    rule: AutomationRule,
    signals: TradingSignal[],
    adjustment: number
  ): Promise<boolean> {
    const recentTransactions = await storage.getDCATransactions(rule.strategyId);
    const lastTransaction = recentTransactions[0];

    if (lastTransaction?.executedAt) {
      const timeSinceLastTransaction = Date.now() - new Date(lastTransaction.executedAt).getTime();
      if (timeSinceLastTransaction < MINUTES_15_MS) {
        console.log(`Skipping transaction for rule ${rule.id}: too soon since last transaction`);
        return false;
      }
    }

    const avgConfidence = this.calculateAverage(signals.map(signal => signal.confidence));
    return avgConfidence >= 0.7 && adjustment >= 0.5;
  }

  private async executeDCATransaction(
    rule: AutomationRule,
    strategy: any,
    adjustment: number,
    signal: TradingSignal
  ) {
    try {
      const baseAmount = parseFloat(strategy.amount);
      const adjustedAmount = baseAmount * (1 + (adjustment - 0.5));
      const currentPrice = 45_000 + (Math.random() - 0.5) * 10_000;
      const btcAmount = adjustedAmount / currentPrice;

      console.log(`🚀 Executing DCA transaction for strategy ${strategy.id}:`);
      console.log(`   Amount: $${adjustedAmount.toFixed(2)} (adjusted from $${baseAmount})`);
      console.log(`   BTC Price: $${currentPrice.toFixed(2)}`);
      console.log(`   BTC Amount: ${btcAmount.toFixed(8)}`);
      console.log(`   Signal: ${signal.indicator} ${signal.action} (strength: ${signal.strength})`);

      const transaction = await storage.createDCATransaction({
        strategyId: strategy.id,
        amount: adjustedAmount.toFixed(2),
        btcPrice: currentPrice.toFixed(2),
        btcAmount: btcAmount.toFixed(8)
      });

      console.log(`✅ Transaction created: ${transaction.id}`);

      // TODO: Execute exchange API trade and capture response metadata for auditing.
      // TODO: Attach observability hooks (metrics + tracing) for transaction lifecycle events.
    } catch (error) {
      console.error(`Error executing DCA transaction:`, error);
    }
  }

  private async loadAutomationRules() {
    const defaultRule: AutomationRule = {
      id: "default-btc-rule",
      userId: "default-user",
      strategyId: "default-strategy",
      signalThreshold: 0.6,
      maxAdjustment: 0.5,
      isActive: true,
      conditions: {
        indicators: ["RSI", "MACD", "Volume"],
        minConfidence: 0.7,
        actions: ["buy", "strong_buy"]
      }
    };

    this.rules.set(defaultRule.id, defaultRule);
    console.log(`Loaded ${this.rules.size} automation rules`);
    // TODO: Persist automation rules to durable storage instead of in-memory defaults.
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

import { MarketOverview } from "@/components/market-overview";
import { PriceChart } from "@/components/price-chart";
import { DCACalculator } from "@/components/dca-calculator";
import { PortfolioAnalytics } from "@/components/portfolio-analytics";
import { StrategyComparison } from "@/components/strategy-comparison";
import { RiskMetrics } from "@/components/risk-metrics";
import { TransactionHistory } from "@/components/transaction-history";
import { SimulationPanel } from "@/components/simulation-panel";
import { MarketSignals } from "@/components/market-signals";
import { AutomatedDCA } from "@/components/automated-dca";
import { PerformanceAnalytics } from "@/components/performance-analytics";
import { AdvancedTools } from "@/components/advanced-tools";
import { MLPredictions } from "@/components/ml-predictions";
import { MLDCAOptimizer } from "@/components/ml-dca-optimizer";
import { TicketingSystem } from "@/components/ticketing-system";
import { TradingBot } from "@/components/trading-bot";
import { AdvancedHedging } from "@/components/advanced-hedging";
import { AlertSystem } from "@/components/alert-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-primary text-2xl">₿</div>
              <h1 className="text-xl font-bold text-foreground">DCAlytics</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors" data-testid="link-dashboard">
                Dashboard
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-simulator">
                Simulator
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-portfolio">
                Portfolio
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-analytics">
                Analytics
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Portfolio Value:</span>
              <span className="mono font-semibold text-accent" data-testid="text-portfolio-value">$47,832.91</span>
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors" data-testid="button-account">
              Account
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Market Overview Section */}
        <MarketOverview />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PriceChart />
          </div>
          <div>
            <DCACalculator />
          </div>
        </div>

        {/* Portfolio Analytics */}
        <PortfolioAnalytics />

        {/* Strategy Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StrategyComparison />
          <RiskMetrics />
        </div>

        {/* Transaction History & Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TransactionHistory />
          </div>
          <div className="lg:col-span-2">
            <SimulationPanel />
          </div>
        </div>

        {/* Market Signals & Automated DCA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketSignals />
          <AutomatedDCA />
        </div>

        {/* Trading Bot Section */}
        <TradingBot />

        {/* Advanced Hedging Section */}
        <AdvancedHedging />

        {/* Alert System Section */}
        <AlertSystem />

        {/* Performance Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SimulationPanel />
            <StrategyComparison />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <MLPredictions />
            <MLDCAOptimizer />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <PerformanceAnalytics />
          </div>

        {/* Advanced Tools */}
        <AdvancedTools />

        {/* Ticketing System Section */}
        <Tabs defaultValue="performance-analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="market-overview">Market</TabsTrigger>
            <TabsTrigger value="ml-optimizer">ML Optimizer</TabsTrigger>
            <TabsTrigger value="trading-bot">Trading Bot</TabsTrigger>
            <TabsTrigger value="hedging">Hedging</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="ticketing">Tickets</TabsTrigger>
          </TabsList>
          <TabsContent value="market-overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PriceChart />
              </div>
              <div>
                <DCACalculator />
              </div>
            </div>
            <PortfolioAnalytics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StrategyComparison />
              <RiskMetrics />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TransactionHistory />
              </div>
              <div className="lg:col-span-2">
                <SimulationPanel />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketSignals />
              <AutomatedDCA />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SimulationPanel />
                <StrategyComparison />
              </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <MLPredictions />
                <MLDCAOptimizer />
              </div>
            <div className="grid grid-cols-1 gap-6">
                <PerformanceAnalytics />
            </div>
            <AdvancedTools />
          </TabsContent>
          <TabsContent value="ml-optimizer">
            <MLDCAOptimizer />
          </TabsContent>

          <TabsContent value="trading-bot">
            <TradingBot />
          </TabsContent>

          <TabsContent value="hedging">
            <AdvancedHedging />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertSystem />
          </TabsContent>

          <TabsContent value="ticketing">
            <TicketingSystem />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="border-t border-border pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <div className="mb-4 md:mb-0">
              <span>© 2024 DCAlytics. Professional cryptocurrency investment platform.</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-primary transition-colors" data-testid="link-terms">Terms</a>
              <a href="#" className="hover:text-primary transition-colors" data-testid="link-privacy">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors" data-testid="link-support">Support</a>
              <div className="flex items-center space-x-2">
                <span className="text-accent">🛡️</span>
                <span className="text-xs">Bank-grade security</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
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
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50" role="banner">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-primary text-2xl" aria-hidden="true">₿</div>
              <h1 className="text-xl font-bold text-foreground">DCAlytics</h1>
            </div>
            <nav className="hidden md:flex space-x-6" role="navigation" aria-label="Main navigation">
              <a 
                href="#" 
                className="text-foreground hover:text-primary transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm" 
                data-testid="link-dashboard"
                aria-current="page"
              >
                Dashboard
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm" 
                data-testid="link-simulator"
              >
                Simulator
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm" 
                data-testid="link-portfolio"
              >
                Portfolio
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm" 
                data-testid="link-analytics"
              >
                Analytics
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Portfolio Value:</span>
              <span 
                className="mono font-semibold text-accent" 
                data-testid="text-portfolio-value"
                aria-label="Portfolio value: $47,832.91"
              >
                $47,832.91
              </span>
            </div>
            <ThemeToggle />
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
              data-testid="button-account"
              aria-label="Open account menu"
            >
              Account
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-6 space-y-6" role="main">
        {/* Market Overview Section */}
        <section aria-labelledby="market-overview-heading">
          <h2 id="market-overview-heading" className="sr-only">Market Overview</h2>
          <MarketOverview />
        </section>

        {/* Main Dashboard Grid */}
        <section aria-labelledby="main-dashboard-heading">
          <h2 id="main-dashboard-heading" className="sr-only">Main Dashboard</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PriceChart />
            </div>
            <div>
              <DCACalculator />
            </div>
          </div>
        </section>

        {/* Portfolio Analytics */}
        <section aria-labelledby="portfolio-analytics-heading">
          <h2 id="portfolio-analytics-heading" className="sr-only">Portfolio Analytics</h2>
          <PortfolioAnalytics />
        </section>

        {/* Strategy Performance Section */}
        <section aria-labelledby="strategy-performance-heading">
          <h2 id="strategy-performance-heading" className="sr-only">Strategy Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StrategyComparison />
            <RiskMetrics />
          </div>
        </section>

        {/* Transaction History & Simulator */}
        <section aria-labelledby="transactions-simulation-heading">
          <h2 id="transactions-simulation-heading" className="sr-only">Transactions and Simulation</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TransactionHistory />
            </div>
            <div className="lg:col-span-2">
              <SimulationPanel />
            </div>
          </div>
        </section>

        {/* Market Signals & Automated DCA */}
        <section aria-labelledby="market-automation-heading">
          <h2 id="market-automation-heading" className="sr-only">Market Signals and Automation</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketSignals />
            <AutomatedDCA />
          </div>
        </section>

        {/* Advanced Analytics Section */}
        <section aria-labelledby="advanced-analytics-heading">
          <h2 id="advanced-analytics-heading" className="sr-only">Advanced Analytics</h2>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4" role="tablist">
              <TabsTrigger 
                value="overview" 
                className="touch-target"
                role="tab"
                aria-controls="overview-panel"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="ml-optimizer" 
                className="touch-target"
                role="tab"
                aria-controls="ml-optimizer-panel"
              >
                ML Optimizer
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="touch-target"
                role="tab"
                aria-controls="analytics-panel"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="ticketing" 
                className="touch-target hidden lg:flex"
                role="tab"
                aria-controls="ticketing-panel"
              >
                Support
              </TabsTrigger>
            </TabsList>
            
            <TabsContent 
              value="overview" 
              className="mt-6 space-y-6"
              role="tabpanel"
              id="overview-panel"
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <MLPredictions />
                <MLDCAOptimizer />
              </div>
              <PerformanceAnalytics />
              <AdvancedTools />
            </TabsContent>
            
            <TabsContent 
              value="ml-optimizer" 
              className="mt-6"
              role="tabpanel"
              id="ml-optimizer-panel"
            >
              <MLDCAOptimizer />
            </TabsContent>
            
            <TabsContent 
              value="analytics" 
              className="mt-6"
              role="tabpanel"
              id="analytics-panel"
            >
              <PerformanceAnalytics />
            </TabsContent>

            <TabsContent 
              value="ticketing" 
              className="mt-6"
              role="tabpanel"
              id="ticketing-panel"
            >
              <TicketingSystem />
            </TabsContent>
          </Tabs>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 mt-8" role="contentinfo">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p>© 2024 DCAlytics. Professional cryptocurrency investment platform.</p>
            </div>
            <div className="flex items-center space-x-6">
              <nav aria-label="Footer navigation" className="flex space-x-6">
                <a 
                  href="#" 
                  className="hover:text-primary transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm" 
                  data-testid="link-terms"
                >
                  Terms
                </a>
                <a 
                  href="#" 
                  className="hover:text-primary transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm" 
                  data-testid="link-privacy"
                >
                  Privacy
                </a>
                <a 
                  href="#" 
                  className="hover:text-primary transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm" 
                  data-testid="link-support"
                >
                  Support
                </a>
              </nav>
              <div className="flex items-center space-x-2">
                <span className="text-accent" aria-hidden="true">🛡️</span>
                <span className="text-xs">Bank-grade security</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
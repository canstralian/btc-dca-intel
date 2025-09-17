import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bitcoin, TrendingUp, Shield, Target } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white dark:from-background dark:to-card">
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      
      {/* Header with theme toggle */}
      <header className="container-responsive py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bitcoin size={32} className="text-orange-500" aria-hidden="true" />
          <span className="text-xl font-bold">DCAlytics</span>
        </div>
        <ThemeToggle />
      </header>

      <main id="main-content" className="container-responsive py-8 lg:py-16">
        {/* Hero Section */}
        <section className="text-center mb-16 lg:mb-24" role="banner">
          <div className="flex justify-center mb-6">
            <Bitcoin 
              size={64} 
              className="text-orange-500 glow-primary" 
              aria-hidden="true"
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            DCAlytics
          </h1>
          <p className="text-lg md:text-xl text-gray-300 dark:text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
            Master your Bitcoin investment strategy with advanced DCA analytics, 
            risk-managed trading tools, and real-time market insights.
          </p>
          <Button 
            size="lg" 
            className="bg-orange-600 hover:bg-orange-700 dark:bg-primary dark:hover:bg-primary/90 text-white px-8 py-4 text-lg touch-target transition-all duration-200 transform hover:scale-105 focus:scale-105"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
            aria-describedby="hero-description"
          >
            Get Started
          </Button>
          <p id="hero-description" className="sr-only">
            Sign up to start using DCAlytics for Bitcoin investment analysis
          </p>
        </section>

        {/* Features Grid */}
        <section className="mb-16 lg:mb-24" aria-labelledby="features-heading">
          <h2 id="features-heading" className="sr-only">Key Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <article className="bg-gray-800 dark:bg-card p-6 lg:p-8 rounded-lg text-center card-elevated group">
              <div className="mb-4 flex justify-center">
                <TrendingUp 
                  size={48} 
                  className="text-green-500 dark:text-accent transition-transform duration-200 group-hover:scale-110" 
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-balance">Smart DCA Strategies</h3>
              <p className="text-gray-300 dark:text-muted-foreground text-pretty leading-relaxed">
                Automate your Bitcoin investments with intelligent dollar-cost averaging 
                strategies backed by market analysis.
              </p>
            </article>

            <article className="bg-gray-800 dark:bg-card p-6 lg:p-8 rounded-lg text-center card-elevated group">
              <div className="mb-4 flex justify-center">
                <Shield 
                  size={48} 
                  className="text-blue-500 dark:text-chart-4 transition-transform duration-200 group-hover:scale-110" 
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-balance">Risk Management</h3>
              <p className="text-gray-300 dark:text-muted-foreground text-pretty leading-relaxed">
                Protect your investments with advanced risk metrics, portfolio 
                analytics, and market sentiment indicators.
              </p>
            </article>

            <article className="bg-gray-800 dark:bg-card p-6 lg:p-8 rounded-lg text-center card-elevated group sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex justify-center">
                <Target 
                  size={48} 
                  className="text-purple-500 dark:text-chart-5 transition-transform duration-200 group-hover:scale-110" 
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-balance">Performance Tracking</h3>
              <p className="text-gray-300 dark:text-muted-foreground text-pretty leading-relaxed">
                Monitor your investment performance with detailed analytics, 
                backtesting, and scenario modeling.
              </p>
            </article>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gray-800 dark:bg-card p-6 lg:p-8 rounded-lg card-elevated" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="text-2xl lg:text-3xl font-bold mb-4 text-balance">
            Ready to optimize your Bitcoin investments?
          </h2>
          <p className="text-gray-300 dark:text-muted-foreground mb-6 text-pretty leading-relaxed max-w-2xl mx-auto">
            Join thousands of investors using disciplined DCA strategies to build wealth.
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-primary-foreground touch-target transition-all duration-200"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login-cta"
            aria-describedby="cta-description"
          >
            Start Your Journey
          </Button>
          <p id="cta-description" className="sr-only">
            Begin your Bitcoin DCA investment journey with DCAlytics
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="container-responsive py-8 border-t border-gray-800 dark:border-border mt-16">
        <div className="text-center text-sm text-gray-400 dark:text-muted-foreground">
          <p>© 2024 DCAlytics. Professional cryptocurrency investment platform.</p>
          <p className="mt-2 flex items-center justify-center space-x-2">
            <span className="text-accent">🛡️</span>
            <span>Bank-grade security</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
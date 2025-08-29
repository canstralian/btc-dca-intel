import { Button } from "@/components/ui/button";
import { Bitcoin, TrendingUp, Shield, Target } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Bitcoin size={64} className="text-orange-500" />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            DCAlytics
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Master your Bitcoin investment strategy with advanced DCA analytics, 
            risk-managed trading tools, and real-time market insights.
          </p>
          <Button 
            size="lg" 
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <TrendingUp size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">Smart DCA Strategies</h3>
            <p className="text-gray-300">
              Automate your Bitcoin investments with intelligent dollar-cost averaging 
              strategies backed by market analysis.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <Shield size={48} className="text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">Risk Management</h3>
            <p className="text-gray-300">
              Protect your investments with advanced risk metrics, portfolio 
              analytics, and market sentiment indicators.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <Target size={48} className="text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">Performance Tracking</h3>
            <p className="text-gray-300">
              Monitor your investment performance with detailed analytics, 
              backtesting, and scenario modeling.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-800 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to optimize your Bitcoin investments?</h2>
          <p className="text-gray-300 mb-6">
            Join thousands of investors using disciplined DCA strategies to build wealth.
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login-cta"
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
}
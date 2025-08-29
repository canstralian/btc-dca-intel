import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function RiskMetrics() {
  return (
    <Card data-testid="card-risk-metrics">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Risk Analysis</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Maximum Drawdown</span>
            <span className="mono font-semibold text-destructive" data-testid="text-max-drawdown">-18.7%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Volatility (30d)</span>
            <span className="mono font-semibold text-secondary" data-testid="text-volatility">24.3%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
            <span className="mono font-semibold text-accent" data-testid="text-sharpe-ratio">1.47</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Value at Risk (95%)</span>
            <span className="mono font-semibold text-destructive" data-testid="text-var">-$8,247</span>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Risk Assessment</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your DCA strategy shows moderate risk with good diversification over time. 
              Consider hedging during high volatility periods.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

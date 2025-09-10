
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Zap, Target, Shield, TrendingUp, AlertTriangle } from "lucide-react";

interface OptimizationResult {
  optimal_frequency: string;
  recommended_amount_per_purchase: number;
  expected_return: number;
  risk_score: number;
  strategy_explanation: string;
}

export function MLDCAOptimizer() {
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [durationMonths, setDurationMonths] = useState(12);
  const [riskTolerance, setRiskTolerance] = useState("medium");

  const optimization = useMutation({
    mutationFn: async (params: { investment_amount: number; duration_months: number; risk_tolerance: string }) => {
      const response = await fetch("/api/ml/optimize-dca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error("Failed to optimize DCA strategy");
      }
      
      return response.json() as Promise<OptimizationResult>;
    },
  });

  const runOptimization = () => {
    // Client-side validation
    if (investmentAmount < 100) {
      return; // Could show a toast notification here
    }
    
    if (durationMonths < 1 || durationMonths > 120) {
      return; // Could show a toast notification here
    }
    
    const minPurchaseAmount = investmentAmount / (durationMonths * 4);
    if (minPurchaseAmount < 1) {
      return; // Investment too small for duration
    }
    
    optimization.mutate({
      investment_amount: investmentAmount,
      duration_months: durationMonths,
      risk_tolerance: riskTolerance
    });
  };

  const formatCurrency = (value: number) => 
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const getRiskColor = (score: number) => {
    if (score < 0.3) return "text-green-500";
    if (score < 0.7) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskLabel = (score: number) => {
    if (score < 0.3) return "Low Risk";
    if (score < 0.7) return "Medium Risk";
    return "High Risk";
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case "weekly": return "📅";
      case "biweekly": return "🗓️";
      case "monthly": return "📆";
      default: return "⏰";
    }
  };

  return (
    <Card data-testid="card-ml-dca-optimizer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            AI-Powered DCA Optimization
          </h2>
          <Badge variant="outline" className="text-xs">
            Machine Learning
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Strategy Parameters</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="investment-amount" className="block text-xs font-medium text-muted-foreground mb-1">
                  Total Investment Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">$</span>
                  <Input
                    id="investment-amount"
                    type="number"
                    min="100"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    className="pl-6 text-sm"
                    data-testid="input-investment-amount"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration" className="block text-xs font-medium text-muted-foreground mb-1">
                  Investment Duration (Months)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="120"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="text-sm"
                  data-testid="input-duration-months"
                />
              </div>

              <div>
                <Label htmlFor="risk-tolerance" className="block text-xs font-medium text-muted-foreground mb-1">
                  Risk Tolerance
                </Label>
                <Select value={riskTolerance} onValueChange={setRiskTolerance} data-testid="select-risk-tolerance">
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🛡️ Conservative (Low Risk)</SelectItem>
                    <SelectItem value="medium">⚖️ Balanced (Medium Risk)</SelectItem>
                    <SelectItem value="high">🚀 Aggressive (High Risk)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={runOptimization}
                disabled={optimization.isPending}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-optimize-strategy"
              >
                <Target className="h-3 w-3 mr-2" />
                {optimization.isPending ? "Optimizing..." : "Optimize Strategy"}
              </Button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Optimized Strategy</h3>
            
            {optimization.data && optimization.data.recommended_amount_per_purchase > 0 && (
              <div className="space-y-3">
                {/* Key Metrics */}
                <div className="bg-muted rounded-md p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Optimal Frequency</div>
                      <div className="font-semibold text-sm flex items-center gap-1" data-testid="text-optimal-frequency">
                        {getFrequencyIcon(optimization.data.optimal_frequency)}
                        {optimization.data.optimal_frequency}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Per Purchase</div>
                      <div className="font-semibold text-sm text-accent" data-testid="text-amount-per-purchase">
                        {formatCurrency(optimization.data.recommended_amount_per_purchase)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-muted rounded-md p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Expected Return
                      </div>
                      <div className="font-semibold text-sm text-green-500" data-testid="text-expected-return">
                        +{optimization.data.expected_return.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Risk Score
                      </div>
                      <div className={`font-semibold text-sm ${getRiskColor(optimization.data.risk_score)}`} data-testid="text-risk-score">
                        {getRiskLabel(optimization.data.risk_score)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strategy Explanation */}
                <div className="bg-muted rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    AI Recommendation
                  </div>
                  <p className="text-sm text-foreground leading-relaxed" data-testid="text-strategy-explanation">
                    {optimization.data.strategy_explanation}
                  </p>
                </div>

                {/* Investment Breakdown */}
                <div className="bg-muted rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-2">Investment Breakdown</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Total Investment:</span>
                      <span className="font-medium">{formatCurrency(investmentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of Purchases:</span>
                      <span className="font-medium">
                        {Math.round(investmentAmount / optimization.data.recommended_amount_per_purchase)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{durationMonths} months</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {optimization.isPending && (
              <div className="space-y-3">
                <div className="bg-muted rounded-md p-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="bg-muted rounded-md p-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            )}

            {optimization.isError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-center">
                <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">
                  Failed to optimize strategy. Please check your inputs and try again.
                </p>
              </div>
            )}

            {!optimization.data && !optimization.isPending && !optimization.isError && (
              <div className="bg-muted/50 rounded-md p-8 text-center">
                <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Configure your parameters and click "Optimize Strategy" to get AI-powered DCA recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

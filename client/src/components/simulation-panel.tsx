import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSimulation } from "@/hooks/use-dca-calculator";
import { Skeleton } from "@/components/ui/skeleton";
import { Play } from "lucide-react";

export function SimulationPanel() {
  const { startDate, setStartDate, endDate, setEndDate, amount, setAmount, simulation, runSimulation } = useSimulation();

  const formatCurrency = (value: number) => 
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const formatPercentage = (value: number) => 
    `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <Card data-testid="card-simulation-panel">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Strategy Simulation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Backtest Parameters</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="start-date" className="block text-xs font-medium text-muted-foreground mb-1">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm"
                  data-testid="input-simulation-start-date"
                />
              </div>

              <div>
                <Label htmlFor="end-date" className="block text-xs font-medium text-muted-foreground mb-1">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm"
                  data-testid="input-simulation-end-date"
                />
              </div>

              <div>
                <Label htmlFor="sim-amount" className="block text-xs font-medium text-muted-foreground mb-1">
                  Investment Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">$</span>
                  <Input
                    id="sim-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="pl-6 text-sm"
                    data-testid="input-simulation-amount"
                  />
                </div>
              </div>

              <Button 
                onClick={runSimulation}
                disabled={simulation.isPending}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-run-simulation"
              >
                <Play className="h-3 w-3 mr-2" />
                {simulation.isPending ? "Running..." : "Run Simulation"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Simulation Results</h3>
            
            <div className="space-y-3">
              <div className="bg-muted rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Total Return</span>
                  {simulation.isPending ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    <span className="mono text-sm font-semibold text-accent" data-testid="text-simulation-total-return">
                      {simulation.data ? formatPercentage(simulation.data.totalReturn) : '+34.7%'}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Final Value</span>
                  {simulation.isPending ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    <span className="mono text-sm font-semibold text-foreground" data-testid="text-simulation-final-value">
                      {simulation.data ? formatCurrency(simulation.data.finalValue) : '$13,470'}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Best Entry</span>
                  {simulation.isPending ? (
                    <Skeleton className="h-3 w-16" />
                  ) : (
                    <span className="mono text-xs text-accent" data-testid="text-simulation-best-entry">
                      ${simulation.data?.bestEntry.toLocaleString() || '15,487'}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-muted rounded-md p-3">
                <div className="text-xs text-muted-foreground mb-2">Performance vs Strategies</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">vs Lump Sum:</span>
                    {simulation.isPending ? (
                      <Skeleton className="h-3 w-12" />
                    ) : (
                      <span className="mono text-xs text-accent" data-testid="text-vs-lump-sum">
                        +{simulation.data?.vs_lump_sum || 12.3}%
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">vs Buy & Hold:</span>
                    {simulation.isPending ? (
                      <Skeleton className="h-3 w-12" />
                    ) : (
                      <span className="mono text-xs text-accent" data-testid="text-vs-buy-hold">
                        +{simulation.data?.vs_buy_hold || 8.7}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

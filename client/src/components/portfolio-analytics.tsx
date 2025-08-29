import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, PiggyBank, TrendingUp, Calculator } from "lucide-react";
import { type Portfolio } from "@shared/schema";

export function PortfolioAnalytics() {
  const { data: portfolio, isLoading } = useQuery<Portfolio>({
    queryKey: ["/api/portfolio"],
    refetchInterval: 60000, // Refetch every minute
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatBTC = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(4)} BTC`;
  };

  const formatPercentage = (value: number) => 
    `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

  // Mock calculations for demo
  const totalBTC = parseFloat(portfolio?.totalBTC || '1.2847');
  const totalInvested = parseFloat(portfolio?.totalInvested || '42500');
  const currentBTCPrice = 43287; // This would come from market data
  const totalValue = totalBTC * currentBTCPrice;
  const unrealizedPL = totalValue - totalInvested;
  const unrealizedPLPercent = (unrealizedPL / totalInvested) * 100;
  const avgCost = totalInvested / totalBTC;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card data-testid="card-total-holdings">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Total Holdings</h3>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="mono text-xl font-bold text-foreground" data-testid="text-total-btc">
                {formatBTC(totalBTC)}
              </div>
            )}
            {isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <div className="mono text-sm text-muted-foreground" data-testid="text-total-usd">
                ≈ {formatCurrency(totalValue)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-total-invested">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Total Invested</h3>
            <PiggyBank className="h-4 w-4 text-secondary" />
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="mono text-xl font-bold text-foreground" data-testid="text-total-invested">
                {formatCurrency(totalInvested)}
              </div>
            )}
            <div className="text-sm text-muted-foreground">Since Jan 2023</div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-unrealized-pl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Unrealized P&L</h3>
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="mono text-xl font-bold text-accent" data-testid="text-unrealized-pl">
                {formatCurrency(unrealizedPL)}
              </div>
            )}
            {isLoading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <div className="mono text-sm text-accent" data-testid="text-unrealized-pl-percent">
                {formatPercentage(unrealizedPLPercent)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-average-cost">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Average Cost</h3>
            <Calculator className="h-4 w-4 text-secondary" />
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="mono text-xl font-bold text-foreground" data-testid="text-average-cost">
                {formatCurrency(avgCost)}
              </div>
            )}
            <div className={`text-sm ${avgCost < currentBTCPrice ? 'text-accent' : 'text-destructive'}`} data-testid="text-avg-cost-status">
              {avgCost < currentBTCPrice ? 'Below market' : 'Above market'}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

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
    if (isNaN(num) || num == null) return '$0.00';
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatBTC = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num == null) return '0.0000 BTC';
    return `${num.toFixed(4)} BTC`;
  };

  const formatPercentage = (value?: number | null) => {
    if (typeof value !== 'number' || isNaN(value) || value == null) return '0.00%';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Safe calculations with proper null checks
  const totalBTC = (() => {
    try {
      const value = parseFloat(portfolio?.totalBTC || '1.2847');
      return isNaN(value) ? 0 : value;
    } catch {
      return 0;
    }
  })();
  
  const totalInvested = (() => {
    try {
      const value = parseFloat(portfolio?.totalInvested || '42500');
      return isNaN(value) ? 0 : value;
    } catch {
      return 0;
    }
  })();
  
  const currentBTCPrice = 43287; // This would come from market data
  const totalValue = totalBTC * currentBTCPrice;
  const unrealizedPL = totalValue - totalInvested;
  const unrealizedPLPercent = totalInvested > 0 ? (unrealizedPL / totalInvested) * 100 : 0;
  const avgCost = totalBTC > 0 ? totalInvested / totalBTC : 0;

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

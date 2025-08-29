import { Card, CardContent } from "@/components/ui/card";
import { useBitcoinPrice, useFearGreedIndex } from "@/hooks/use-bitcoin-price";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BarChart3, Globe, Thermometer } from "lucide-react";

export function MarketOverview() {
  const { data: btcPrice, isLoading: isPriceLoading } = useBitcoinPrice();
  const { data: fearGreed, isLoading: isFearGreedLoading } = useFearGreedIndex();

  const formatNumber = (num: string | number, decimals = 2) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatLargeNumber = (num: string | number) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${formatNumber(value)}`;
  };

  const isPositiveChange = btcPrice && parseFloat(btcPrice.changePercent24h) > 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="glow-primary" data-testid="card-bitcoin-price">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Bitcoin Price</h3>
            <div className="text-primary text-lg">₿</div>
          </div>
          <div className="space-y-1">
            {isPriceLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="mono text-2xl font-bold text-foreground" data-testid="text-btc-price">
                ${formatNumber(btcPrice?.price || '0')}
              </div>
            )}
            {isPriceLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <div className="flex items-center space-x-2">
                <span className={`mono text-sm ${isPositiveChange ? 'price-up' : 'price-down'}`} data-testid="text-btc-change">
                  {isPositiveChange ? '+' : ''}${formatNumber(btcPrice?.change24h || '0')}
                </span>
                <span className={`mono text-sm ${isPositiveChange ? 'price-up' : 'price-down'}`} data-testid="text-btc-change-percent">
                  {isPositiveChange ? '+' : ''}{formatNumber(btcPrice?.changePercent24h || '0')}%
                </span>
                <TrendingUp className={`h-3 w-3 ${isPositiveChange ? 'price-up' : 'price-down'}`} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-volume">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
            <BarChart3 className="h-4 w-4 text-secondary" />
          </div>
          <div className="space-y-1">
            {isPriceLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="mono text-xl font-semibold text-foreground" data-testid="text-btc-volume">
                {formatLargeNumber(btcPrice?.volume24h || '0')}
              </div>
            )}
            <span className="text-xs text-muted-foreground">High liquidity</span>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-market-cap">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
            <Globe className="h-4 w-4 text-secondary" />
          </div>
          <div className="space-y-1">
            {isPriceLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="mono text-xl font-semibold text-foreground" data-testid="text-btc-market-cap">
                {formatLargeNumber(btcPrice?.marketCap || '0')}
              </div>
            )}
            <span className="text-xs text-muted-foreground">Rank #1</span>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-fear-greed">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Fear & Greed</h3>
            <Thermometer className="h-4 w-4 text-secondary" />
          </div>
          <div className="space-y-1">
            {isFearGreedLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="mono text-xl font-semibold text-accent" data-testid="text-fear-greed-value">
                {fearGreed?.value || 50}
              </div>
            )}
            <span className="text-xs text-accent" data-testid="text-fear-greed-classification">
              {fearGreed?.classification || 'Neutral'}
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { usePriceHistory } from "@/hooks/use-bitcoin-price";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useState } from "react";

export function PriceChart() {
  const [timeframe, setTimeframe] = useState("1");
  const { data: priceHistory, isLoading } = usePriceHistory(timeframe);

  const formatPrice = (value: number) => `$${value.toLocaleString()}`;

  const chartData = priceHistory?.map(point => ({
    time: new Date(point.timestamp).toLocaleDateString(),
    price: point.price,
  })) || [];

  return (
    <Card data-testid="card-price-chart">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Bitcoin Price Chart</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setTimeframe("1")}
              className={`px-3 py-1 text-xs rounded ${timeframe === "1" ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="button-timeframe-1d"
            >
              1D
            </button>
            <button 
              onClick={() => setTimeframe("7")}
              className={`px-3 py-1 text-xs rounded ${timeframe === "7" ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="button-timeframe-7d"
            >
              7D
            </button>
            <button 
              onClick={() => setTimeframe("30")}
              className={`px-3 py-1 text-xs rounded ${timeframe === "30" ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="button-timeframe-1m"
            >
              1M
            </button>
            <button 
              onClick={() => setTimeframe("365")}
              className={`px-3 py-1 text-xs rounded ${timeframe === "365" ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="button-timeframe-1y"
            >
              1Y
            </button>
          </div>
        </div>
        
        <div className="h-[300px]">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 20%)" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12, fill: 'hsl(210 40% 65%)' }}
                  stroke="hsl(210 40% 20%)"
                />
                <YAxis 
                  tickFormatter={formatPrice}
                  tick={{ fontSize: 12, fill: 'hsl(210 40% 65%)' }}
                  stroke="hsl(210 40% 20%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(30 95% 55%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

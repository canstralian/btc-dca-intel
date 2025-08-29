import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export function StrategyComparison() {
  // Mock data for strategy comparison
  const comparisonData = [
    { month: 'Jan', dca: 42500, lumpSum: 42500 },
    { month: 'Mar', dca: 45200, lumpSum: 44100 },
    { month: 'May', dca: 41800, lumpSum: 40200 },
    { month: 'Jul', dca: 48300, lumpSum: 46800 },
    { month: 'Sep', dca: 52100, lumpSum: 50300 },
    { month: 'Nov', dca: 49800, lumpSum: 47900 },
    { month: 'Jan 2024', dca: 55594, lumpSum: 50358 },
  ];

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <Card data-testid="card-strategy-comparison">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Strategy Performance Comparison</h2>
        
        <div className="h-[300px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 20%)" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: 'hsl(210 40% 65%)' }}
                stroke="hsl(210 40% 20%)"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12, fill: 'hsl(210 40% 65%)' }}
                stroke="hsl(210 40% 20%)"
              />
              <Legend 
                wrapperStyle={{ color: 'hsl(210 40% 98%)', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="dca" 
                stroke="hsl(155 69% 37%)"
                strokeWidth={2}
                name="DCA Strategy"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="lumpSum" 
                stroke="hsl(0 84% 60%)"
                strokeWidth={2}
                name="Lump Sum"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground mb-1">DCA Strategy</div>
            <div className="mono font-semibold text-accent" data-testid="text-dca-return">+30.81%</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground mb-1">Lump Sum</div>
            <div className="mono font-semibold text-destructive" data-testid="text-lump-sum-return">+18.42%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

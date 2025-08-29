import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";

export function PerformanceAnalytics() {
  const performanceData = [
    { period: 'Q1 2023', return: 8.5, value: 2847 },
    { period: 'Q2 2023', return: -3.2, value: -1384 },
    { period: 'Q3 2023', return: 15.7, value: 6673 },
    { period: 'Q4 2023', return: 12.4, value: 5268 },
    { period: 'Q1 2024', return: 5.2, value: 2847 },
  ];

  const formatCurrency = (value: number) => 
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const formatPercentage = (value: number) => 
    `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <Card data-testid="card-performance-analytics">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Performance Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground mb-1">7-Day Performance</div>
            <div className="mono text-lg font-bold text-accent" data-testid="text-performance-week">+5.2%</div>
            <div className="mono text-xs text-muted-foreground" data-testid="text-performance-week-value">+$2,847</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground mb-1">30-Day Performance</div>
            <div className="mono text-lg font-bold text-accent" data-testid="text-performance-month">+12.8%</div>
            <div className="mono text-xs text-muted-foreground" data-testid="text-performance-month-value">+$7,034</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground mb-1">All-Time Performance</div>
            <div className="mono text-lg font-bold text-accent" data-testid="text-performance-all-time">+30.81%</div>
            <div className="mono text-xs text-muted-foreground" data-testid="text-performance-all-time-value">+$13,094</div>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 20%)" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12, fill: 'hsl(210 40% 65%)' }}
                stroke="hsl(210 40% 20%)"
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12, fill: 'hsl(210 40% 65%)' }}
                stroke="hsl(210 40% 20%)"
              />
              <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.return > 0 ? 'hsl(155 69% 37%)' : 'hsl(0 84% 60%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

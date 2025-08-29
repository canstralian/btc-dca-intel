import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Minus, AlertTriangle } from "lucide-react";

export function MarketSignals() {
  const signals = [
    {
      id: '1',
      type: 'bullish',
      title: 'Bullish Signal',
      description: 'RSI oversold + volume spike',
      time: '2 min ago',
      strength: 'Strong',
      icon: TrendingUp,
      color: 'accent'
    },
    {
      id: '2',
      type: 'neutral',
      title: 'Neutral Signal',
      description: 'Moving averages converging',
      time: '15 min ago',
      strength: 'Moderate',
      icon: Minus,
      color: 'secondary'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Volatility Alert',
      description: 'High volatility detected',
      time: '1 hour ago',
      strength: 'High',
      icon: AlertTriangle,
      color: 'destructive'
    }
  ];

  return (
    <Card data-testid="card-market-signals">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Market Signals</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <span className="text-xs text-accent">Live</span>
          </div>
        </div>

        <div className="space-y-3">
          {signals.map((signal) => {
            const IconComponent = signal.icon;
            const colorClass = `text-${signal.color}`;
            const bgColorClass = `bg-${signal.color}`;
            
            return (
              <div key={signal.id} className="flex items-center justify-between p-3 bg-muted rounded-md" data-testid={`signal-${signal.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${signal.color === 'accent' ? 'bg-accent' : signal.color === 'secondary' ? 'bg-secondary' : 'bg-destructive'} rounded-full flex items-center justify-center`}>
                    <IconComponent className="h-3 w-3 text-background" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{signal.title}</div>
                    <div className="text-xs text-muted-foreground">{signal.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{signal.time}</div>
                  <div className={`text-xs ${signal.color === 'accent' ? 'text-accent' : signal.color === 'secondary' ? 'text-secondary' : 'text-destructive'}`}>
                    {signal.strength}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

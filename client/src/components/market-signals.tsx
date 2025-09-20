import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Minus, AlertTriangle, RefreshCw, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface TradingSignal {
  id: string;
  type: string;
  indicator: string;
  action: string;
  strength: number;
  value: number;
  symbol: string;
  timeframe: string;
  timestamp: string;
  confidence: number;
  description: string;
}

interface SignalsResponse {
  signals: TradingSignal[];
  timeframe: string;
  timestamp: string;
  market_status: string;
}

export function MarketSignals() {
  const [timeframe, setTimeframe] = useState<string>("1h");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const { data: signalsData, isLoading, error, refetch } = useQuery<SignalsResponse>({
    queryKey: ['market-signals', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/signals?timeframe=${timeframe}&limit=5`);
      if (!response.ok) {
        throw new Error('Failed to fetch signals');
      }
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if auto-refresh is on
  });

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return TrendingUp;
      case 'bearish':
        return AlertTriangle;
      default:
        return Minus;
    }
  };

  const getSignalColor = (type: string, strength: number) => {
    if (type === 'bullish') {
      return strength > 0.7 ? 'bg-green-600' : 'bg-green-500';
    } else if (type === 'bearish') {
      return strength > 0.7 ? 'bg-red-600' : 'bg-red-500';
    }
    return 'bg-gray-500';
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy':
      case 'strong_buy':
        return 'text-green-400';
      case 'sell':
      case 'strong_sell':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Card data-testid="card-market-signals">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Market Signals</h2>
          <div className="flex items-center space-x-3">
            {/* Timeframe selector */}
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-xs bg-muted border border-border rounded px-2 py-1"
              data-testid="timeframe-selector"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>
            
            {/* Auto-refresh toggle */}
            <Button
              size="sm"
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-xs px-2 py-1"
              data-testid="auto-refresh-toggle"
            >
              <Activity className="h-3 w-3 mr-1" />
              Auto
            </Button>
            
            {/* Manual refresh button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-xs px-2 py-1"
              data-testid="manual-refresh"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* Live indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className={`text-xs ${autoRefresh ? 'text-green-400' : 'text-gray-400'}`}>
                {autoRefresh ? 'Live' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Market status */}
        {signalsData && (
          <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Market Status: {signalsData.market_status}</span>
            <span>Last Updated: {formatTimestamp(signalsData.timestamp)}</span>
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-md animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="w-24 h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="w-32 h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-12 h-3 bg-gray-300 rounded mb-1"></div>
                  <div className="w-8 h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="text-center p-4 text-destructive">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">Failed to load signals</p>
              <Button size="sm" onClick={() => refetch()} className="mt-2">
                Retry
              </Button>
            </div>
          ) : signalsData?.signals?.map((signal) => {
            const IconComponent = getSignalIcon(signal.type);
            const signalColor = getSignalColor(signal.type, signal.strength);
            const actionColor = getActionColor(signal.action);
            
            return (
              <div key={signal.id} className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors" data-testid={`signal-${signal.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${signalColor} rounded-full flex items-center justify-center`}>
                    <IconComponent className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{signal.indicator}</span>
                      <Badge variant={signal.type === 'bullish' ? 'default' : signal.type === 'bearish' ? 'destructive' : 'secondary'} className="text-xs px-1 py-0">
                        {signal.type}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate" title={signal.description}>
                      {signal.description}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    {formatTimestamp(signal.timestamp)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${actionColor}`}>
                      {signal.action.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(signal.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional signal analysis link */}
        <div className="mt-4 pt-3 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => window.open('/api/signals/analysis', '_blank')}
            data-testid="view-analysis"
          >
            View Detailed Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

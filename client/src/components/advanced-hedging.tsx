import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, TrendingDown, AlertTriangle, Settings, Activity, BarChart } from "lucide-react";

interface HedgingStrategy {
  id: string;
  name: string;
  type: 'volatility' | 'downside' | 'correlation';
  isActive: boolean;
  parameters: {
    triggerThreshold: number;
    hedgeRatio: number;
    maxPositionSize: number;
    rebalanceFrequency: string;
  };
  performance: {
    currentHedgeRatio: number;
    effectiveProtection: number;
    lastRebalance: string;
  };
}

export function AdvancedHedging() {
  const [selectedStrategy, setSelectedStrategy] = useState<string>("volatility");
  const [newStrategy, setNewStrategy] = useState({
    name: "",
    type: "volatility" as const,
    triggerThreshold: 0.15, // 15% volatility threshold
    hedgeRatio: 0.20, // 20% hedge ratio
    maxPositionSize: 0.30, // 30% max position
    rebalanceFrequency: "daily"
  });

  const queryClient = useQueryClient();

  // Mock data for hedging strategies
  const hedgingStrategies: HedgingStrategy[] = [
    {
      id: "vol-hedge-1",
      name: "Volatility Protection",
      type: "volatility",
      isActive: true,
      parameters: {
        triggerThreshold: 0.15,
        hedgeRatio: 0.25,
        maxPositionSize: 0.30,
        rebalanceFrequency: "daily"
      },
      performance: {
        currentHedgeRatio: 0.22,
        effectiveProtection: 0.67,
        lastRebalance: "2024-01-15T10:30:00Z"
      }
    },
    {
      id: "downside-hedge-1",
      name: "Downside Protection",
      type: "downside",
      isActive: true,
      parameters: {
        triggerThreshold: 0.10,
        hedgeRatio: 0.15,
        maxPositionSize: 0.25,
        rebalanceFrequency: "weekly"
      },
      performance: {
        currentHedgeRatio: 0.18,
        effectiveProtection: 0.45,
        lastRebalance: "2024-01-14T09:00:00Z"
      }
    }
  ];

  const getStrategyIcon = (type: string) => {
    switch (type) {
      case 'volatility':
        return Activity;
      case 'downside':
        return TrendingDown;
      case 'correlation':
        return BarChart;
      default:
        return Shield;
    }
  };

  const getStrategyColor = (type: string) => {
    switch (type) {
      case 'volatility':
        return 'text-blue-500';
      case 'downside':
        return 'text-red-500';
      case 'correlation':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const calculateRiskReduction = (strategy: HedgingStrategy) => {
    // Simple risk reduction calculation based on hedge ratio and effectiveness
    return (strategy.performance.currentHedgeRatio * strategy.performance.effectiveProtection * 100).toFixed(1);
  };

  return (
    <Card data-testid="card-advanced-hedging">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Advanced Hedging Strategies</h2>
          </div>
          
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Risk Management Active</span>
          </Badge>
        </div>

        {/* Portfolio Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500" data-testid="portfolio-protection">
              78%
            </div>
            <div className="text-xs text-muted-foreground">Portfolio Protection</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500" data-testid="volatility-reduction">
              34%
            </div>
            <div className="text-xs text-muted-foreground">Volatility Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500" data-testid="max-drawdown">
              -12%
            </div>
            <div className="text-xs text-muted-foreground">Max Drawdown</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500" data-testid="hedge-cost">
              2.3%
            </div>
            <div className="text-xs text-muted-foreground">Annual Hedge Cost</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Hedging Strategies */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Active Strategies</h3>
            
            <div className="space-y-3">
              {hedgingStrategies.map((strategy) => {
                const IconComponent = getStrategyIcon(strategy.type);
                const colorClass = getStrategyColor(strategy.type);
                
                return (
                  <div key={strategy.id} className="p-4 bg-muted rounded-lg" data-testid={`strategy-${strategy.id}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-background rounded-full flex items-center justify-center`}>
                          <IconComponent className={`h-4 w-4 ${colorClass}`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{strategy.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{strategy.type} hedge</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={strategy.isActive ? "default" : "secondary"}>
                          {strategy.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch 
                          checked={strategy.isActive} 
                          data-testid={`toggle-${strategy.id}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Current Hedge:</span>
                        <span className="font-medium ml-2">{Math.round(strategy.performance.currentHedgeRatio * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Protection:</span>
                        <span className="font-medium ml-2">{Math.round(strategy.performance.effectiveProtection * 100)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk Reduction:</span>
                        <span className="font-medium ml-2 text-green-500">{calculateRiskReduction(strategy)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Rebalance:</span>
                        <span className="font-medium ml-2">{formatTimestamp(strategy.performance.lastRebalance).split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        data-testid={`configure-${strategy.id}`}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure Strategy
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create New Strategy */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Create New Strategy</h3>
            
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-xs">Strategy Name</Label>
                <Input
                  placeholder="Enter strategy name"
                  value={newStrategy.name}
                  onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                  data-testid="strategy-name"
                />
              </div>

              <div>
                <Label className="text-xs">Strategy Type</Label>
                <Select value={newStrategy.type} onValueChange={(value: any) => setNewStrategy({ ...newStrategy, type: value })}>
                  <SelectTrigger data-testid="strategy-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volatility">Volatility Protection</SelectItem>
                    <SelectItem value="downside">Downside Protection</SelectItem>
                    <SelectItem value="correlation">Correlation Hedge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Trigger Threshold: {Math.round(newStrategy.triggerThreshold * 100)}%</Label>
                <Slider
                  value={[newStrategy.triggerThreshold]}
                  onValueChange={([value]) => setNewStrategy({ ...newStrategy, triggerThreshold: value })}
                  max={0.5}
                  min={0.05}
                  step={0.05}
                  className="mt-2"
                  data-testid="trigger-threshold"
                />
              </div>

              <div>
                <Label className="text-xs">Hedge Ratio: {Math.round(newStrategy.hedgeRatio * 100)}%</Label>
                <Slider
                  value={[newStrategy.hedgeRatio]}
                  onValueChange={([value]) => setNewStrategy({ ...newStrategy, hedgeRatio: value })}
                  max={0.5}
                  min={0.05}
                  step={0.05}
                  className="mt-2"
                  data-testid="hedge-ratio"
                />
              </div>

              <div>
                <Label className="text-xs">Max Position Size: {Math.round(newStrategy.maxPositionSize * 100)}%</Label>
                <Slider
                  value={[newStrategy.maxPositionSize]}
                  onValueChange={([value]) => setNewStrategy({ ...newStrategy, maxPositionSize: value })}
                  max={0.5}
                  min={0.1}
                  step={0.05}
                  className="mt-2"
                  data-testid="max-position-size"
                />
              </div>

              <div>
                <Label className="text-xs">Rebalance Frequency</Label>
                <Select value={newStrategy.rebalanceFrequency} onValueChange={(value) => setNewStrategy({ ...newStrategy, rebalanceFrequency: value })}>
                  <SelectTrigger data-testid="rebalance-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                disabled={!newStrategy.name}
                data-testid="create-strategy"
              >
                <Shield className="h-4 w-4 mr-2" />
                Create Strategy
              </Button>
            </div>
          </div>
        </div>

        {/* Market Conditions Alert */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Market Volatility Alert</span>
          </div>
          <p className="text-xs text-yellow-700">
            Current market volatility (18.5%) exceeds your volatility threshold (15%). 
            Hedge positions have been automatically adjusted to protect your portfolio.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
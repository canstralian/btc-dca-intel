import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Play, Square, Settings, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface BotStatus {
  isRunning: boolean;
  activeRules: number;
  uptime: number | null;
}

interface AutomationRule {
  id: string;
  userId: string;
  strategyId: string;
  signalThreshold: number;
  maxAdjustment: number;
  isActive: boolean;
  conditions: {
    indicators: string[];
    minConfidence: number;
    actions: string[];
  };
}

export function TradingBot() {
  const [newRule, setNewRule] = useState({
    strategyId: "",
    signalThreshold: 0.6,
    maxAdjustment: 0.5,
    indicators: ["RSI", "MACD"],
    minConfidence: 0.7,
    actions: ["buy", "strong_buy"]
  });

  const queryClient = useQueryClient();

  // Fetch bot status
  const { data: botStatus, isLoading: statusLoading } = useQuery<BotStatus>({
    queryKey: ['bot-status'],
    queryFn: async () => {
      const response = await fetch('/api/bot/status');
      if (!response.ok) throw new Error('Failed to fetch bot status');
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch automation rules
  const { data: rules, isLoading: rulesLoading } = useQuery<AutomationRule[]>({
    queryKey: ['bot-rules'],
    queryFn: async () => {
      const response = await fetch('/api/bot/rules');
      if (!response.ok) throw new Error('Failed to fetch rules');
      return response.json();
    },
  });

  // Start/Stop bot mutations
  const startBotMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/bot/start', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to start bot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-status'] });
    },
  });

  const stopBotMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/bot/stop', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to stop bot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-status'] });
    },
  });

  // Add rule mutation
  const addRuleMutation = useMutation({
    mutationFn: async (rule: any) => {
      const response = await fetch('/api/bot/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (!response.ok) throw new Error('Failed to add rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-rules'] });
      // Reset form
      setNewRule({
        strategyId: "",
        signalThreshold: 0.6,
        maxAdjustment: 0.5,
        indicators: ["RSI", "MACD"],
        minConfidence: 0.7,
        actions: ["buy", "strong_buy"]
      });
    },
  });

  // Remove rule mutation
  const removeRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await fetch(`/api/bot/rules/${ruleId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove rule');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-rules'] });
    },
  });

  const formatUptime = (uptime: number | null) => {
    if (!uptime) return "Not running";
    const seconds = Math.floor((Date.now() - uptime) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleAddRule = () => {
    addRuleMutation.mutate({
      strategyId: newRule.strategyId,
      signalThreshold: newRule.signalThreshold,
      maxAdjustment: newRule.maxAdjustment,
      conditions: {
        indicators: newRule.indicators,
        minConfidence: newRule.minConfidence,
        actions: newRule.actions
      }
    });
  };

  return (
    <Card data-testid="card-trading-bot">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Automated Trading Bot</h2>
          </div>
          
          {/* Bot Status Indicator */}
          <div className="flex items-center space-x-3">
            <Badge 
              variant={botStatus?.isRunning ? "default" : "secondary"}
              className="flex items-center space-x-1"
              data-testid="bot-status-badge"
            >
              {botStatus?.isRunning ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              <span>{botStatus?.isRunning ? "Active" : "Stopped"}</span>
            </Badge>
            
            {botStatus?.isRunning && (
              <span className="text-xs text-muted-foreground">
                {formatUptime(botStatus.uptime)}
              </span>
            )}
          </div>
        </div>

        {/* Bot Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Control Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Control Panel</h3>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => startBotMutation.mutate()}
                disabled={botStatus?.isRunning || startBotMutation.isPending}
                className="flex-1"
                data-testid="start-bot-button"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Bot
              </Button>
              
              <Button
                onClick={() => stopBotMutation.mutate()}
                disabled={!botStatus?.isRunning || stopBotMutation.isPending}
                variant="destructive"
                className="flex-1"
                data-testid="stop-bot-button"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Bot
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="active-rules-count">
                  {botStatus?.activeRules || 0}
                </div>
                <div className="text-xs text-muted-foreground">Active Rules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500" data-testid="bot-uptime">
                  {botStatus?.isRunning ? formatUptime(botStatus.uptime) : "0h 0m"}
                </div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          {/* Add New Rule Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Add Automation Rule</h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Strategy ID</Label>
                <Input
                  placeholder="Enter strategy ID"
                  value={newRule.strategyId}
                  onChange={(e) => setNewRule({ ...newRule, strategyId: e.target.value })}
                  data-testid="rule-strategy-id"
                />
              </div>

              <div>
                <Label className="text-xs">Signal Threshold: {newRule.signalThreshold}</Label>
                <Slider
                  value={[newRule.signalThreshold]}
                  onValueChange={([value]) => setNewRule({ ...newRule, signalThreshold: value })}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                  data-testid="rule-signal-threshold"
                />
              </div>

              <div>
                <Label className="text-xs">Max Adjustment: {Math.round(newRule.maxAdjustment * 100)}%</Label>
                <Slider
                  value={[newRule.maxAdjustment]}
                  onValueChange={([value]) => setNewRule({ ...newRule, maxAdjustment: value })}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                  data-testid="rule-max-adjustment"
                />
              </div>

              <Button
                onClick={handleAddRule}
                disabled={!newRule.strategyId || addRuleMutation.isPending}
                className="w-full"
                data-testid="add-rule-button"
              >
                <Settings className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Rules */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground">Automation Rules</h3>
          
          {rulesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : rules && rules.length > 0 ? (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 bg-muted rounded-lg" data-testid={`rule-${rule.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium">Strategy: {rule.strategyId}</span>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>Threshold: {rule.signalThreshold}</div>
                        <div>Max Adjustment: {Math.round(rule.maxAdjustment * 100)}%</div>
                        <div>Indicators: {rule.conditions.indicators.join(", ")}</div>
                        <div>Actions: {rule.conditions.actions.join(", ")}</div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRuleMutation.mutate(rule.id)}
                      disabled={removeRuleMutation.isPending}
                      data-testid={`remove-rule-${rule.id}`}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No automation rules configured</p>
              <p className="text-xs">Add a rule above to start automated trading</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, MessageSquare, Smartphone, AlertTriangle, CheckCircle, Clock, Settings } from "lucide-react";

interface AlertRule {
  id: string;
  name: string;
  type: 'price' | 'volume' | 'signal' | 'portfolio';
  condition: {
    operator: 'above' | 'below' | 'crosses';
    value: number;
    timeframe?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    webhook?: string;
  };
  isActive: boolean;
  lastTriggered?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  isRead: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export function AlertSystem() {
  const [newAlert, setNewAlert] = useState({
    name: "",
    type: "price" as const,
    operator: "above" as const,
    value: 50000,
    email: true,
    push: true,
    sms: false,
    webhook: ""
  });

  // Mock alert rules
  const alertRules: AlertRule[] = [
    {
      id: "alert-1",
      name: "BTC Price Alert - Bull Market",
      type: "price",
      condition: {
        operator: "above",
        value: 50000,
        timeframe: "1h"
      },
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      isActive: true,
      lastTriggered: "2024-01-15T14:30:00Z"
    },
    {
      id: "alert-2",
      name: "High Volume Spike Alert",
      type: "volume",
      condition: {
        operator: "above",
        value: 2000000,
        timeframe: "15m"
      },
      notifications: {
        email: true,
        push: true,
        sms: true,
        webhook: "https://discord.com/api/webhooks/..."
      },
      isActive: true
    },
    {
      id: "alert-3",
      name: "Portfolio Drawdown Alert",
      type: "portfolio",
      condition: {
        operator: "below",
        value: -15
      },
      notifications: {
        email: true,
        push: true,
        sms: true
      },
      isActive: true
    }
  ];

  // Mock recent notifications
  const notifications: Notification[] = [
    {
      id: "notif-1",
      title: "Strong Buy Signal Detected",
      message: "RSI oversold condition with high volume spike on BTC/USD",
      type: "success",
      timestamp: "2024-01-15T15:45:00Z",
      isRead: false,
      action: {
        label: "View Analysis",
        url: "/signals/analysis"
      }
    },
    {
      id: "notif-2",
      title: "Portfolio Rebalanced",
      message: "Automated DCA executed: $500 purchase at $48,750",
      type: "info",
      timestamp: "2024-01-15T14:30:00Z",
      isRead: false,
      action: {
        label: "View Transaction",
        url: "/transactions"
      }
    },
    {
      id: "notif-3",
      title: "High Volatility Alert",
      message: "Market volatility increased to 22%. Hedge positions adjusted.",
      type: "warning",
      timestamp: "2024-01-15T13:15:00Z",
      isRead: true
    },
    {
      id: "notif-4",
      title: "Risk Threshold Exceeded",
      message: "Portfolio drawdown reached -12%. Consider reducing position size.",
      type: "error",
      timestamp: "2024-01-15T11:00:00Z",
      isRead: true,
      action: {
        label: "Adjust Strategy",
        url: "/risk-management"
      }
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price':
        return '💰';
      case 'volume':
        return '📊';
      case 'signal':
        return '🎯';
      case 'portfolio':
        return '📈';
      default:
        return '🔔';
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card data-testid="card-alert-system">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Alert & Notification System</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <Badge variant="destructive" data-testid="unread-count">
                {unreadCount} unread
              </Badge>
            )}
            <Button variant="outline" size="sm" data-testid="notification-settings">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Rules Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Alert Rules</h3>
            
            {/* Create New Alert */}
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Alert Name</Label>
                  <Input
                    placeholder="Enter alert name"
                    value={newAlert.name}
                    onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    data-testid="alert-name"
                  />
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={newAlert.type} onValueChange={(value: any) => setNewAlert({ ...newAlert, type: value })}>
                    <SelectTrigger data-testid="alert-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price Alert</SelectItem>
                      <SelectItem value="volume">Volume Alert</SelectItem>
                      <SelectItem value="signal">Signal Alert</SelectItem>
                      <SelectItem value="portfolio">Portfolio Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Condition</Label>
                  <Select value={newAlert.operator} onValueChange={(value: any) => setNewAlert({ ...newAlert, operator: value })}>
                    <SelectTrigger data-testid="alert-operator">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                      <SelectItem value="crosses">Crosses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Value</Label>
                  <Input
                    type="number"
                    value={newAlert.value}
                    onChange={(e) => setNewAlert({ ...newAlert, value: Number(e.target.value) })}
                    data-testid="alert-value"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Notification Methods</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Switch
                      checked={newAlert.email}
                      onCheckedChange={(checked) => setNewAlert({ ...newAlert, email: checked })}
                      data-testid="alert-email"
                    />
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">Email</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Switch
                      checked={newAlert.push}
                      onCheckedChange={(checked) => setNewAlert({ ...newAlert, push: checked })}
                      data-testid="alert-push"
                    />
                    <Bell className="h-4 w-4" />
                    <span className="text-xs">Push</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Switch
                      checked={newAlert.sms}
                      onCheckedChange={(checked) => setNewAlert({ ...newAlert, sms: checked })}
                      data-testid="alert-sms"
                    />
                    <Smartphone className="h-4 w-4" />
                    <span className="text-xs">SMS</span>
                  </label>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={!newAlert.name}
                data-testid="create-alert"
              >
                Create Alert
              </Button>
            </div>

            {/* Existing Alert Rules */}
            <div className="space-y-3">
              {alertRules.map((rule) => (
                <div key={rule.id} className="p-3 bg-muted rounded-lg" data-testid={`alert-rule-${rule.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(rule.type)}</span>
                      <div>
                        <div className="text-sm font-medium">{rule.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {rule.type} {rule.condition.operator} {rule.condition.value}
                        </div>
                      </div>
                    </div>
                    <Switch checked={rule.isActive} data-testid={`toggle-${rule.id}`} />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {rule.notifications.email && <Mail className="h-3 w-3 text-blue-500" />}
                      {rule.notifications.push && <Bell className="h-3 w-3 text-green-500" />}
                      {rule.notifications.sms && <Smartphone className="h-3 w-3 text-orange-500" />}
                      {rule.notifications.webhook && <MessageSquare className="h-3 w-3 text-purple-500" />}
                    </div>
                    {rule.lastTriggered && (
                      <span className="text-muted-foreground">
                        Last: {formatTimestamp(rule.lastTriggered)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-foreground">Recent Notifications</h3>
              <Button variant="outline" size="sm" data-testid="mark-all-read">
                Mark All Read
              </Button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);
                
                return (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg border ${notification.isRead ? 'bg-background' : 'bg-muted'}`}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-3">
                        <IconComponent className={`h-4 w-4 ${colorClass} mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">
                            {notification.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </div>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {notification.action && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs px-2 py-1"
                          data-testid={`action-${notification.id}`}
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
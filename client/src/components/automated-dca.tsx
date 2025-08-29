import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export function AutomatedDCA() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [amount, setAmount] = useState(500);
  const [frequency, setFrequency] = useState("weekly");
  const [volatilityAdjust, setVolatilityAdjust] = useState(true);
  const [signalAdjust, setSignalAdjust] = useState(false);

  return (
    <Card data-testid="card-automated-dca">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Automated DCA</h2>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${isEnabled ? 'text-accent' : 'text-muted-foreground'}`} data-testid="text-automation-status">
              {isEnabled ? 'Active' : 'Inactive'}
            </span>
            <Switch 
              checked={isEnabled} 
              onCheckedChange={setIsEnabled}
              data-testid="switch-automation-enabled"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="auto-amount" className="block text-xs font-medium text-muted-foreground mb-1">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input
                  id="auto-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="pl-6 text-sm"
                  data-testid="input-automation-amount"
                />
              </div>
            </div>
            <div>
              <Label className="block text-xs font-medium text-muted-foreground mb-1">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="text-sm" data-testid="select-automation-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="block text-xs font-medium text-muted-foreground mb-1">Next Purchase</Label>
            <div className="mono text-sm font-semibold text-foreground" data-testid="text-next-purchase">
              January 22, 2024 @ 9:00 AM
            </div>
          </div>

          <div className="bg-muted rounded-md p-3">
            <div className="text-xs text-muted-foreground mb-2">Smart Adjustments</div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="volatility-adjust"
                  checked={volatilityAdjust} 
                  onCheckedChange={(checked) => setVolatilityAdjust(checked as boolean)}
                  data-testid="checkbox-volatility-adjust"
                />
                <Label htmlFor="volatility-adjust" className="text-xs text-foreground">
                  Increase on high volatility
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="signal-adjust"
                  checked={signalAdjust} 
                  onCheckedChange={(checked) => setSignalAdjust(checked as boolean)}
                  data-testid="checkbox-signal-adjust"
                />
                <Label htmlFor="signal-adjust" className="text-xs text-foreground">
                  Adjust based on signals
                </Label>
              </div>
            </div>
          </div>

          <Button className="w-full" data-testid="button-update-automation">
            Update Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

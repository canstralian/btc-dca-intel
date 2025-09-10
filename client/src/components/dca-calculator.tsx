import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useDCACalculator } from "@/hooks/use-dca-calculator";
import { Skeleton } from "@/components/ui/skeleton";

export function DCACalculator() {
  const { amount, setAmount, frequency, setFrequency, duration, setDuration, calculation, calculate } = useDCACalculator();

  const formatCurrency = (value?: number | null) => {
    if (typeof value !== 'number' || isNaN(value) || value == null) return '$0.00';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const formatPercentage = (value?: number | null) => {
    if (typeof value !== 'number' || isNaN(value) || value == null) return '0.00%';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Card data-testid="card-dca-calculator">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">DCA Strategy Calculator</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount" className="block text-sm font-medium text-muted-foreground mb-2">
              Investment Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="pl-8"
                data-testid="input-dca-amount"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-muted-foreground mb-2">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger data-testid="select-dca-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-muted-foreground mb-2">Duration (months)</Label>
            <Slider
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              max={60}
              min={1}
              step={1}
              className="w-full"
              data-testid="slider-dca-duration"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1m</span>
              <span className="mono font-semibold" data-testid="text-duration-value">{duration}m</span>
              <span>60m</span>
            </div>
          </div>

          <Button 
            onClick={calculate} 
            className="w-full" 
            disabled={calculation.isPending}
            data-testid="button-calculate-dca"
          >
            {calculation.isPending ? "Calculating..." : "Calculate Strategy"}
          </Button>

          <div className="bg-muted rounded-md p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Investment:</span>
              {calculation.isPending ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <span className="mono font-semibold text-foreground" data-testid="text-total-investment">
                  {calculation.data ? formatCurrency(calculation.data.totalInvestment) : formatCurrency(amount * duration)}
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Projected Value:</span>
              {calculation.isPending ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <span className="mono font-semibold text-accent" data-testid="text-projected-value">
                  {calculation.data ? formatCurrency(calculation.data.projectedValue) : formatCurrency(amount * duration * 1.21)}
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Potential Return:</span>
              {calculation.isPending ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span className="mono font-semibold text-accent" data-testid="text-potential-return">
                  {calculation.data ? formatPercentage(calculation.data.potentialReturn) : '+21.05%'}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

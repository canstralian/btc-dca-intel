import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Download, Share } from "lucide-react";

export function AdvancedTools() {
  return (
    <Card data-testid="card-advanced-tools">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Advanced Strategy Tools</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Hedging Strategies</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div>
                  <div className="text-sm font-medium text-foreground">Put Options Hedge</div>
                  <div className="text-xs text-muted-foreground">Protect against 20%+ drops</div>
                </div>
                <Button variant="secondary" size="sm" data-testid="button-configure-hedge">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div>
                  <div className="text-sm font-medium text-foreground">Stop-Loss Orders</div>
                  <div className="text-xs text-muted-foreground">Automated risk management</div>
                </div>
                <Button variant="secondary" size="sm" data-testid="button-configure-stop-loss">
                  Setup
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Monte Carlo Analysis</h3>
            <div className="bg-muted rounded-md p-4">
              <div className="text-center mb-3">
                <div className="mono text-2xl font-bold text-accent" data-testid="text-monte-carlo-success-rate">87%</div>
                <div className="text-xs text-muted-foreground">Success Rate (10,000 simulations)</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Best Case:</span>
                  <span className="mono font-semibold text-accent" data-testid="text-monte-carlo-best">+180%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Worst Case:</span>
                  <span className="mono font-semibold text-destructive" data-testid="text-monte-carlo-worst">-34%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Expected:</span>
                  <span className="mono font-semibold text-accent" data-testid="text-monte-carlo-expected">+31%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-medium text-foreground">Strategy Optimization</h3>
            <div className="space-y-3">
              <Button className="w-full" data-testid="button-optimize-strategy">
                <Bot className="h-3 w-3 mr-2" />
                AI Optimize Strategy
              </Button>
              
              <Button variant="secondary" className="w-full" data-testid="button-export-strategy">
                <Download className="h-3 w-3 mr-2" />
                Export Configuration
              </Button>

              <Button variant="outline" className="w-full" data-testid="button-share-strategy">
                <Share className="h-3 w-3 mr-2" />
                Share Strategy
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

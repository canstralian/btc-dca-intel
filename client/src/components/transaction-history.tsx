import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ArrowRight } from "lucide-react";

export function TransactionHistory() {
  // Mock transaction data
  const transactions = [
    {
      id: '1',
      btcAmount: '0.0115',
      usdAmount: '500.00',
      price: '43,478',
      date: 'Jan 15, 2024'
    },
    {
      id: '2',
      btcAmount: '0.0121',
      usdAmount: '500.00',
      price: '41,322',
      date: 'Jan 8, 2024'
    },
    {
      id: '3',
      btcAmount: '0.0118',
      usdAmount: '500.00',
      price: '42,387',
      date: 'Jan 1, 2024'
    }
  ];

  return (
    <Card data-testid="card-transaction-history">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent DCA Purchases</h2>
          <History className="h-4 w-4 text-secondary" />
        </div>
        
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border" data-testid={`transaction-${tx.id}`}>
              <div className="flex flex-col">
                <span className="mono text-sm font-medium text-foreground">{tx.btcAmount} BTC</span>
                <span className="text-xs text-muted-foreground">{tx.date}</span>
              </div>
              <div className="text-right">
                <div className="mono text-sm font-semibold text-foreground">${tx.usdAmount}</div>
                <div className="mono text-xs text-muted-foreground">@${tx.price}</div>
              </div>
            </div>
          ))}
        </div>

        <Button 
          variant="ghost" 
          className="w-full mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
          data-testid="button-view-all-transactions"
        >
          View All Transactions <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

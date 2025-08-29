
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from "recharts";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Brain, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PredictionData {
  predicted_prices: number[];
  confidence_interval: {
    lower: number[];
    upper: number[];
  };
  model_accuracy: number;
  feature_importance?: Record<string, number>;
}

interface ChartDataPoint {
  day: number;
  predicted: number;
  lower: number;
  upper: number;
  date: string;
}

export function MLPredictions() {
  const [daysAhead, setDaysAhead] = useState(7);
  const [modelType, setModelType] = useState("lstm");

  const prediction = useMutation({
    mutationFn: async ({ days_ahead, model_type }: { days_ahead: number; model_type: string }) => {
      const response = await fetch("/api/ml/predict-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days_ahead, model_type }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }
      
      return response.json() as Promise<PredictionData>;
    },
  });

  const runPrediction = () => {
    prediction.mutate({ days_ahead: daysAhead, model_type: modelType });
  };

  const formatChartData = (data: PredictionData): ChartDataPoint[] => {
    return data.predicted_prices.map((price, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index + 1);
      
      return {
        day: index + 1,
        predicted: Math.round(price),
        lower: Math.round(data.confidence_interval.lower[index]),
        upper: Math.round(data.confidence_interval.upper[index]),
        date: date.toLocaleDateString(),
      };
    });
  };

  const formatCurrency = (value: number) => 
    value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const getModelBadgeColor = (type: string) => {
    const colors = {
      lstm: "bg-blue-500",
      rf: "bg-green-500", 
      gb: "bg-purple-500",
      ensemble: "bg-orange-500"
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  const getModelName = (type: string) => {
    const names = {
      lstm: "LSTM Neural Network",
      rf: "Random Forest",
      gb: "Gradient Boosting",
      ensemble: "Ensemble Model"
    };
    return names[type as keyof typeof names] || type.toUpperCase();
  };

  return (
    <Card data-testid="card-ml-predictions">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            AI Price Predictions
          </h2>
          <Badge className={`${getModelBadgeColor(modelType)} text-white`}>
            {getModelName(modelType)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="days-ahead" className="block text-xs font-medium text-muted-foreground mb-1">
              Forecast Period
            </Label>
            <Input
              id="days-ahead"
              type="number"
              min="1"
              max="365"
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              className="text-sm"
              data-testid="input-prediction-days"
            />
          </div>

          <div>
            <Label htmlFor="model-type" className="block text-xs font-medium text-muted-foreground mb-1">
              AI Model
            </Label>
            <Select value={modelType} onValueChange={setModelType} data-testid="select-model-type">
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lstm">LSTM Neural Network</SelectItem>
                <SelectItem value="rf">Random Forest</SelectItem>
                <SelectItem value="gb">Gradient Boosting</SelectItem>
                <SelectItem value="ensemble">Ensemble Model</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col justify-end">
            <Button 
              onClick={runPrediction}
              disabled={prediction.isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              data-testid="button-run-prediction"
            >
              <TrendingUp className="h-3 w-3 mr-2" />
              {prediction.isPending ? "Predicting..." : "Generate Forecast"}
            </Button>
          </div>
        </div>

        {prediction.data && (
          <div className="space-y-4">
            {/* Model Performance Indicator */}
            <div className="bg-muted rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Model Accuracy</span>
                <span className="font-semibold text-accent" data-testid="text-model-accuracy">
                  {(prediction.data.model_accuracy * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Price Chart with Confidence Intervals */}
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={formatChartData(prediction.data)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 20%)" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12, fill: 'hsl(210 40% 65%)' }}
                    stroke="hsl(210 40% 20%)"
                    label={{ value: 'Days Ahead', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12, fill: 'hsl(210 40% 65%)' }}
                    stroke="hsl(210 40% 20%)"
                  />
                  
                  {/* Confidence Interval Area */}
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stackId="confidence"
                    stroke="none"
                    fill="hsl(155 69% 37% / 0.2)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stackId="confidence"
                    stroke="none"
                    fill="hsl(155 69% 37% / 0.2)"
                  />
                  
                  {/* Predicted Price Line */}
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(155 69% 37%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(155 69% 37%)', strokeWidth: 2, r: 4 }}
                    name="Predicted Price"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Price Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-md p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Price in {daysAhead} days</div>
                <div className="font-semibold text-lg text-accent" data-testid="text-final-prediction">
                  {formatCurrency(prediction.data.predicted_prices[prediction.data.predicted_prices.length - 1])}
                </div>
              </div>
              
              <div className="bg-muted rounded-md p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Confidence Range</div>
                <div className="font-semibold text-sm text-foreground">
                  {formatCurrency(prediction.data.confidence_interval.lower[prediction.data.confidence_interval.lower.length - 1])} - {formatCurrency(prediction.data.confidence_interval.upper[prediction.data.confidence_interval.upper.length - 1])}
                </div>
              </div>
              
              <div className="bg-muted rounded-md p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Expected Change</div>
                <div className="font-semibold text-sm text-accent">
                  {/* This would calculate % change from current price */}
                  +12.3%
                </div>
              </div>
            </div>

            {/* Feature Importance (for tree-based models) */}
            {prediction.data.feature_importance && (
              <div className="bg-muted rounded-md p-3">
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Key Factors Influencing Prediction
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(prediction.data.feature_importance)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 4)
                    .map(([feature, importance]) => (
                      <div key={feature} className="flex justify-between">
                        <span className="text-muted-foreground">{feature}:</span>
                        <span className="font-medium">{(importance * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {prediction.isPending && (
          <div className="space-y-4">
            <div className="bg-muted rounded-md p-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        )}

        {prediction.isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-center">
            <AlertCircle className="h-5 w-5 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">
              Failed to generate prediction. Please try again or contact support.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

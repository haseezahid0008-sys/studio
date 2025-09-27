
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, BrainCircuit } from "lucide-react";
import {
  calculateDailyProfitLoss,
  type CalculateDailyProfitLossOutput,
} from "@/ai/flows/calculate-daily-profit-loss";
import { getAppSettings, getCurrencySymbol } from "@/lib/firestore";
import type { AppSettings } from "@/lib/types";

export function ProfitLossCalculator() {
  const [sales, setSales] = useState("");
  const [expenses, setExpenses] = useState("");
  const [result, setResult] = useState<CalculateDailyProfitLossOutput | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAppSettings().then(setSettings);
  }, []);

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const dailySales = parseFloat(sales);
    const dailyExpenses = parseFloat(expenses);

    if (isNaN(dailySales) || isNaN(dailyExpenses)) {
      setError("Please enter valid numbers for sales and expenses.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await calculateDailyProfitLoss({ dailySales, dailyExpenses });
      setResult(res);
    } catch (e) {
      setError("Failed to calculate. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const currencySymbol = getCurrencySymbol(settings?.currency);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">P/L Calculator</CardTitle>
          <CardDescription>
            Enter total sales and expenses for a day to calculate the profit or
            loss.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sales">Daily Sales</Label>
            <Input
              id="sales"
              type="number"
              placeholder="e.g., 1500"
              value={sales}
              onChange={(e) => setSales(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expenses">Daily Expenses</Label>
            <Input
              id="expenses"
              type="number"
              placeholder="e.g., 450"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleCalculate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Calculate
          </Button>
        </CardFooter>
      </Card>
      
      <div className="flex items-center justify-center">
        {isLoading ? (
          <Card className="w-full flex flex-col items-center justify-center p-10 bg-muted/50 border-dashed">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Calculating...</p>
          </Card>
        ) : result ? (
          <Card
            className={`w-full text-center p-10 ${
              result.isProfitable
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {result.isProfitable ? (
              <TrendingUp className="mx-auto h-16 w-16 text-green-500" />
            ) : (
              <TrendingDown className="mx-auto h-16 w-16 text-red-500" />
            )}
            <CardTitle
              className={`font-headline text-4xl mt-4 ${
                result.isProfitable ? "text-green-700" : "text-red-700"
              }`}
            >
              {result.isProfitable ? "Profit" : "Loss"}: {currencySymbol}{Math.abs(result.profitLoss).toLocaleString()}
            </CardTitle>
            <CardDescription className="mt-2 text-lg">
              The day was {result.isProfitable ? "profitable" : "not profitable"}.
            </CardDescription>
          </Card>
        ) : (
            <Card className="w-full flex flex-col items-center justify-center p-10 bg-muted/50 border-dashed">
                 <BrainCircuit className="h-12 w-12 text-muted-foreground" />
                 <p className="mt-4 text-muted-foreground text-center">Results will be displayed here.</p>
            </Card>
        )}
      </div>
    </div>
  );
}

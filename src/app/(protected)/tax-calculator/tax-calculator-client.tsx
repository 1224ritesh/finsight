"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calculator, IndianRupee } from "lucide-react";

type TaxRegime = "old" | "new";

interface TaxResult {
  regime: TaxRegime;
  annualCTC: number;
  taxableIncome: number;
  totalTax: number;
  effectiveTaxRate: number;
  taxBreakdown: Array<{
    slab: string;
    rate: number;
    amount: number;
  }>;
  explanation: string;
}

interface ComparisonResult {
  old: TaxResult;
  new: TaxResult;
  recommendation: string;
}

export default function TaxCalculatorClient() {
  const [annualCTC, setAnnualCTC] = useState("");
  const [regime, setRegime] = useState<TaxRegime>("new");
  const [result, setResult] = useState<TaxResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculateTax = async (compare: boolean = false) => {
    setError("");
    setLoading(true);
    setResult(null);
    setComparison(null);

    try {
      const response = await fetch("/api/tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annualCTC: parseFloat(annualCTC),
          regime,
          compare,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to calculate tax");
        return;
      }

      if (compare) {
        setComparison(data);
      } else {
        setResult(data);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateTax(false);
  };

  const handleCompare = () => {
    calculateTax(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          Income Tax Calculator
        </h1>
        <p className="text-gray-600 mt-2">
          Calculate your income tax for FY 2025-26
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Your Details</CardTitle>
          <CardDescription>
            Input your annual CTC and select your preferred tax regime
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="ctc">Annual CTC (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="ctc"
                  type="number"
                  placeholder="1050000"
                  value={annualCTC}
                  onChange={(e) => setAnnualCTC(e.target.value)}
                  className="pl-10"
                  required
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tax Regime</Label>
              <Tabs
                value={regime}
                onValueChange={(v) => setRegime(v as TaxRegime)}
                suppressHydrationWarning
              >
                <TabsList
                  className="grid w-full grid-cols-2"
                  suppressHydrationWarning
                >
                  <TabsTrigger value="old" suppressHydrationWarning>
                    Old Regime
                  </TabsTrigger>
                  <TabsTrigger value="new" suppressHydrationWarning>
                    New Regime
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-gray-500">
                {regime === "new"
                  ? "Standard deduction: ₹75,000"
                  : "Standard deduction: ₹50,000"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Calculating..." : "Calculate Tax"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCompare}
                disabled={loading || !annualCTC}
              >
                Compare Regimes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tax Calculation Result
              <Badge variant="secondary">
                {result.regime.toUpperCase()} Regime
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Annual CTC</p>
                <p className="text-xl font-bold">
                  ₹{result.annualCTC.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxable Income</p>
                <p className="text-xl font-bold">
                  ₹{result.taxableIncome.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tax</p>
                <p className="text-xl font-bold text-red-600">
                  ₹{result.totalTax.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Effective Rate</p>
                <p className="text-xl font-bold">{result.effectiveTaxRate}%</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tax Breakdown by Slab</h3>
              <div className="space-y-2">
                {result.taxBreakdown.map((slab, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">
                      {slab.slab} ({slab.rate}%)
                    </span>
                    <span className="font-medium">
                      ₹{slab.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <pre className="text-sm bg-gray-50 p-4 rounded whitespace-pre-wrap font-mono">
                {result.explanation}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Regime Comparison</CardTitle>
            <CardDescription>{comparison.recommendation}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { data: comparison.old, label: "Old Regime" },
                { data: comparison.new, label: "New Regime" },
              ].map(({ data, label }) => (
                <div key={label} className="space-y-3">
                  <h3 className="font-semibold text-lg">{label}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Tax</span>
                      <span className="font-bold">
                        ₹{data.totalTax.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Effective Rate
                      </span>
                      <span className="font-medium">
                        {data.effectiveTaxRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Take-Home</span>
                      <span className="font-medium">
                        ₹
                        {(data.annualCTC - data.totalTax).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

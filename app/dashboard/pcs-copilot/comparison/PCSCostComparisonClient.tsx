"use client";

import { useState, useEffect } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { toast } from "sonner";

interface CostComparison {
  id: string;
  comparison_name: string;
  origin_base: string;
  destination_base: string;
  distance_miles: number;
  weight_authorized: number;
  dependents_count: number;
  rank_at_pcs: string;
  
  // DITY costs
  dity_truck_rental: number;
  dity_gas_cost: number;
  dity_hotel_cost: number;
  dity_meals_cost: number;
  dity_labor_cost: number;
  dity_total_cost: number;
  dity_government_cost: number;
  dity_profit: number;
  
  // Full Move costs
  full_move_cost: number;
  full_move_entitlements: number;
  
  // Partial DITY costs
  partial_dity_weight: number;
  partial_dity_truck_cost: number;
  partial_dity_gas_cost: number;
  partial_dity_total_cost: number;
  partial_dity_government_cost: number;
  partial_dity_profit: number;
  
  // Analysis
  recommended_option: "dity" | "full_move" | "partial_dity";
  break_even_weight: number;
  confidence_score: number;
  notes: string;
  created_at: string;
}

interface ComparisonFormData {
  origin_base: string;
  destination_base: string;
  distance_miles: number;
  weight_authorized: number;
  dependents_count: number;
  rank_at_pcs: string;
  
  // DITY inputs
  dity_truck_rental: number;
  dity_gas_cost: number;
  dity_hotel_cost: number;
  dity_meals_cost: number;
  dity_labor_cost: number;
  
  // Partial DITY inputs
  partial_dity_weight: number;
}

export default function PCSCostComparisonClient() {
  const [comparisons, setComparisons] = useState<CostComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"calculator" | "history">("calculator");
  
  // Form data
  const [formData, setFormData] = useState<ComparisonFormData>({
    origin_base: "",
    destination_base: "",
    distance_miles: 0,
    weight_authorized: 0,
    dependents_count: 0,
    rank_at_pcs: "",
    dity_truck_rental: 0,
    dity_gas_cost: 0,
    dity_hotel_cost: 0,
    dity_meals_cost: 0,
    dity_labor_cost: 0,
    partial_dity_weight: 0,
  });

  // Results
  const [results, setResults] = useState<{
    dity: {
      total_cost: number;
      government_cost: number;
      profit: number;
      profit_percentage: number;
    };
    full_move: {
      cost: number;
      entitlements: number;
      net_cost: number;
    };
    partial_dity: {
      total_cost: number;
      government_cost: number;
      profit: number;
      profit_percentage: number;
    };
    recommended: "dity" | "full_move" | "partial_dity";
    break_even_weight: number;
    confidence_score: number;
  } | null>(null);

  // Load comparison history
  useEffect(() => {
    loadComparisons();
  }, []);

  const loadComparisons = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pcs/cost-comparison");
      
      if (!response.ok) {
        throw new Error("Failed to load comparisons");
      }

      const data = await response.json();
      setComparisons(data.comparisons || []);
    } catch (error) {
      console.error("Error loading comparisons:", error);
      toast.error("Failed to load comparisons. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ComparisonFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateComparison = async () => {
    try {
      const response = await fetch("/api/pcs/cost-comparison/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Calculation failed");
      }

      const data = await response.json();
      setResults(data.results);
      toast.success("Cost comparison calculated successfully!");
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("Failed to calculate comparison. Please try again.");
    }
  };

  const saveComparison = async () => {
    if (!results) {
      toast.error("Please calculate comparison first");
      return;
    }

    try {
      const response = await fetch("/api/pcs/cost-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          results
        })
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      toast.success("Comparison saved successfully!");
      loadComparisons();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save comparison");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRecommendationColor = (option: string) => {
    switch (option) {
      case "dity": return "success";
      case "full_move": return "neutral";
      case "partial_dity": return "warning";
      default: return "secondary";
    }
  };

  const getRecommendationIcon = (option: string) => {
    switch (option) {
      case "dity": return "Truck";
      case "full_move": return "Shield";
      case "partial_dity": return "Briefcase";
      default: return "HelpCircle";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading comparisons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Cost Calculator</TabsTrigger>
          <TabsTrigger value="history">Comparison History</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>PCS Move Details</CardTitle>
              <CardDescription>
                Enter your move details to compare DITY vs Full Move vs Partial DITY options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Origin Base</label>
                  <Input
                    placeholder="e.g., Fort Hood"
                    value={formData.origin_base}
                    onChange={(value) => handleInputChange("origin_base", value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Destination Base</label>
                  <Input
                    placeholder="e.g., Fort Campbell"
                    value={formData.destination_base}
                    onChange={(value) => handleInputChange("destination_base", value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Distance (miles)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.distance_miles.toString()}
                    onChange={(value) => handleInputChange("distance_miles", parseInt(value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Weight Authorized (lbs)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.weight_authorized.toString()}
                    onChange={(value) => handleInputChange("weight_authorized", parseInt(value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Dependents</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.dependents_count.toString()}
                    onChange={(value) => handleInputChange("dependents_count", parseInt(value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rank at PCS</label>
                  <Input
                    placeholder="e.g., E5, O3"
                    value={formData.rank_at_pcs}
                    onChange={(value) => handleInputChange("rank_at_pcs", value)}
                  />
                </div>
              </div>

              {/* DITY Cost Inputs */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">DITY Move Costs</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Truck Rental</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.dity_truck_rental.toString()}
                      onChange={(value) => handleInputChange("dity_truck_rental", parseFloat(value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gas Cost</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.dity_gas_cost.toString()}
                      onChange={(value) => handleInputChange("dity_gas_cost", parseFloat(value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Hotel Cost</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.dity_hotel_cost.toString()}
                      onChange={(value) => handleInputChange("dity_hotel_cost", parseFloat(value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Meals Cost</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.dity_meals_cost.toString()}
                      onChange={(value) => handleInputChange("dity_meals_cost", parseFloat(value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Labor Cost</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.dity_labor_cost.toString()}
                      onChange={(value) => handleInputChange("dity_labor_cost", parseFloat(value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Partial DITY Weight (lbs)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.partial_dity_weight.toString()}
                      onChange={(value) => handleInputChange("partial_dity_weight", parseInt(value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={calculateComparison} className="flex-1">
                  <Icon name="Calculator" className="mr-2 h-4 w-4" />
                  Calculate Comparison
                </Button>
                {results && (
                  <Button onClick={saveComparison} variant="outline">
                    <Icon name="Save" className="mr-2 h-4 w-4" />
                    Save Comparison
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Recommendation */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon name={getRecommendationIcon(results.recommended)} className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-green-800">Recommended: {results.recommended.replace('_', ' ').toUpperCase()}</CardTitle>
                  </div>
                  <CardDescription>
                    Based on your inputs, this option will maximize your profit.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Comparison Results */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* DITY Results */}
                <Card className={results.recommended === "dity" ? "ring-2 ring-green-500" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">DITY Move</CardTitle>
                      {results.recommended === "dity" && (
                        <Badge variant="success">Recommended</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Your Cost:</span>
                      <span className="font-medium">{formatCurrency(results.dity.total_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gov Reimbursement:</span>
                      <span className="font-medium">{formatCurrency(results.dity.government_cost)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Your Profit:</span>
                      <span className={`font-bold ${results.dity.profit > 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(results.dity.profit)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {results.dity.profit_percentage.toFixed(1)}% profit margin
                    </div>
                  </CardContent>
                </Card>

                {/* Full Move Results */}
                <Card className={results.recommended === "full_move" ? "ring-2 ring-green-500" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Full Move</CardTitle>
                      {results.recommended === "full_move" && (
                        <Badge variant="success">Recommended</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gov Cost:</span>
                      <span className="font-medium">{formatCurrency(results.full_move.cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Your Entitlements:</span>
                      <span className="font-medium">{formatCurrency(results.full_move.entitlements)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Net Cost to You:</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(results.full_move.net_cost)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      No profit, but no hassle
                    </div>
                  </CardContent>
                </Card>

                {/* Partial DITY Results */}
                <Card className={results.recommended === "partial_dity" ? "ring-2 ring-green-500" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Partial DITY</CardTitle>
                      {results.recommended === "partial_dity" && (
                        <Badge variant="success">Recommended</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Your Cost:</span>
                      <span className="font-medium">{formatCurrency(results.partial_dity.total_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gov Reimbursement:</span>
                      <span className="font-medium">{formatCurrency(results.partial_dity.government_cost)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Your Profit:</span>
                      <span className={`font-bold ${results.partial_dity.profit > 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(results.partial_dity.profit)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {results.partial_dity.profit_percentage.toFixed(1)}% profit margin
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Break-even Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Break-even Analysis</CardTitle>
                  <CardDescription>
                    Weight threshold where DITY becomes profitable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.break_even_weight} lbs
                    </div>
                    <p className="text-sm text-gray-600">
                      Move more than this weight to profit from DITY
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {comparisons.length === 0 ? (
            <div className="py-12 text-center">
              <Icon name="BarChart" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No comparisons yet</h3>
              <p className="text-gray-600">Create your first cost comparison to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {comparisons.map((comparison) => (
                <Card key={comparison.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{comparison.comparison_name}</CardTitle>
                      <Badge variant={getRecommendationColor(comparison.recommended_option)}>
                        {comparison.recommended_option.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      {comparison.origin_base} → {comparison.destination_base}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Distance:</span>
                      <span className="font-medium">{comparison.distance_miles} miles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Weight:</span>
                      <span className="font-medium">{comparison.weight_authorized} lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">DITY Profit:</span>
                      <span className={`font-medium ${comparison.dity_profit > 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(comparison.dity_profit)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(comparison.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

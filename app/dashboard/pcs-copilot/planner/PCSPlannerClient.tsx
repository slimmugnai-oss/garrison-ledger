"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Icon from "@/app/components/ui/Icon";
import Input from "@/app/components/ui/Input";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";

interface BaseData {
  code: string;
  name: string;
  state: string;
  bah: number;
  colIndex: number;
  distance: number;
  schoolRating: number;
  pcsCost: number;
}

interface ComparisonData {
  id: string;
  name: string;
  bases: BaseData[];
  analysis: {
    bestBah: string;
    bestCol: string;
    bestSchools: string;
    bestPcsCost: string;
    recommendation: string;
  };
  createdAt: string;
}

export default function PCSPlannerClient() {
  const [selectedBases, setSelectedBases] = useState<string[]>([]);
  const [comparisonName, setComparisonName] = useState("");
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<BaseData[]>([]);

  // Sample base data (in production, this would come from an API)
  const availableBases = [
    { code: "JBSA", name: "Joint Base San Antonio", state: "TX", bah: 1800, colIndex: 95, schoolRating: 8.5 },
    { code: "FTBL", name: "Fort Bliss", state: "TX", bah: 1650, colIndex: 88, schoolRating: 7.2 },
    { code: "FTBR", name: "Fort Bragg", state: "NC", bah: 1950, colIndex: 92, schoolRating: 8.1 },
    { code: "FTCM", name: "Fort Campbell", state: "KY", bah: 1750, colIndex: 89, schoolRating: 7.8 },
    { code: "FTDR", name: "Fort Drum", state: "NY", bah: 1850, colIndex: 105, schoolRating: 8.3 },
    { code: "FTGV", name: "Fort Gordon", state: "GA", bah: 1700, colIndex: 87, schoolRating: 7.5 },
    { code: "FTHO", name: "Fort Hood", state: "TX", bah: 1600, colIndex: 85, schoolRating: 6.9 },
    { code: "FTLV", name: "Fort Leavenworth", state: "KS", bah: 1650, colIndex: 90, schoolRating: 8.7 },
    { code: "FTLE", name: "Fort Leonard Wood", state: "MO", bah: 1550, colIndex: 82, schoolRating: 7.1 },
    { code: "FTME", name: "Fort Meade", state: "MD", bah: 2200, colIndex: 120, schoolRating: 8.9 },
    { code: "FTRI", name: "Fort Riley", state: "KS", bah: 1600, colIndex: 88, schoolRating: 7.6 },
    { code: "FTSI", name: "Fort Sill", state: "OK", bah: 1500, colIndex: 80, schoolRating: 6.8 },
    { code: "FTST", name: "Fort Stewart", state: "GA", bah: 1650, colIndex: 86, schoolRating: 7.3 },
    { code: "FTWA", name: "Fort Wainwright", state: "AK", bah: 2100, colIndex: 110, schoolRating: 8.2 },
    { code: "FTWO", name: "Fort Worth", state: "TX", bah: 1800, colIndex: 94, schoolRating: 8.0 }
  ];

  useEffect(() => {
    loadComparisons();
  }, []);

  const loadComparisons = async () => {
    try {
      const response = await fetch("/api/pcs/planner/compare");
      if (response.ok) {
        const data = await response.json();
        setComparisons(data.comparisons || []);
      } else {
        toast.error("Failed to load saved comparisons");
      }
    } catch (error) {
      console.error("Failed to load comparisons:", error);
      toast.error("Failed to load saved comparisons");
    }
  };

  const handleBaseToggle = (baseCode: string) => {
    setSelectedBases(prev => 
      prev.includes(baseCode) 
        ? prev.filter(code => code !== baseCode)
        : [...prev, baseCode]
    );
  };

  const calculatePcsCost = async (base: any) => {
    // This would call the real PCS calculation API
    // For now, using simplified calculation
    const baseCost = base.bah * 0.1; // 10% of BAH as rough PCS cost
    const distanceCost = base.distance * 0.5; // $0.50 per mile
    return baseCost + distanceCost;
  };

  const analyzeBases = async () => {
    if (selectedBases.length < 2) {
      toast.error("Please select at least 2 bases to compare");
      return;
    }

    setLoading(true);
    try {
      const bases = availableBases.filter(base => selectedBases.includes(base.code));
      const analysisData = await Promise.all(
        bases.map(async (base) => ({
          ...base,
          distance: Math.floor(Math.random() * 2000) + 500, // Mock distance
          pcsCost: await calculatePcsCost(base)
        }))
      );

      setAnalysisData(analysisData);

      // Find best options
      const bestBah = analysisData.reduce((best, current) => 
        current.bah > best.bah ? current : best
      );
      const bestCol = analysisData.reduce((best, current) => 
        current.colIndex < best.colIndex ? current : best
      );
      const bestSchools = analysisData.reduce((best, current) => 
        current.schoolRating > best.schoolRating ? current : best
      );
      const bestPcsCost = analysisData.reduce((best, current) => 
        current.pcsCost < best.pcsCost ? current : best
      );

      // Generate recommendation
      let recommendation = "";
      if (bestBah.code === bestCol.code) {
        recommendation = `${bestBah.name} offers the best BAH and cost of living combination.`;
      } else if (bestSchools.code === bestPcsCost.code) {
        recommendation = `${bestSchools.name} provides excellent schools with low PCS costs.`;
      } else {
        recommendation = `Consider your priorities: ${bestBah.name} for BAH, ${bestCol.name} for cost of living, ${bestSchools.name} for schools.`;
      }

      toast.success("Analysis complete! Check the results below.");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze bases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveComparison = async () => {
    if (!comparisonName.trim()) {
      toast.error("Please enter a comparison name");
      return;
    }

    if (analysisData.length === 0) {
      toast.error("Please run analysis first");
      return;
    }

    try {
      const response = await fetch("/api/pcs/planner/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: comparisonName,
          bases: analysisData
        })
      });

      if (response.ok) {
        toast.success("Comparison saved successfully!");
        setComparisonName("");
        setAnalysisData([]);
        setSelectedBases([]);
        loadComparisons();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Save failed");
      }
    } catch (error: any) {
      console.error("Save failed:", error);
      toast.error(error.message || "Failed to save comparison");
    }
  };

  const handleDeleteComparison = async (comparisonId: string) => {
    if (!confirm("Delete this comparison?")) return;

    try {
      const response = await fetch(`/api/pcs/planner/compare?id=${comparisonId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Comparison deleted");
        loadComparisons();
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete comparison");
    }
  };

  const getBahColor = (bah: number) => {
    if (bah >= 2000) return "text-green-600";
    if (bah >= 1700) return "text-yellow-600";
    return "text-red-600";
  };

  const getColColor = (colIndex: number) => {
    if (colIndex <= 85) return "text-green-600";
    if (colIndex <= 100) return "text-yellow-600";
    return "text-red-600";
  };

  const getSchoolColor = (rating: number) => {
    if (rating >= 8.5) return "text-green-600";
    if (rating >= 7.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignment Planner</h1>
          <p className="text-gray-600">Compare potential base assignments and estimate PCS costs</p>
        </div>
        <Badge variant="primary">Pre-Orders Planning</Badge>
      </div>

      {/* Base Selection */}
      <AnimatedCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Bases to Compare</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableBases.map((base) => (
            <button
              key={base.code}
              onClick={() => handleBaseToggle(base.code)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedBases.includes(base.code)
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium">{base.name}</div>
              <div className="text-sm text-gray-600">{base.state}</div>
              <div className="text-sm font-medium">BAH: ${base.bah.toLocaleString()}</div>
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          <Button
            onClick={analyzeBases}
            disabled={selectedBases.length < 2 || loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Icon name="Loader" className="animate-spin h-4 w-4" />
                Analyzing...
              </>
            ) : (
              <>
                <Icon name="BarChart" className="h-4 w-4" />
                Analyze Bases
              </>
            )}
          </Button>
          <span className="text-sm text-gray-600">
            {selectedBases.length} base{selectedBases.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      </AnimatedCard>

      {/* Analysis Results */}
      {analysisData.length > 0 && (
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Comparison name"
                value={comparisonName}
                onChange={(value) => setComparisonName(value)}
                className="w-48"
              />
              <Button onClick={saveComparison} size="sm">
                <Icon name="Save" className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analysisData.map((base) => (
              <Card key={base.code} className="relative">
                <CardHeader>
                  <CardTitle className="text-base">{base.name}</CardTitle>
                  <CardDescription>{base.state}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">BAH:</span>
                    <span className={`font-medium ${getBahColor(base.bah)}`}>
                      ${base.bah.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cost of Living:</span>
                    <span className={`font-medium ${getColColor(base.colIndex)}`}>
                      {base.colIndex}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Schools:</span>
                    <span className={`font-medium ${getSchoolColor(base.schoolRating)}`}>
                      {base.schoolRating}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">PCS Cost:</span>
                    <span className="font-medium text-gray-900">
                      ${base.pcsCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Distance:</span>
                    <span className="font-medium text-gray-900">
                      {base.distance.toLocaleString()} mi
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AnimatedCard>
      )}

      {/* Saved Comparisons */}
      {comparisons.length > 0 && (
        <AnimatedCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Comparisons</h2>
          <div className="space-y-3">
            {comparisons.map((comparison) => (
              <Card key={comparison.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{comparison.name}</h3>
                    <p className="text-sm text-gray-600">
                      {comparison.bases.length} bases • {new Date(comparison.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Icon name="Eye" className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteComparison(comparison.id)}
                    >
                      <Icon name="Trash2" className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}

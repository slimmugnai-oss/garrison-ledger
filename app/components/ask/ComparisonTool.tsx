"use client";

/**
 * COMPARISON TOOL UI FOR ASK MILITARY EXPERT
 *
 * Allows users to compare:
 * - Military bases (facilities, housing, schools, weather)
 * - Benefits (BRS vs. High-3, SGLI vs. civilian insurance)
 * - Career paths (enlisted vs. officer, active vs. reserves)
 */

import { Scale, Plus, X } from "lucide-react";
import { useState } from "react";

type ComparisonType = "bases" | "benefits" | "careers";

interface ComparisonOption {
  id: string;
  name: string;
  type: ComparisonType;
}

interface ComparisonData {
  [key: string]: string | number | boolean;
}

interface ComparisonToolProps {
  type: ComparisonType;
  options: ComparisonOption[];
  onCompare?: (selectedIds: string[]) => Promise<ComparisonData[]>;
}

export default function ComparisonTool({ type, options, onCompare }: ComparisonToolProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ComparisonData[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (optionId: string) => {
    if (selectedItems.includes(optionId)) {
      setSelectedItems(selectedItems.filter((id) => id !== optionId));
    } else if (selectedItems.length < 3) {
      setSelectedItems([...selectedItems, optionId]);
    }
  };

  const handleCompare = async () => {
    if (selectedItems.length < 2 || !onCompare) return;

    setLoading(true);
    try {
      const results = await onCompare(selectedItems);
      setComparisonResults(results);
    } catch (error) {
      console.error("Comparison failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedItems([]);
    setComparisonResults(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Scale className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Compare {type === "bases" ? "Military Bases" : type === "benefits" ? "Benefits" : "Career Paths"}
            </h3>
            <p className="text-sm text-slate-600">
              Select 2-3 {type} to compare side-by-side
            </p>
          </div>
        </div>
        {selectedItems.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((option) => {
          const isSelected = selectedItems.includes(option.id);
          const canSelect = selectedItems.length < 3 || isSelected;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={!canSelect}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : canSelect
                  ? "border-slate-200 hover:border-blue-300 bg-white"
                  : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">{option.name}</span>
                {isSelected ? (
                  <div className="flex items-center justify-center h-6 w-6 bg-blue-600 rounded-full">
                    <span className="text-white text-xs font-bold">
                      {selectedItems.indexOf(option.id) + 1}
                    </span>
                  </div>
                ) : canSelect ? (
                  <Plus className="h-5 w-5 text-slate-400" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Items Summary */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-sm font-medium text-slate-700">Selected:</span>
          <div className="flex flex-wrap gap-2 flex-1">
            {selectedItems.map((id) => {
              const option = options.find((opt) => opt.id === id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {option?.name}
                  <button
                    onClick={() => handleSelect(id)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
          {selectedItems.length >= 2 && (
            <button
              onClick={handleCompare}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Comparing..." : "Compare"}
            </button>
          )}
        </div>
      )}

      {/* Comparison Results Table */}
      {comparisonResults && comparisonResults.length > 0 && (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700 sticky left-0 bg-slate-50">
                    Feature
                  </th>
                  {selectedItems.map((id) => {
                    const option = options.find((opt) => opt.id === id);
                    return (
                      <th key={id} className="text-left p-4 font-semibold text-slate-700 min-w-[200px]">
                        {option?.name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Object.keys(comparisonResults[0] || {}).map((feature) => (
                  <tr key={feature} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700 sticky left-0 bg-white">
                      {formatFeatureName(feature)}
                    </td>
                    {comparisonResults.map((result, index) => (
                      <td key={index} className="p-4 text-slate-600">
                        {formatValue(result[feature])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFeatureName(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatValue(value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "✅ Yes" : "❌ No";
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return String(value);
}


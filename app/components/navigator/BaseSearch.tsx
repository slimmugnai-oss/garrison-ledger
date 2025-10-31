/**
 * BASE SEARCH COMPONENT
 * 
 * Clean, sophisticated search interface for Base Navigator
 * Uses BaseAutocomplete for consistent UX with profile editor
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import BaseAutocomplete from "@/app/components/ui/BaseAutocomplete";
import Icon from "@/app/components/ui/Icon";
import { getBaseCodeFromName } from "@/lib/data/base-code-map";

export default function BaseSearch() {
  const router = useRouter();
  const [selectedBase, setSelectedBase] = useState("");
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle base selection from autocomplete
   * Navigate to base analysis page
   */
  const handleBaseSelection = (baseName: string) => {
    setError(null);

    // Get base code and info
    const baseInfo = getBaseCodeFromName(baseName);

    if (!baseInfo) {
      setError("Base not found. Please try another search.");
      console.error(`[BASE_SEARCH] Could not find code for: ${baseName}`);
      return;
    }

    console.log(`[BASE_SEARCH] Navigating to: /dashboard/navigator/${baseInfo.code}`);
    console.log(`[BASE_SEARCH] Base info:`, baseInfo);

    // Navigate to base page
    router.push(`/dashboard/navigator/${baseInfo.code}`);
  };

  /**
   * Handle popular base quick selection
   */
  const handlePopularBase = (baseName: string) => {
    setSelectedBase(baseName);
    handleBaseSelection(baseName);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Search Section */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-12 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Icon name="MapPin" className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-slate-900">Select Your Base</h2>
          </div>
          <p className="text-lg text-slate-600">
            Search from 32 active duty installations across the United States
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Base Name or Location
          </label>
          <BaseAutocomplete
            value={selectedBase}
            onChange={setSelectedBase}
            onSelect={handleBaseSelection}
            placeholder="Type base name (e.g., Shaw AFB, Fort Liberty, Camp Pendleton)..."
            className="w-full rounded-xl border-2 border-slate-300 px-5 py-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <Icon name="AlertCircle" className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Popular Bases */}
        <div>
          <div className="mb-4 text-sm font-semibold text-slate-600">Popular Bases:</div>
          <div className="flex flex-wrap gap-2">
            {[
              "Fort Liberty, NC",
              "Fort Campbell, TN",
              "JBLM, WA",
              "Naval Station Norfolk, VA",
              "Fort Cavazos, TX",
              "Fort Carson, CO",
            ].map((baseName) => (
              <button
                key={baseName}
                onClick={() => handlePopularBase(baseName)}
                className="rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                {baseName.split(",")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 rounded-lg bg-slate-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="Info" className="h-5 w-5 text-slate-600" />
            <div className="font-semibold text-slate-900">How It Works</div>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-blue-600">1.</span>
              <span>Search for your base using the autocomplete</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-blue-600">2.</span>
              <span>We'll analyze the top 3 neighborhoods based on your BAH</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-blue-600">3.</span>
              <span>Review comprehensive intelligence on schools, housing, commute, weather, and amenities</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}


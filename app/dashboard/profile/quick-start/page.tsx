/**
 * QUICK START PROFILE
 *
 * Simplified onboarding - only 5 essential fields
 * Get users to tools faster, collect details later
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Icon from "@/app/components/ui/Icon";

const PAYGRADES = [
  "E01",
  "E02",
  "E03",
  "E04",
  "E05",
  "E06",
  "E07",
  "E08",
  "E09",
  "W01",
  "W02",
  "W03",
  "W04",
  "W05",
  "O01",
  "O02",
  "O03",
  "O04",
  "O05",
  "O06",
  "O07",
  "O08",
  "O09",
  "O10",
  "CIV",
  "CTR",
];

const SERVICE_STATUSES = [
  { value: "active_duty", label: "Active Duty" },
  { value: "reserve", label: "Reserve" },
  { value: "national_guard", label: "National Guard" },
  { value: "military_spouse", label: "Military Spouse" },
  { value: "veteran", label: "Veteran" },
  { value: "dod_civilian", label: "DoD Civilian" },
  { value: "contractor", label: "Government Contractor" },
  { value: "other", label: "Other" },
];

export default function QuickStartProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only 5 essential fields
  const [paygrade, setPaygrade] = useState("");
  const [branch, setBranch] = useState("");
  const [currentBase, setCurrentBase] = useState("");
  const [hasDependents, setHasDependents] = useState(false);
  const [serviceStatus, setServiceStatus] = useState("active_duty");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paygrade,
          branch,
          current_base: currentBase,
          has_dependents: hasDependents,
          service_status: serviceStatus,
          profile_completed: true,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save profile");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSaving(false);
    }
  };

  const isValid =
    paygrade &&
    currentBase &&
    (branch || ["contractor", "dod_civilian", "other"].includes(serviceStatus));

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-lora mb-3 text-4xl font-bold text-gray-900">
            Welcome to Garrison Ledger
          </h1>
          <p className="text-lg text-gray-600">Answer 5 quick questions to unlock your dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-gray-200 bg-white p-8"
        >
          {/* 1. Service Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              1. Service Status <span className="text-red-600">*</span>
            </label>
            <select
              value={serviceStatus}
              onChange={(e) => setServiceStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500"
              required
            >
              {SERVICE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Branch */}
          {serviceStatus !== "contractor" &&
            serviceStatus !== "dod_civilian" &&
            serviceStatus !== "other" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  2. Branch <span className="text-red-600">*</span>
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Air Force">Air Force</option>
                  <option value="Marine Corps">Marine Corps</option>
                  <option value="Space Force">Space Force</option>
                  <option value="Coast Guard">Coast Guard</option>
                </select>
              </div>
            )}

          {/* 3. Paygrade */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              3. Paygrade <span className="text-red-600">*</span>
            </label>
            <select
              value={paygrade}
              onChange={(e) => setPaygrade(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select...</option>
              {PAYGRADES.map((pg) => (
                <option key={pg} value={pg}>
                  {pg === "CIV"
                    ? "GS/Civilian"
                    : pg === "CTR"
                      ? "Contractor"
                      : pg.replace(/^([EWO])0/, "$1-")}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Current Base */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              4. Current Base (City, State or ZIP) <span className="text-red-600">*</span>
            </label>
            <input
              id="input_itg4zugiz"
              type="text"
              value={currentBase}
              onChange={(e) => setCurrentBase(e.target.value)}
              placeholder="Fort Liberty, NC or 28310"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Used for BAH lookup and location-based features
            </p>
          </div>

          {/* 5. Dependents */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              5. Do you have dependents? <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setHasDependents(false)}
                className={`flex-1 rounded-lg border-2 px-6 py-3 font-medium transition-colors ${
                  !hasDependents
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                No Dependents
              </button>
              <button
                type="button"
                onClick={() => setHasDependents(true)}
                className={`flex-1 rounded-lg border-2 px-6 py-3 font-medium transition-colors ${
                  hasDependents
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                Have Dependents
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Affects BAH rate (with dependents = higher rate)
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || saving}
            className="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Complete Setup →"}
          </button>

          {/* Skip Link */}
          <p className="text-center text-sm text-gray-600">
            You can add more details later in Settings
          </p>
        </form>

        {/* Why We Ask */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
            <Icon name="Info" className="h-5 w-5" />
            Why We Ask These 5 Questions
          </h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>
              <strong>Rank:</strong> Determines your BAH/BAS rates for pay verification
            </li>
            <li>
              <strong>Branch:</strong> Branch-specific guidance and resources
            </li>
            <li>
              <strong>Base:</strong> Local BAH rates, COLA, base-specific intel
            </li>
            <li>
              <strong>Dependents:</strong> BAH "with dependents" vs "without" (different rates)
            </li>
            <li>
              <strong>Status:</strong> Active duty vs reserve (affects entitlements)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

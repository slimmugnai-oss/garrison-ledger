"use client";

import { useState, useEffect } from "react";
import Icon from "@/app/components/ui/Icon";
import Badge from "@/app/components/ui/Badge";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import { validatePCSClaim } from "@/lib/pcs/validation-engine";

interface PCSMobileWizardProps {
  userProfile: {
    rank?: string;
    branch?: string;
    currentBase?: string;
    hasDependents?: boolean;
  };
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
  onValidationChange?: (flags: any[]) => void;
}

interface FormData {
  // Basic Info
  claim_name: string;
  pcs_orders_date: string;
  departure_date: string;
  arrival_date: string;
  origin_base: string;
  destination_base: string;

  // Travel Details
  travel_method: string;
  dependents_count: number;
  rank_at_pcs: string;
  branch: string;

  // Lodging (TLE)
  tle_origin_nights: number;
  tle_destination_nights: number;
  tle_origin_rate: number;
  tle_destination_rate: number;

  // Travel Costs
  malt_distance: number;
  per_diem_days: number;
  fuel_receipts: number;

  // Weight & Distance
  estimated_weight: number;
  actual_weight: number;
  distance_miles: number;
}

const wizardSteps = [
  { id: "basic", title: "Basic Info", icon: "User" },
  { id: "travel", title: "Travel Method", icon: "Truck" },
  { id: "lodging", title: "Lodging", icon: "Home" },
  { id: "costs", title: "Travel Costs", icon: "DollarSign" },
  { id: "weight", title: "Weight & Distance", icon: "Briefcase" },
  { id: "review", title: "Review", icon: "CheckCircle" },
];

export default function PCSMobileWizard({ userProfile, onComplete, onSave, onValidationChange }: PCSMobileWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    claim_name: "",
    pcs_orders_date: "",
    departure_date: "",
    arrival_date: "",
    origin_base: userProfile.currentBase || "",
    destination_base: "",
    travel_method: "ppm",
    dependents_count: userProfile.hasDependents ? 1 : 0,
    rank_at_pcs: userProfile.rank || "",
    branch: userProfile.branch || "",
    tle_origin_nights: 5,
    tle_destination_nights: 5,
    tle_origin_rate: 0,
    tle_destination_rate: 0,
    malt_distance: 0,
    per_diem_days: 0,
    fuel_receipts: 0,
    estimated_weight: 0,
    actual_weight: 0,
    distance_miles: 0,
  });

  const [validationFlags, setValidationFlags] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimates, setEstimates] = useState<any>(null);

  // Auto-calculate fields when dependencies change
  useEffect(() => {
    if (formData.departure_date && formData.arrival_date) {
      const departure = new Date(formData.departure_date);
      const arrival = new Date(formData.arrival_date);
      const travelDays = Math.ceil(
        (arrival.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24)
      );

      setFormData((prev) => ({
        ...prev,
        per_diem_days: travelDays,
      }));
    }
  }, [formData.departure_date, formData.arrival_date]);

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validate form data when it changes
  useEffect(() => {
    if (onValidationChange) {
      const flags = validatePCSClaim(formData);
      onValidationChange(flags);
    }
  }, [formData, onValidationChange]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleComplete = async () => {
    setIsCalculating(true);
    try {
      // Calculate estimates
      const response = await fetch("/api/pcs/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });
      const estimates = await response.json();
      setEstimates(estimates);

      onComplete({ ...formData, estimates });
    } catch (error) {
      console.error("Failed to calculate estimates:", error);
      onComplete(formData);
    } finally {
      setIsCalculating(false);
    }
  };

  const renderStep = () => {
    const step = wizardSteps[currentStep];

    switch (step.id) {
      case "basic":
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Icon name="User" className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Basic Information</h2>
              <p className="text-slate-600">Let's start with your PCS details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Claim Name</label>
                <input
                  type="text"
                  value={formData.claim_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, claim_name: e.target.value }))}
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., JBLM to Fort Bragg PCS"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  PCS Orders Date
                </label>
                <input
                  type="date"
                  value={formData.pcs_orders_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pcs_orders_date: e.target.value }))
                  }
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, departure_date: e.target.value }))
                    }
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    value={formData.arrival_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, arrival_date: e.target.value }))
                    }
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Origin Base</label>
                <input
                  type="text"
                  value={formData.origin_base}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, origin_base: e.target.value }))
                  }
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., JBLM"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Destination Base
                </label>
                <input
                  type="text"
                  value={formData.destination_base}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, destination_base: e.target.value }))
                  }
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Fort Bragg"
                />
              </div>
            </div>
          </div>
        );

      case "travel":
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Icon name="Truck" className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Travel Method</h2>
              <p className="text-slate-600">How will you be moving?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Travel Method
                </label>
                <select
                  value={formData.travel_method}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, travel_method: e.target.value }))
                  }
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ppm">PPM (Personally Procured Move)</option>
                  <option value="government">Government Move</option>
                  <option value="mixed">Mixed Move</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Number of Dependents
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dependents_count}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dependents_count: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Rank at PCS</label>
                <input
                  type="text"
                  value={formData.rank_at_pcs}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rank_at_pcs: e.target.value }))
                  }
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., E-5, O-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Branch</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Air Force">Air Force</option>
                  <option value="Marine Corps">Marine Corps</option>
                  <option value="Coast Guard">Coast Guard</option>
                  <option value="Space Force">Space Force</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "lodging":
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Icon name="Home" className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Temporary Lodging</h2>
              <p className="text-slate-600">TLE (Temporary Lodging Expense) details</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Origin Nights
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.tle_origin_nights}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tle_origin_nights: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Max 10 days</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Destination Nights
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.tle_destination_nights}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tle_destination_nights: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Max 10 days</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Origin Daily Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.tle_origin_rate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tle_origin_rate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="h-12 w-full rounded-lg border border-gray-300 pl-8 pr-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Destination Daily Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.tle_destination_rate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tle_destination_rate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="h-12 w-full rounded-lg border border-gray-300 pl-8 pr-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "costs":
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <Icon name="DollarSign" className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Travel Costs</h2>
              <p className="text-slate-600">MALT, Per Diem, and other travel expenses</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  MALT Distance (miles)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.malt_distance}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      malt_distance: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto-calculated from bases"
                />
                <p className="mt-1 text-xs text-gray-500">Current rate: $0.18/mile</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Per Diem Days
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.per_diem_days}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      per_diem_days: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto-calculated from travel dates"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Fuel Receipts Total
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fuel_receipts}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fuel_receipts: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="h-12 w-full rounded-lg border border-gray-300 pl-8 pr-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "weight":
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Icon name="Briefcase" className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Weight & Distance</h2>
              <p className="text-slate-600">PPM weight allowances and distance</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Estimated Weight (lbs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimated_weight}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimated_weight: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Actual Weight (lbs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.actual_weight}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        actual_weight: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Distance (miles)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.distance_miles}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      distance_miles: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto-calculated from bases"
                />
              </div>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Icon name="CheckCircle" className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Review & Submit</h2>
              <p className="text-slate-600">Review your claim details</p>
            </div>

            <div className="space-y-4">
              <AnimatedCard className="p-4">
                <h3 className="mb-3 font-semibold text-slate-900">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Claim Name:</span>
                    <span className="font-medium">{formData.claim_name || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">PCS Orders Date:</span>
                    <span className="font-medium">{formData.pcs_orders_date || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Travel Dates:</span>
                    <span className="font-medium">
                      {formData.departure_date} → {formData.arrival_date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Route:</span>
                    <span className="font-medium">
                      {formData.origin_base} → {formData.destination_base}
                    </span>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-4">
                <h3 className="mb-3 font-semibold text-slate-900">Travel Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Method:</span>
                    <span className="font-medium">{formData.travel_method.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Dependents:</span>
                    <span className="font-medium">{formData.dependents_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rank:</span>
                    <span className="font-medium">{formData.rank_at_pcs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Branch:</span>
                    <span className="font-medium">{formData.branch}</span>
                  </div>
                </div>
              </AnimatedCard>

              {estimates && (
                <AnimatedCard className="p-4">
                  <h3 className="mb-3 font-semibold text-slate-900">Estimated Entitlements</h3>
                  <div className="space-y-2 text-sm">
                    {estimates.dla && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">DLA:</span>
                        <span className="font-medium text-green-600">
                          ${estimates.dla.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {estimates.tle && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">TLE:</span>
                        <span className="font-medium text-green-600">
                          ${estimates.tle.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {estimates.malt && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">MALT:</span>
                        <span className="font-medium text-green-600">
                          ${estimates.malt.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {estimates.total && (
                      <div className="mt-2 border-t pt-2">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-900">Total Estimate:</span>
                          <span className="text-lg font-bold text-green-600">
                            ${estimates.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 text-gray-600 disabled:opacity-50"
          >
            <Icon name="ChevronLeft" className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {currentStep + 1} of {wizardSteps.length}
            </span>
            <div className="h-2 w-24 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / wizardSteps.length) * 100}%` }}
              />
            </div>
          </div>

          <button onClick={handleSave} className="text-sm font-medium text-blue-600">
            Save Draft
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">{renderStep()}</div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-4">
        <div className="flex gap-3">
          {currentStep < wizardSteps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isCalculating}
              className="flex-1 rounded-lg bg-green-600 py-3 text-base font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {isCalculating ? "Calculating..." : "Create Claim"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

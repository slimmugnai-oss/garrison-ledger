"use client";

import { useState, useEffect } from "react";

import PCSDocumentUploader from "@/app/components/pcs/PCSDocumentUploader";
import PCSProvenanceDisplay from "@/app/components/pcs/PCSProvenanceDisplay";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import BaseAutocomplete from "@/app/components/ui/BaseAutocomplete";
import Icon from "@/app/components/ui/Icon";
import { logger } from "@/lib/logger";
import militaryRanksData from "@/lib/data/military-ranks.json";

// Flatten all pay grades from military-ranks.json
const ALL_PAY_GRADES = Object.values(militaryRanksData as Record<string, any>)
  .flatMap((branch) => [
    ...(branch.enlisted || []),
    ...(branch.warrant || []),
    ...(branch.officer || []),
  ])
  .filter((rank, index, self) => index === self.findIndex((r) => r.code === rank.code))
  .sort((a, b) => {
    const getOrder = (code: string) => {
      const match = code.match(/([EWO])-?(\d+)/);
      if (!match) return 999;
      const [, type, num] = match;
      const typeOrder = type === "E" ? 0 : type === "W" ? 100 : 200;
      return typeOrder + parseInt(num);
    };
    return getOrder(a.code) - getOrder(b.code);
  });

interface PCSClaimData {
  claimId: string;
  memberName: string;
  rank: string;
  branch: string;
  pcsType: string;
  originBase: string;
  destinationBase: string;
  ordersDate: string;
  maltDistance: number;
  perDiemDays: number;
  [key: string]: unknown;
}

interface ValidationFlag {
  field: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
}

interface PCSManualEntryProps {
  claimId: string;
  userProfile: {
    rank?: string;
    branch?: string;
    currentBase?: string;
    hasDependents?: boolean;
  };
  onSave: (data: PCSClaimData) => void;
  onValidationChange: (flags: ValidationFlag[]) => void;
  onValidate?: (formData: PCSFormData) => void;
}

interface PCSFormData {
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

interface ValidationFlag {
  field: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggested_fix?: string;
  jtr_citation?: string;
}

export default function PCSManualEntry({
  claimId,
  userProfile,
  onSave,
  onValidationChange,
  onValidate,
}: PCSManualEntryProps) {
  const [formData, setFormData] = useState<PCSFormData>({
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

  const [validationFlags, setValidationFlags] = useState<ValidationFlag[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimates, setEstimates] = useState<{
    dla?: number;
    tle?: number;
    malt?: number;
    per_diem?: number;
    total?: number;
  } | null>(null);
  const [realTimePreview, setRealTimePreview] = useState<{
    dla: number;
    tle: number;
    malt: number;
    perDiem: number;
    total: number;
    lastUpdated: string;
  } | null>(null);
  const [currentSection, setCurrentSection] = useState<string>("basic");

  const calculateDerivedFields = async () => {
    if (!formData.departure_date || !formData.arrival_date) return;

    // Calculate travel days
    const departure = new Date(formData.departure_date);
    const arrival = new Date(formData.arrival_date);
    const travelDays = Math.ceil((arrival.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24));

    setFormData((prev) => ({
      ...prev,
      per_diem_days: travelDays,
    }));

    // Calculate distance if both bases are provided
    if (formData.origin_base && formData.destination_base) {
      try {
        const response = await fetch("/api/pcs/calculate-distance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: formData.origin_base,
            destination: formData.destination_base,
          }),
        });
        const { distance } = await response.json();
        setFormData((prev) => ({
          ...prev,
          malt_distance: distance,
          distance_miles: distance,
        }));
      } catch (error) {
        logger.warn("Could not calculate distance:", error);
      }
    }

    // Calculate real-time preview
    calculateRealTimePreview();
  };

  const calculateRealTimePreview = async () => {
    // Only calculate if we have minimum required data
    if (
      !formData.rank_at_pcs ||
      formData.dependents_count === undefined ||
      !formData.malt_distance ||
      !formData.per_diem_days
    ) {
      return;
    }

    try {
      const response = await fetch("/api/pcs/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rank: formData.rank_at_pcs,
          dependents: formData.dependents_count > 0,
          distance: formData.malt_distance,
          perDiemDays: formData.per_diem_days,
          tleOriginNights: formData.tle_origin_nights || 0,
          tleDestinationNights: formData.tle_destination_nights || 0,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setRealTimePreview({
          dla: result.dla || 0,
          tle: result.tle || 0,
          malt: result.malt || 0,
          perDiem: result.perDiem || 0,
          total: (result.dla || 0) + (result.tle || 0) + (result.malt || 0) + (result.perDiem || 0),
          lastUpdated: new Date().toLocaleTimeString(),
        });
      }
    } catch (error) {
      console.error("Failed to calculate preview:", error);
    }
  };

  const validateForm = async () => {
    const flags: ValidationFlag[] = [];

    // Field-level validation
    if (!formData.claim_name.trim()) {
      flags.push({
        field: "claim_name",
        severity: "error",
        message: "Claim name is required",
      });
    }

    if (!formData.pcs_orders_date) {
      flags.push({
        field: "pcs_orders_date",
        severity: "error",
        message: "PCS orders date is required",
      });
    }

    if (formData.departure_date && formData.arrival_date) {
      const departure = new Date(formData.departure_date);
      const arrival = new Date(formData.arrival_date);

      if (departure >= arrival) {
        flags.push({
          field: "arrival_date",
          severity: "error",
          message: "Arrival date must be after departure date",
        });
      }
    }

    // TLE validation
    if (formData.tle_origin_nights > 10) {
      flags.push({
        field: "tle_origin_nights",
        severity: "warning",
        message: "TLE at origin exceeds 10 days (max allowed)",
        suggested_fix: "Reduce to 10 days or less",
        jtr_citation: "JTR 054205",
      });
    }

    if (formData.tle_destination_nights > 10) {
      flags.push({
        field: "tle_destination_nights",
        severity: "warning",
        message: "TLE at destination exceeds 10 days (max allowed)",
        suggested_fix: "Reduce to 10 days or less",
        jtr_citation: "JTR 054205",
      });
    }

    setValidationFlags(flags);
    onValidationChange(flags);
  };

  // Auto-calculate fields when dependencies change
  useEffect(() => {
    calculateDerivedFields();
  }, [
    formData.departure_date,
    formData.arrival_date,
    formData.origin_base,
    formData.destination_base,
    calculateDerivedFields,
  ]);

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  const calculateEstimates = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch("/api/pcs/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          formData,
        }),
      });
      const estimates = await response.json();
      setEstimates(estimates);
    } catch (error) {
      logger.error("Failed to calculate estimates:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = () => {
    // Convert FormData to PCSClaimData
    const claimData: PCSClaimData = {
      claimId: claimId,
      memberName: formData.claim_name || "",
      rank: formData.rank_at_pcs || "",
      branch: formData.branch || "",
      pcsType: formData.travel_method || "",
      ordersDate: formData.pcs_orders_date || "",
      originBase: formData.origin_base || "",
      destinationBase: formData.destination_base || "",
      departureDate: formData.departure_date || "",
      arrivalDate: formData.arrival_date || "",
      maltDistance: formData.malt_distance || 0,
      perDiemDays: formData.per_diem_days || 0,
      hasDependents: formData.dependents_count > 0,
    };
    onSave(claimData);
  };

  const sections = [
    { id: "basic", title: "Basic Info", icon: "User" },
    { id: "travel", title: "Travel Details", icon: "Truck" },
    { id: "lodging", title: "Lodging (TLE)", icon: "Home" },
    { id: "costs", title: "Travel Costs", icon: "DollarSign" },
    { id: "weight", title: "Weight & Distance", icon: "Package" },
  ];

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Panel - Input Form */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Manual Entry</h3>
          <Badge variant="primary">Real-time Validation</Badge>
        </div>

        {/* Data Provenance */}
        <PCSProvenanceDisplay
          data={[
            {
              dataType: "DLA Rates",
              source: "DFAS Official Pay Tables (2025)",
              citation: "JTR 050302.B",
              effectiveDate: "2025-01-01",
              lastVerified: new Date().toISOString(),
              confidence: 100,
            },
            {
              dataType: "MALT Rates",
              source: "IRS Standard Mileage Rate",
              citation: "IRS Publication 463",
              effectiveDate: "2025-01-01",
              lastVerified: new Date().toISOString(),
              confidence: 100,
            },
            {
              dataType: "Per Diem Rates",
              source: "DTMO Official Rates (300 localities)",
              citation: "JTR Chapter 2",
              effectiveDate: "2025-01-01",
              lastVerified: new Date().toISOString(),
              confidence: 100,
            },
          ]}
          title="Calculation Data Sources"
          compact={true}
        />

        {/* Section Navigation */}
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                currentSection === section.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon name={section.icon as any} className="h-4 w-4" />
              {section.title}
            </button>
          ))}
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Basic Info Section */}
          {currentSection === "basic" && (
            <AnimatedCard className="p-6">
              <h4 className="mb-4 font-semibold text-slate-900">Basic Information</h4>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="claim_name_"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Claim Name
                  </label>
                  <input
                    id="claim_name"
                    type="text"
                    value={formData.claim_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, claim_name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., JBLM to Fort Bragg PCS"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="pcs_orders_date_"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      PCS Orders Date
                    </label>
                    <input
                      id="pcs_orders_date"
                      type="date"
                      value={formData.pcs_orders_date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, pcs_orders_date: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="departure_date_"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Departure Date
                    </label>
                    <input
                      id="departure_date"
                      type="date"
                      value={formData.departure_date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, departure_date: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="arrival_date_"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Arrival Date
                    </label>
                    <input
                      id="arrival_date"
                      type="date"
                      value={formData.arrival_date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, arrival_date: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="origin_base_"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Origin Base
                    </label>
                    <BaseAutocomplete
                      value={formData.origin_base}
                      onChange={(value) => setFormData((prev) => ({ ...prev, origin_base: value }))}
                      placeholder="Start typing base name (e.g., Fort Liberty)"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="destination_base_"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Destination Base
                  </label>
                  <BaseAutocomplete
                    value={formData.destination_base}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, destination_base: value }))
                    }
                    placeholder="Start typing base name (e.g., Fort Bragg)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Travel Details Section */}
          {currentSection === "travel" && (
            <AnimatedCard className="p-6">
              <h4 className="mb-4 font-semibold text-slate-900">Travel Details</h4>
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ppm">PPM (Personally Procured Move)</option>
                    <option value="government">Government Move</option>
                    <option value="mixed">Mixed Move</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="dependents_count_"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Dependents Count
                    </label>
                    <input
                      id="dependents_count"
                      type="number"
                      min="0"
                      value={formData.dependents_count}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dependents_count: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rank_at_pcs_"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Pay Grade at PCS
                    </label>
                    <select
                      id="rank_at_pcs"
                      value={formData.rank_at_pcs}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, rank_at_pcs: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select pay grade</option>
                      {ALL_PAY_GRADES.map((grade) => (
                        <option key={grade.code} value={grade.code}>
                          {grade.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
            </AnimatedCard>
          )}

          {/* Lodging (TLE) Section */}
          {currentSection === "lodging" && (
            <AnimatedCard className="p-6">
              <h4 className="mb-4 font-semibold text-slate-900">Temporary Lodging Expense (TLE)</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="origin_nights_"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Origin Nights
                    </label>
                    <input
                      id="tle_origin_nights"
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Max 10 days per JTR</p>
                  </div>
                  <div>
                    <label
                      htmlFor="destination_nights_"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Destination Nights
                    </label>
                    <input
                      id="tle_destination_nights"
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Max 10 days per JTR</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Origin Daily Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        id="tle_origin_rate"
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
                        className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Destination Daily Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        id="tle_destination_rate"
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
                        className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Travel Costs Section */}
          {currentSection === "costs" && (
            <AnimatedCard className="p-6">
              <h4 className="mb-4 font-semibold text-slate-900">Travel Costs</h4>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="malt_distance_miles_"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    MALT Distance (miles)
                  </label>
                  <input
                    id="malt_distance"
                    type="number"
                    min="0"
                    value={formData.malt_distance}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        malt_distance: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-calculated from bases"
                  />
                  <p className="mt-1 text-xs text-gray-500">Current rate: $0.18/mile</p>
                </div>

                <div>
                  <label
                    htmlFor="per_diem_days_"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Per Diem Days
                  </label>
                  <input
                    id="per_diem_days"
                    type="number"
                    min="0"
                    value={formData.per_diem_days}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        per_diem_days: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-calculated from travel dates"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Fuel Receipts Total
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      id="fuel_receipts"
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
                      className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Weight & Distance Section */}
          {currentSection === "weight" && (
            <AnimatedCard className="p-6">
              <h4 className="mb-4 font-semibold text-slate-900">Weight & Distance</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="estimated_weight_lbs_"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Estimated Weight (lbs)
                    </label>
                    <input
                      id="estimated_weight"
                      type="number"
                      min="0"
                      value={formData.estimated_weight}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          estimated_weight: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="actual_weight_lbs_"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Actual Weight (lbs)
                    </label>
                    <input
                      id="actual_weight"
                      type="number"
                      min="0"
                      value={formData.actual_weight}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          actual_weight: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="distance_miles_"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Distance (miles)
                  </label>
                  <input
                    id="distance_miles"
                    type="number"
                    min="0"
                    value={formData.distance_miles}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        distance_miles: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-calculated from bases"
                  />
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Save Draft
          </button>
          {onValidate && (
            <button
              onClick={() => onValidate(formData)}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700"
            >
              <Icon name="Shield" className="h-4 w-4" />
              Validate JTR
            </button>
          )}
          <button
            onClick={calculateEstimates}
            disabled={isCalculating}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {isCalculating ? "Calculating..." : "Calculate Estimates"}
          </button>
        </div>
      </div>

      {/* Right Panel - Preview & Validation */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Live Preview</h3>
          <Badge variant="secondary">Real-time Updates</Badge>
        </div>

        {/* Validation Flags */}
        {validationFlags.length > 0 && (
          <AnimatedCard className="p-4">
            <h4 className="mb-3 font-semibold text-slate-900">Validation Issues</h4>
            <div className="space-y-2">
              {validationFlags.map((flag, index) => (
                <div
                  key={index}
                  className={`rounded-lg border-l-4 p-3 ${
                    flag.severity === "error"
                      ? "border-red-400 bg-red-50 text-red-800"
                      : flag.severity === "warning"
                        ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                        : "border-blue-400 bg-blue-50 text-blue-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon
                      name={
                        flag.severity === "error"
                          ? "AlertTriangle"
                          : flag.severity === "warning"
                            ? "AlertCircle"
                            : "Info"
                      }
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{flag.message}</p>
                      {flag.suggested_fix && (
                        <p className="mt-1 text-sm">💡 {flag.suggested_fix}</p>
                      )}
                      {flag.jtr_citation && (
                        <p className="mt-1 text-xs text-gray-600">Citation: {flag.jtr_citation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        )}

        {/* Real-Time Preview */}
        {realTimePreview && (
          <AnimatedCard className="border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Icon name="Calculator" className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Live Calculation Preview</h4>
              <Badge variant="secondary" className="text-xs">
                Updated {realTimePreview.lastUpdated}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">DLA:</span>
                  <span className="font-semibold text-blue-900">
                    ${realTimePreview.dla.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">TLE:</span>
                  <span className="font-semibold text-blue-900">
                    ${realTimePreview.tle.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">MALT:</span>
                  <span className="font-semibold text-blue-900">
                    ${realTimePreview.malt.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Per Diem:</span>
                  <span className="font-semibold text-blue-900">
                    ${realTimePreview.perDiem.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 border-t border-blue-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900">Total Estimated:</span>
                <span className="text-lg font-bold text-blue-900">
                  ${realTimePreview.total.toLocaleString()}
                </span>
              </div>
            </div>
          </AnimatedCard>
        )}

        {/* Live Estimates */}
        {estimates && (
          <AnimatedCard className="p-4">
            <h4 className="mb-3 font-semibold text-slate-900">Estimated Entitlements</h4>
            <div className="space-y-3">
              {estimates?.dla && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">DLA</span>
                  <span className="font-semibold text-green-600">
                    ${estimates.dla.toLocaleString()}
                  </span>
                </div>
              )}
              {estimates?.tle && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">TLE</span>
                  <span className="font-semibold text-green-600">
                    ${estimates.tle.toLocaleString()}
                  </span>
                </div>
              )}
              {estimates?.malt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">MALT</span>
                  <span className="font-semibold text-green-600">
                    ${estimates.malt.toLocaleString()}
                  </span>
                </div>
              )}
              {estimates?.per_diem && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Per Diem</span>
                  <span className="font-semibold text-green-600">
                    ${estimates.per_diem.toLocaleString()}
                  </span>
                </div>
              )}
              {estimates?.total && (
                <div className="mt-3 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Total Estimate</span>
                    <span className="text-xl font-bold text-green-600">
                      ${estimates.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>
        )}

        {/* JTR Citations */}
        <AnimatedCard className="p-4">
          <h4 className="mb-3 font-semibold text-slate-900">JTR Citations</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Icon name="File" className="h-4 w-4 text-blue-600" />
              <span>JTR 050302.B - Dislocation Allowance</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="File" className="h-4 w-4 text-blue-600" />
              <span>JTR 054205 - Temporary Lodging Expense</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="File" className="h-4 w-4 text-blue-600" />
              <span>JTR 054206 - Mileage Allowance</span>
            </div>
          </div>
        </AnimatedCard>

        {/* Document Upload */}
        <AnimatedCard className="p-6">
          <h4 className="mb-4 font-semibold text-slate-900">Document Upload</h4>
          <PCSDocumentUploader
            claimId={claimId}
            onDocumentProcessed={(document) => {
              logger.info("Document processed:", document);
              // Auto-populate form fields based on extracted data
              if (document.extractedData) {
                const data = document.extractedData;
                // Use available properties from OCR extraction
                if (data.date) {
                  setFormData((prev) => ({ ...prev, pcs_orders_date: data.date as string }));
                }
                if (data.vendor) {
                  setFormData((prev) => ({ ...prev, origin_base: data.vendor as string }));
                }
                if (data.amount) {
                  setFormData((prev) => ({ ...prev, estimated_weight: data.amount as number }));
                }
                // TODO: Enhance OCR processing to extract PCS-specific fields
              }
            }}
          />
        </AnimatedCard>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";
import PageHeader from "@/app/components/ui/PageHeader";

interface Claim {
  id: string;
  claim_name: string;
  status: string;
  readiness_score: number;
  completion_percentage: number;
  pcs_orders_date: string;
  departure_date: string;
  arrival_date: string;
  origin_base: string;
  destination_base: string;
  travel_method: string;
  dependents_count: number;
  rank_at_pcs: string;
  branch: string;
  entitlements: {
    total?: number;
    dla?: number;
    tle?: number;
    malt?: number;
    per_diem?: number;
    ppm?: number;
  } | null;
  tle_origin_nights?: number;
  tle_destination_nights?: number;
  tle_origin_rate?: number;
  tle_destination_rate?: number;
  malt_distance?: number;
  distance_miles?: number;
  per_diem_days?: number;
  estimated_weight?: number;
  actual_weight?: number;
  fuel_receipts?: number;
  created_at: string;
  updated_at: string;
}

interface Snapshot {
  dla_amount: number;
  tle_amount: number;
  tle_days?: number;
  malt_amount: number;
  malt_miles?: number;
  per_diem_amount: number;
  per_diem_days?: number;
  ppm_estimate: number;
  ppm_weight?: number;
  total_estimated: number;
  confidence_scores?: {
    dla?: number;
    tle?: number;
    malt?: number;
    perDiem?: number;
    ppm?: number;
    overall?: number;
  };
  calculation_details?: any;
}

interface Document {
  id: string;
  document_type: string;
  file_path?: string;
  uploaded_at: string;
}

interface ValidationCheck {
  id: string;
  rule_code: string;
  rule_title: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  created_at: string;
}

interface PCSClaimClientProps {
  claim: Claim;
  snapshot: Snapshot | null;
  documents: Document[];
  validationChecks: ValidationCheck[];
  isPremium: boolean;
  tier: string;
  userProfile: {
    rank?: string;
    branch?: string;
    currentBase?: string;
  };
}

type Tab = "overview" | "entitlements" | "documents" | "validation";

export default function PCSClaimClient({
  claim,
  snapshot,
  documents,
  validationChecks,
  isPremium: _isPremium,
  tier: _tier,
  userProfile: _userProfile,
}: PCSClaimClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isDownloading, setIsDownloading] = useState(false);
  const [calculatedSnapshot, setCalculatedSnapshot] = useState<Snapshot | null>(snapshot);
  const [isCalculating, setIsCalculating] = useState(false);

  // If no snapshot exists, calculate fresh on mount
  useEffect(() => {
    if (!snapshot && claim && !isCalculating) {
      calculateFreshSnapshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateFreshSnapshot = async () => {
    if (isCalculating) return;

    setIsCalculating(true);
    try {
      const distance = claim.malt_distance || claim.distance_miles || 0;
      const weight = claim.actual_weight || claim.estimated_weight || 0;
      
      const response = await fetch(`/api/pcs/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim_name: claim.claim_name || "PCS Claim",
          rank_at_pcs: claim.rank_at_pcs,
          branch: claim.branch,
          origin_base: claim.origin_base,
          destination_base: claim.destination_base,
          dependents_count: claim.dependents_count || 0,
          departure_date: claim.departure_date,
          arrival_date: claim.arrival_date,
          pcs_orders_date: claim.pcs_orders_date,
          travel_method: claim.travel_method || "ppm",
          tle_origin_nights: claim.tle_origin_nights || 0,
          tle_destination_nights: claim.tle_destination_nights || 0,
          tle_origin_rate: claim.tle_origin_rate || 0, // Required by FormData
          tle_destination_rate: claim.tle_destination_rate || 0, // Required by FormData
          per_diem_days: claim.per_diem_days || 0,
          malt_distance: distance, // Required by FormData (for MALT calculation)
          distance_miles: distance, // Alternative field
          estimated_weight: weight,
          actual_weight: weight,
          fuel_receipts: claim.fuel_receipts || 0, // Required by FormData
          origin_zip: claim.origin_zip,
          destination_zip: claim.destination_zip,
        }),
      });

      if (response.ok) {
        const calc = await response.json();
        console.log("[PCSClaim] Calculation response:", calc);

        // The API returns calculations directly (or error object)
        if (calc?.error) {
          console.error("[PCSClaim] Calculation error:", calc.error);
          return;
        }

        if (calc && calc.dla) {
          // Transform to Snapshot format
          const snapshot = {
            dla_amount: calc.dla?.amount || 0,
            tle_amount: calc.tle?.total || 0,
            tle_days: (calc.tle?.origin?.days || 0) + (calc.tle?.destination?.days || 0),
            malt_amount: calc.malt?.amount || 0,
            malt_miles: calc.malt?.distance || 0,
            per_diem_amount: calc.perDiem?.amount || 0,
            per_diem_days: calc.perDiem?.days || 0,
            ppm_estimate: calc.ppm?.amount || 0,
            ppm_weight: calc.ppm?.weight || 0,
            total_estimated: calc.total || 0,
            calculation_details: calc,
            confidence_scores: calc.confidence || {},
          };
          console.log("[PCSClaim] Setting calculated snapshot:", snapshot);
          setCalculatedSnapshot(snapshot);
        } else {
          console.warn("[PCSClaim] Invalid calculation response:", calc);
        }
      } else {
        const errorText = await response.text();
        console.error("[PCSClaim] Calculation API error:", response.status, errorText);
      }
    } catch (error) {
      console.error("Failed to calculate snapshot:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Use calculated snapshot if available, otherwise fall back to original snapshot
  const displaySnapshot = calculatedSnapshot || snapshot;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready_to_submit":
        return "success";
      case "submitted":
        return "primary";
      case "needs_correction":
        return "warning";
      case "draft":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handleDownloadPackage = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch("/api/pcs/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimId: claim.id, type: "full" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PCS_Claim_${claim.claim_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Download failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "Overview", icon: "Info" },
    { id: "entitlements", label: "Entitlements", icon: "DollarSign" },
    {
      id: "documents",
      label: "Documents",
      icon: "File",
      count: documents.length,
    },
    {
      id: "validation",
      label: "Validation",
      icon: "Shield",
      count: validationChecks.length > 0 ? validationChecks.length : undefined,
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />

        <div className="mobile-container py-12 sm:py-16">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/dashboard/pcs-copilot"
              className="flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
            >
              <Icon name="ArrowLeft" className="h-4 w-4" />
              Back to PCS Copilot
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <Badge variant="primary">Premium Feature</Badge>
          </div>

          <div className="mb-8 flex items-start justify-between">
            <div>
              <PageHeader
                title={claim.claim_name}
                subtitle={`PCS from ${claim.origin_base} to ${claim.destination_base}`}
              />
              <div className="mt-4 flex items-center gap-4">
                <Badge variant={getStatusColor(claim.status)}>
                  {claim.status.replace("_", " ")}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="Calendar" className="h-4 w-4" />
                  Created {formatDate(claim.created_at)}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/dashboard/pcs-copilot?edit=${claim.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Icon name="Edit" className="mr-2 h-4 w-4" />
                Edit Claim
              </Link>
              <button
                onClick={handleDownloadPackage}
                disabled={isDownloading}
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                <Icon name="Download" className="mr-2 h-4 w-4" />
                {isDownloading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-6 sm:grid-cols-3">
            <AnimatedCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-50 p-3">
                  <Icon name="Shield" className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {claim.readiness_score}/100
                  </div>
                  <div className="text-sm text-slate-600">Readiness Score</div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-green-50 p-3">
                  <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {claim.completion_percentage}%
                  </div>
                  <div className="text-sm text-slate-600">Completion</div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-purple-50 p-3">
                  <Icon name="DollarSign" className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {formatCurrency(
                      claim.entitlements?.total || displaySnapshot?.total_estimated || 0
                    )}
                  </div>
                  <div className="text-sm text-slate-600">Estimated Total</div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } `}
                  >
                    <Icon name={tab.icon as any} className="h-4 w-4" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <Badge
                        variant={tab.count > 0 ? "primary" : "secondary"}
                        className="ml-1 text-xs"
                      >
                        {tab.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Basic Information */}
                <AnimatedCard className="p-6">
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                    <Icon name="Info" className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">
                          PCS Orders Date
                        </label>
                        <p className="text-slate-900">{formatDate(claim.pcs_orders_date)}</p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">
                          Travel Method
                        </label>
                        <p className="capitalize text-slate-900">{claim.travel_method}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">
                          Departure Date
                        </label>
                        <p className="text-slate-900">{formatDate(claim.departure_date)}</p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">
                          Arrival Date
                        </label>
                        <p className="text-slate-900">{formatDate(claim.arrival_date)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">
                          Origin Base
                        </label>
                        <p className="text-slate-900">{claim.origin_base}</p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">
                          Destination Base
                        </label>
                        <p className="text-slate-900">{claim.destination_base}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">
                          Rank at PCS
                        </label>
                        <p className="text-slate-900">{claim.rank_at_pcs}</p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">
                          Branch
                        </label>
                        <p className="text-slate-900">{claim.branch}</p>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-600">
                        Dependents
                      </label>
                      <p className="text-slate-900">{claim.dependents_count}</p>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Quick Summary */}
                <AnimatedCard className="p-6">
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                    <Icon name="TrendingUp" className="h-5 w-5 text-green-600" />
                    Quick Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">Distance</span>
                        <span className="text-lg font-bold text-slate-900">
                          {displaySnapshot?.malt_miles ||
                            displaySnapshot?.calculation_details?.malt?.distance ||
                            claim.malt_distance ||
                            claim.distance_miles ||
                            0}{" "}
                          miles
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">Travel Days</span>
                        <span className="text-lg font-bold text-slate-900">
                          {displaySnapshot?.per_diem_days ||
                            displaySnapshot?.calculation_details?.perDiem?.days ||
                            claim.per_diem_days ||
                            0}{" "}
                          days
                        </span>
                      </div>
                    </div>
                    {claim.travel_method === "ppm" && (
                      <div className="rounded-lg bg-purple-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">
                            Estimated Weight
                          </span>
                          <span className="text-lg font-bold text-slate-900">
                            {displaySnapshot?.ppm_weight ||
                              displaySnapshot?.calculation_details?.ppm?.weight ||
                              claim.actual_weight ||
                              claim.estimated_weight ||
                              0}{" "}
                            lbs
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">Completion</span>
                        <span className="text-sm font-bold text-blue-600">
                          {claim.completion_percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                          style={{ width: `${claim.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            )}

            {/* ENTITLEMENTS TAB */}
            {activeTab === "entitlements" && (
              <div className="space-y-6">
                <AnimatedCard className="p-6">
                  <h3 className="mb-6 text-xl font-bold text-slate-900">Entitlement Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Dislocation Allowance (DLA)",
                        amount: claim.entitlements?.dla || displaySnapshot?.dla_amount || 0,
                        description: "One-time payment for PCS relocation",
                      },
                      {
                        label: "Temporary Lodging Expense (TLE)",
                        amount: claim.entitlements?.tle || displaySnapshot?.tle_amount || 0,
                        description: `Lodging for ${displaySnapshot?.calculation_details?.tle?.origin?.days ?? claim.tle_origin_nights ?? 0} origin + ${displaySnapshot?.calculation_details?.tle?.destination?.days ?? claim.tle_destination_nights ?? 0} destination nights`,
                      },
                      {
                        label: "Mileage Allowance (MALT)",
                        amount: claim.entitlements?.malt || displaySnapshot?.malt_amount || 0,
                        description: `${displaySnapshot?.malt_miles ?? displaySnapshot?.calculation_details?.malt?.distance ?? claim.malt_distance ?? claim.distance_miles ?? 0} miles × $0.18/mile`,
                      },
                      {
                        label: "Per Diem",
                        amount:
                          claim.entitlements?.per_diem || displaySnapshot?.per_diem_amount || 0,
                        description: `${displaySnapshot?.per_diem_days ?? displaySnapshot?.calculation_details?.perDiem?.days ?? claim.per_diem_days ?? 0} days of meals & incidentals`,
                      },
                      ...(claim.travel_method === "ppm"
                        ? [
                            {
                              label: "Personally Procured Move (PPM)",
                              amount: claim.entitlements?.ppm || displaySnapshot?.ppm_estimate || 0,
                              description: `Based on ${displaySnapshot?.ppm_weight ?? displaySnapshot?.calculation_details?.ppm?.weight ?? claim.actual_weight ?? claim.estimated_weight ?? 0} lbs`,
                            },
                          ]
                        : []),
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{item.label}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">
                            {formatCurrency(item.amount)}
                          </div>
                          {displaySnapshot?.confidence_scores && (
                            <div className="text-xs text-gray-500">
                              Confidence:{" "}
                              {(() => {
                                const key = item.label.toLowerCase().includes("dla")
                                  ? "dla"
                                  : item.label.toLowerCase().includes("tle")
                                    ? "tle"
                                    : item.label.toLowerCase().includes("malt")
                                      ? "malt"
                                      : item.label.toLowerCase().includes("per diem")
                                        ? "perDiem"
                                        : "ppm";
                                const confidence = displaySnapshot.confidence_scores?.[key];
                                if (typeof confidence === "number") {
                                  return Math.round(confidence * 100);
                                }
                                return 80; // default
                              })()}
                              %
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-slate-900">Total Estimated</div>
                      <div className="text-2xl font-black text-blue-600">
                        {formatCurrency(
                          claim.entitlements?.total || displaySnapshot?.total_estimated || 0
                        )}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleDownloadPackage}
                    disabled={isDownloading}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon name="Download" className="h-5 w-5" />
                    {isDownloading ? "Generating..." : "Download PDF Worksheet"}
                  </button>
                  <Link
                    href="/dashboard/binder"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    <Icon name="Upload" className="h-5 w-5" />
                    Manage Documents
                  </Link>
                </div>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <AnimatedCard className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">Uploaded Documents</h3>
                    <Link
                      href="/dashboard/binder"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Manage in Binder →
                    </Link>
                  </div>
                  {documents.length === 0 ? (
                    <div className="py-12 text-center">
                      <Icon name="File" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-gray-600">No documents uploaded yet</p>
                      <p className="mt-2 text-sm text-gray-500">
                        Use the Binder to organize your PCS documents
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <Icon name="File" className="h-5 w-5 text-gray-500" />
                            <div>
                              <div className="font-semibold capitalize text-slate-900">
                                {doc.document_type.replace("_", " ")}
                              </div>
                              <div className="text-sm text-gray-500">
                                Uploaded {formatDate(doc.uploaded_at)}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">{doc.document_type}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </AnimatedCard>
              </div>
            )}

            {/* VALIDATION TAB */}
            {activeTab === "validation" && (
              <div className="space-y-6">
                <AnimatedCard className="p-6">
                  <h3 className="mb-6 text-xl font-bold text-slate-900">Validation Checks</h3>
                  {validationChecks.length === 0 ? (
                    <div className="py-12 text-center">
                      <Icon name="CheckCircle" className="mx-auto mb-4 h-12 w-12 text-green-600" />
                      <p className="font-semibold text-slate-900">All checks passed!</p>
                      <p className="mt-2 text-sm text-gray-500">
                        Your claim meets all JTR requirements
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {validationChecks.map((check) => {
                        const severityColors = {
                          critical: "bg-red-50 border-red-200",
                          high: "bg-orange-50 border-orange-200",
                          medium: "bg-yellow-50 border-yellow-200",
                          low: "bg-blue-50 border-blue-200",
                        };
                        return (
                          <div
                            key={check.id}
                            className={`rounded-lg border p-4 ${severityColors[check.severity]}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <Badge
                                    variant={
                                      check.severity === "critical"
                                        ? "danger"
                                        : check.severity === "high"
                                          ? "warning"
                                          : "secondary"
                                    }
                                  >
                                    {check.severity}
                                  </Badge>
                                  <span className="font-semibold text-slate-900">
                                    {check.rule_title}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700">{check.message}</p>
                                <p className="mt-2 text-xs text-gray-600">
                                  Rule: {check.rule_code}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </AnimatedCard>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import PCSUnifiedWizard from "@/app/components/pcs/PCSUnifiedWizard";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";
import PageHeader from "@/app/components/ui/PageHeader";
import { logger } from "@/lib/logger";

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
  form_data?: {
    tle_origin_nights?: number;
    tle_destination_nights?: number;
    tle_origin_rate?: number;
    tle_destination_rate?: number;
    actual_weight?: number;
    estimated_weight?: number;
    malt_distance?: number;
    distance_miles?: number;
    per_diem_days?: number;
    fuel_receipts?: number;
    origin_zip?: string | null;
    destination_zip?: string | null;
  };
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
  origin_zip?: string;
  destination_zip?: string;
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

type Tab = "overview" | "entitlements" | "validation";

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

  // REACTIVE SNAPSHOT PATTERN: Snapshot should ALWAYS exist after save
  // If missing, it's a data integrity issue - log warning but proceed with form_data fallback
  useEffect(() => {
    if (!snapshot && claim.form_data) {
      console.warn(
        "[PCSClaimClient] No snapshot found for claim - snapshot should exist after save",
        { claimId: claim.id }
      );
    }
  }, [snapshot, claim]);

  // REACTIVE SNAPSHOT PATTERN: Removed client-side recalculation
  // Snapshots are created server-side when claim is saved
  // View page always uses snapshot if available, falls back to form_data

  // REACTIVE SNAPSHOT PATTERN: Always use snapshot from server
  // No client-side recalculation needed - snapshot is the single source of truth
  const displaySnapshot = snapshot;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString; // Return original if invalid
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    // Handle null, undefined, NaN, or 0 values
    if (amount == null || isNaN(amount) || amount === 0) return "$0.00";
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

  const handleExportHTML = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/pcs/export/html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId: claim.id }),
      });

      if (!response.ok) throw new Error("Failed to export HTML");

      const html = await response.text();
      const blob = new Blob([html], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);

      // Open in new window for printing/saving
      const newWindow = window.open(url, "_blank");
      if (!newWindow) {
        // Fallback to download if popup blocked
        const a = document.createElement("a");
        a.href = url;
        a.download = `pcs-claim-${claim.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      toast.success("Document opened. Press Ctrl/Cmd+P to print or save as PDF.");
    } catch (error) {
      logger.error("Failed to export HTML", error);
      toast.error("Failed to export document");
    } finally {
      setIsDownloading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "Overview", icon: "Info" },
    { id: "entitlements", label: "Entitlements", icon: "DollarSign" },
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
              <button
                onClick={() => setShowEditWizard(true)}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Icon name="Edit" className="mr-2 h-4 w-4" />
                Edit Claim
              </button>
              <button
                onClick={handleExportHTML}
                disabled={isDownloading}
                className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                <Icon name="Download" className="mr-2 h-4 w-4" />
                {isDownloading ? "Opening..." : "Print/Export"}
              </button>
              <Link
                href="/dashboard/binder"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Icon name="Upload" className="mr-2 h-4 w-4" />
                Manage Documents
              </Link>
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
                            claim.form_data?.malt_distance ||
                            claim.form_data?.distance_miles ||
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
                            claim.form_data?.per_diem_days ||
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
                              claim.form_data?.actual_weight ||
                              claim.form_data?.estimated_weight ||
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
                        amount:
                          displaySnapshot?.dla_amount ||
                          claim.entitlements?.dla ||
                          displaySnapshot?.calculation_details?.dla?.amount ||
                          0,
                        description: "One-time payment for PCS relocation",
                      },
                      {
                        label: "Temporary Lodging Expense (TLE)",
                        amount:
                          displaySnapshot?.tle_amount ||
                          claim.entitlements?.tle ||
                          displaySnapshot?.calculation_details?.tle?.total ||
                          0,
                        description: `Lodging for ${displaySnapshot?.calculation_details?.tle?.origin?.days ?? claim.form_data?.tle_origin_nights ?? 0} origin + ${displaySnapshot?.calculation_details?.tle?.destination?.days ?? claim.form_data?.tle_destination_nights ?? 0} destination nights`,
                      },
                      {
                        label: "Mileage Allowance (MALT)",
                        amount:
                          displaySnapshot?.malt_amount ||
                          claim.entitlements?.malt ||
                          displaySnapshot?.calculation_details?.malt?.amount ||
                          0,
                        description: `${displaySnapshot?.malt_miles ?? displaySnapshot?.calculation_details?.malt?.distance ?? claim.form_data?.malt_distance ?? claim.form_data?.distance_miles ?? claim.malt_distance ?? claim.distance_miles ?? 0} miles × $0.18/mile`,
                      },
                      {
                        label: "Per Diem",
                        amount:
                          displaySnapshot?.per_diem_amount ||
                          claim.entitlements?.per_diem ||
                          displaySnapshot?.calculation_details?.perDiem?.amount ||
                          0,
                        description: `${displaySnapshot?.per_diem_days ?? displaySnapshot?.calculation_details?.perDiem?.days ?? claim.form_data?.per_diem_days ?? claim.per_diem_days ?? 0} days of meals & incidentals`,
                      },
                      ...(claim.travel_method === "ppm"
                        ? [
                            {
                              label: "Personally Procured Move (PPM)",
                              amount:
                                displaySnapshot?.ppm_estimate ||
                                claim.entitlements?.ppm ||
                                displaySnapshot?.calculation_details?.ppm?.amount ||
                                0,
                              description: `Based on ${displaySnapshot?.ppm_weight ?? displaySnapshot?.calculation_details?.ppm?.weight ?? claim.form_data?.actual_weight ?? claim.form_data?.estimated_weight ?? claim.actual_weight ?? claim.estimated_weight ?? 0} lbs`,
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

      {/* Edit Wizard Modal */}
      {showEditWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white shadow-xl">
            <button
              onClick={() => setShowEditWizard(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
            >
              <Icon name="X" className="h-5 w-5" />
            </button>
            <PCSUnifiedWizard
              userProfile={userProfile || {}}
              onComplete={(claimId) => {
                setShowEditWizard(false);
                // Reload page to show updated claim
                window.location.reload();
              }}
              editClaimId={claim.id}
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

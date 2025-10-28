"use client";

import Link from "next/link";
import { useState } from "react";

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
  } | null;
  created_at: string;
  updated_at: string;
}

interface PCSClaimClientProps {
  claim: Claim;
  isPremium: boolean;
  tier: string;
  userProfile: {
    rank?: string;
    branch?: string;
    currentBase?: string;
  };
}

export default function PCSClaimClient({
  claim,
  isPremium: _isPremium,
  tier: _tier,
  userProfile: _userProfile,
}: PCSClaimClientProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      const response = await fetch("/api/pcs/package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId: claim.id,
          includeDocuments: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PCS_Claim_${claim.claim_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Download failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Background gradient */}
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
            <Link
              href={`/dashboard/pcs-copilot?edit=${claim.id}`}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Edit Claim
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-6 sm:grid-cols-3">
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
                    ${claim.entitlements?.total?.toLocaleString() || "0"}
                  </div>
                  <div className="text-sm text-slate-600">Estimated Total</div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Claim Details */}
          <div className="grid gap-8 lg:grid-cols-2">
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
                    <label className="mb-1 block text-sm font-semibold text-gray-600">Branch</label>
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

            {/* Next Steps */}
            <AnimatedCard className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                Next Steps
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
                  <Icon name="Upload" className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <h4 className="mb-1 font-semibold text-slate-900">Upload Documents</h4>
                    <p className="text-sm text-slate-600">
                      Upload your PCS orders, receipts, and weigh tickets
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-4">
                  <Icon
                    name="Calculator"
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600"
                  />
                  <div>
                    <h4 className="mb-1 font-semibold text-slate-900">Calculate Entitlements</h4>
                    <p className="text-sm text-slate-600">
                      AI will calculate DLA, TLE, MALT, and other entitlements
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
                  <Icon
                    name="CheckCircle"
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                  />
                  <div>
                    <h4 className="mb-1 font-semibold text-slate-900">Review & Submit</h4>
                    <p className="text-sm text-slate-600">
                      Review calculations and generate your claim package
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Progress Bar */}
          <AnimatedCard className="mt-8 p-6">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <Icon name="TrendingUp" className="h-5 w-5 text-blue-600" />
              Claim Progress
            </h3>
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Overall Completion</span>
                <span className="text-sm font-bold text-blue-600">
                  {claim.completion_percentage}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${claim.completion_percentage}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {claim.completion_percentage < 25 &&
                "Just getting started! Upload your documents to begin."}
              {claim.completion_percentage >= 25 &&
                claim.completion_percentage < 50 &&
                "Good progress! Keep uploading documents."}
              {claim.completion_percentage >= 50 &&
                claim.completion_percentage < 75 &&
                "Almost there! Review your calculations."}
              {claim.completion_percentage >= 75 &&
                claim.completion_percentage < 100 &&
                "Nearly complete! Final review needed."}
              {claim.completion_percentage === 100 &&
                "Ready to submit! Your claim package is complete."}
            </p>
          </AnimatedCard>

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
            <div className="flex gap-4">
              <Link
                href="/dashboard/binder"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Icon name="Upload" className="h-5 w-5" />
                Manage Documents in Binder
              </Link>
              <button
                onClick={handleDownloadPackage}
                disabled={isDownloading}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="Download" className="h-5 w-5" />
                {isDownloading ? "Generating..." : "Download Package"}
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Use the Binder to organize all PCS-related documents (orders, receipts, weigh tickets). 
              The PCS Copilot is a planning tool that calculates your entitlements.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import PageHeader from "@/app/components/ui/PageHeader";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";

interface Claim {
  id: string;
  claim_name: string;
  status: string;
  readiness_score: number;
  completion_percentage: number;
  entitlements: {
    total?: number;
  } | null;
  created_at: string;
}

interface PCSCopilotClientProps {
  initialClaims: Claim[];
  isPremium: boolean;
  tier: string;
  userProfile: {
    rank?: string;
    branch?: string;
    currentBase?: string;
  };
}

export default function PCSCopilotClient({
  initialClaims,
  isPremium,
  tier: _tier,
  userProfile,
}: PCSCopilotClientProps) {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [_selectedClaim, _setSelectedClaim] = useState<Claim | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    claim_name: "",
    pcs_orders_date: "",
    departure_date: "",
    arrival_date: "",
    origin_base: userProfile.currentBase || "",
    destination_base: "",
    travel_method: "ppm",
    dependents_count: 0,
    rank_at_pcs: userProfile.rank || "",
    branch: userProfile.branch || "",
  });

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch("/api/pcs/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Add new claim to the list
        setClaims((prev) => [result.claim, ...prev]);
        setShowNewClaimModal(false);
        // Reset form
        setFormData({
          claim_name: "",
          pcs_orders_date: "",
          departure_date: "",
          arrival_date: "",
          origin_base: userProfile.currentBase || "",
          destination_base: "",
          travel_method: "ppm",
          dependents_count: 0,
          rank_at_pcs: userProfile.rank || "",
          branch: userProfile.branch || "",
        });
      } else {
        alert("Failed to create claim. Please try again.");
      }
    } catch {
      alert("Failed to create claim. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />

        <div className="mobile-container py-12 sm:py-16">
          {/* Header */}
          <div className="mb-8">
            <Badge variant="primary">Premium Feature</Badge>
          </div>
          <PageHeader
            title="PCS Money Copilot"
            subtitle="AI-powered reimbursement assistant that turns receipts into ready-to-submit claim packages"
          />

          {/* Free User Gate */}
          {!isPremium && (
            <AnimatedCard className="mb-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="p-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Icon name="Lock" className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold text-slate-900">
                  Premium Feature
                </h3>
                <p className="mx-auto mb-6 max-w-2xl text-lg text-slate-700">
                  PCS Money Copilot helps you recover $1,000-$5,000+ per PCS by catching errors,
                  finding missed entitlements, and building compliant claim packages.
                </p>
                <div className="mx-auto mb-6 max-w-xl rounded-xl bg-white p-6">
                  <h4 className="mb-4 font-bold text-slate-900">What You Get:</h4>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <Icon
                        name="CheckCircle"
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                      />
                      <span className="text-sm text-slate-700">
                        AI OCR extracts data from receipts, orders, and weigh tickets
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon
                        name="CheckCircle"
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                      />
                      <span className="text-sm text-slate-700">
                        Automatic entitlement calculation (DLA, TLE, MALT, Per Diem, PPM)
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon
                        name="CheckCircle"
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                      />
                      <span className="text-sm text-slate-700">
                        Error detection (duplicates, date mismatches, missing docs)
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon
                        name="CheckCircle"
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                      />
                      <span className="text-sm text-slate-700">
                        Ready-to-submit package with JTR citations
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard/upgrade"
                  className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-500/50"
                >
                  Upgrade to Premium - $9.99/month
                </Link>
              </div>
            </AnimatedCard>
          )}

          {/* Premium User - Main Interface */}
          {isPremium && (
            <>
              {/* Stats Bar */}
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <AnimatedCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-blue-50 p-3">
                      <Icon name="FolderOpen" className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">{claims.length}</div>
                      <div className="text-sm text-slate-600">Active Claims</div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-green-50 p-3">
                      <Icon name="DollarSign" className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        $
                        {claims
                          .reduce((sum, c) => sum + (c.entitlements?.total || 0), 0)
                          .toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600">Total Estimated</div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-purple-50 p-3">
                      <Icon name="CheckCircle" className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        {claims.filter((c) => c.status === "ready_to_submit").length}
                      </div>
                      <div className="text-sm text-slate-600">Ready to Submit</div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>

              {/* New Claim Button */}
              <div className="mb-8">
                <button
                  onClick={() => setShowNewClaimModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-500/50"
                >
                  <Icon name="Plus" className="h-5 w-5" />
                  Start New PCS Claim
                </button>
              </div>

              {/* Claims List */}
              {claims.length === 0 ? (
                <AnimatedCard className="p-12 text-center">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <Icon name="FolderOpen" className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="mb-3 font-serif text-2xl font-bold text-slate-900">
                    No Claims Yet
                  </h3>
                  <p className="mb-6 text-lg text-slate-600">
                    Start your first PCS claim to get AI-powered assistance with reimbursements
                  </p>
                  <button
                    onClick={() => setShowNewClaimModal(true)}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
                  >
                    Create Your First Claim
                  </button>
                </AnimatedCard>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <AnimatedCard key={claim.id} className="p-6 transition-shadow hover:shadow-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-900">{claim.claim_name}</h3>
                            <Badge
                              variant={
                                claim.status === "ready_to_submit"
                                  ? "success"
                                  : claim.status === "submitted"
                                    ? "primary"
                                    : claim.status === "needs_correction"
                                      ? "warning"
                                      : "secondary"
                              }
                            >
                              {claim.status.replace("_", " ")}
                            </Badge>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-700">
                                Completion
                              </span>
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

                          {/* Readiness Score */}
                          <div className="mb-4 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Icon name="Shield" className="h-4 w-4 text-slate-600" />
                              <span className="text-sm text-slate-600">Readiness Score:</span>
                              <span
                                className={`font-bold ${
                                  claim.readiness_score >= 90
                                    ? "text-green-600"
                                    : claim.readiness_score >= 70
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                {claim.readiness_score}/100
                              </span>
                            </div>
                            {claim.entitlements?.total && (
                              <div className="flex items-center gap-2">
                                <Icon name="DollarSign" className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-slate-600">Estimated:</span>
                                <span className="font-bold text-green-600">
                                  ${claim.entitlements.total.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/pcs-copilot/${claim.id}`}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                          >
                            Open Claim
                          </Link>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Feature Explainer */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatedCard className="p-6">
              <div className="mb-4 w-fit rounded-xl bg-blue-50 p-3">
                <Icon name="Upload" className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900">Smart Upload</h4>
              <p className="text-sm text-slate-600">
                Snap photos of receipts, orders, and weigh tickets. AI extracts all the data.
              </p>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="mb-4 w-fit rounded-xl bg-green-50 p-3">
                <Icon name="Calculator" className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900">Auto Calculate</h4>
              <p className="text-sm text-slate-600">
                Instant estimates for DLA, TLE, MALT, Per Diem, and PPM based on JTR rules.
              </p>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="mb-4 w-fit rounded-xl bg-orange-50 p-3">
                <Icon name="AlertTriangle" className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900">Catch Errors</h4>
              <p className="text-sm text-slate-600">
                Detects duplicates, date mismatches, and missing docs before finance does.
              </p>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="mb-4 w-fit rounded-xl bg-purple-50 p-3">
                <Icon name="CheckCircle" className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900">Submit Ready</h4>
              <p className="text-sm text-slate-600">
                Get organized claim packages with JTR citations and step-by-step checklists.
              </p>
            </AnimatedCard>
          </div>

          {/* How It Works */}
          {isPremium && (
            <div className="mt-12">
              <h2 className="mb-6 font-serif text-2xl font-bold text-slate-900">How It Works</h2>
              <div className="grid gap-6 sm:grid-cols-4">
                <div className="text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-lg font-black text-white">
                    1
                  </div>
                  <h4 className="mb-2 font-bold text-slate-900">Create Claim</h4>
                  <p className="text-sm text-slate-600">
                    Enter basic PCS details (dates, bases, dependents)
                  </p>
                </div>

                <div className="text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-lg font-black text-white">
                    2
                  </div>
                  <h4 className="mb-2 font-bold text-slate-900">Upload Docs</h4>
                  <p className="text-sm text-slate-600">
                    Snap or upload orders, receipts, weigh tickets
                  </p>
                </div>

                <div className="text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-lg font-black text-white">
                    3
                  </div>
                  <h4 className="mb-2 font-bold text-slate-900">Review & Fix</h4>
                  <p className="text-sm text-slate-600">
                    AI flags errors and shows what you're leaving on the table
                  </p>
                </div>

                <div className="text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-lg font-black text-white">
                    ✓
                  </div>
                  <h4 className="mb-2 font-bold text-slate-900">Submit</h4>
                  <p className="text-sm text-slate-600">
                    Get organized package with totals and citations
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ask Expert CTA */}
          <div className="mt-8 rounded-lg border border-indigo-200 bg-indigo-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                <Icon name="MessageCircle" className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">PCS Questions?</h3>
                <p className="mb-4 text-sm text-gray-700">
                  "How do I maximize DITY profit?" • "What's my weight allowance?" • "When should I
                  start house hunting?"
                </p>
                <Link
                  href="/dashboard/ask"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Icon name="MessageCircle" className="h-4 w-4" />
                  Ask Our Military Expert →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Claim Modal */}
      {showNewClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
            <h3 className="mb-6 text-2xl font-bold text-slate-900">Create New PCS Claim</h3>

            <form onSubmit={handleCreateClaim} className="space-y-6">
              {/* Claim Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Claim Name
                </label>
                <input
                  type="text"
                  value={formData.claim_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, claim_name: e.target.value }))}
                  placeholder="e.g., JBLM to Fort Bragg PCS"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* PCS Orders Date */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  PCS Orders Date
                </label>
                <input
                  type="date"
                  value={formData.pcs_orders_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pcs_orders_date: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Travel Dates */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, departure_date: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    value={formData.arrival_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, arrival_date: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Bases */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Origin Base
                  </label>
                  <input
                    type="text"
                    value={formData.origin_base}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, origin_base: e.target.value }))
                    }
                    placeholder="e.g., JBLM"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Destination Base
                  </label>
                  <input
                    type="text"
                    value={formData.destination_base}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, destination_base: e.target.value }))
                    }
                    placeholder="e.g., Fort Bragg"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Travel Method & Dependents */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Travel Method
                  </label>
                  <select
                    value={formData.travel_method}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, travel_method: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ppm">PPM (Personally Procured Move)</option>
                    <option value="government">Government Move</option>
                    <option value="mixed">Mixed Move</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Rank & Branch */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Rank at PCS
                  </label>
                  <input
                    type="text"
                    value={formData.rank_at_pcs}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, rank_at_pcs: e.target.value }))
                    }
                    placeholder="e.g., E-5, O-3"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
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

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowNewClaimModal(false)}
                  className="flex-1 rounded-lg bg-gray-200 px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

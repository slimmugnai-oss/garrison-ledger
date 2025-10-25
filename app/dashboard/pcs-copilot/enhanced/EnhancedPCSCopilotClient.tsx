"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import PageHeader from "@/app/components/ui/PageHeader";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";
import PCSManualEntry from "@/app/components/pcs/PCSManualEntry";
import PCSMobileWizard from "@/app/components/pcs/PCSMobileWizard";
import PCSHelpWidget from "@/app/components/pcs/PCSHelpWidget";
import { PCSValidationExplainer } from "@/app/components/pcs/PCSAIExplanation";
import PCSConfidenceDisplay from "@/app/components/pcs/PCSConfidenceDisplay";
import { validatePCSClaim, calculateConfidenceScore } from "@/lib/pcs/validation-engine";
import { calculatePCSClaim } from "@/lib/pcs/calculation-engine";
import { toast } from "sonner";

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

interface EnhancedPCSCopilotClientProps {
  initialClaims: Claim[];
  isPremium: boolean;
  tier: string;
  userProfile: {
    rank?: string;
    branch?: string;
    currentBase?: string;
    hasDependents?: boolean;
  };
}

export default function EnhancedPCSCopilotClient({
  initialClaims,
  isPremium,
  tier: _tier,
  userProfile,
}: EnhancedPCSCopilotClientProps) {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "manual" | "mobile">("list");
  const [validationFlags, setValidationFlags] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleCreateClaim = async (formData: any) => {
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
        setClaims((prev) => [result.claim, ...prev]);
        setShowNewClaimModal(false);
        setCurrentView("list");
      } else {
        alert("Failed to create claim. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create claim:", error);
      alert("Failed to create claim. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleValidationChange = (flags: any[]) => {
    setValidationFlags(flags);
  };

  const handleCalculateEstimates = async (formData: any) => {
    try {
      const estimates = await calculatePCSClaim(formData);
      setEstimates(estimates);
      
      // Show user feedback based on confidence scores
      if (estimates.dla.confidence === 0) {
        toast.warning('DLA rate unavailable. Using estimate. Please verify with finance office.');
      }
      
      if (estimates.malt.confidence < 100) {
        toast.info(`MALT rate may be outdated. Last verified: ${estimates.malt.lastVerified}`);
      }
      
      if (estimates.perDiem.confidence < 100) {
        toast.info('Per diem rate may not be location-specific. Verify with finance office.');
      }
      
      if (estimates.confidence < 80) {
        toast.warning('Some calculations used fallback rates. Please verify with finance office.');
      } else {
        toast.success('Calculations completed successfully!');
      }
    } catch (error) {
      console.error("Failed to calculate estimates:", error);
      toast.error('Failed to calculate estimates. Please try again.');
    }
  };

  const handleAskQuestion = async (question: string) => {
    try {
      const response = await fetch("/api/ask/pcs-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const result = await response.json();

      if (result.success) {
        // Show response in a modal or notification
        console.log("AI Response:", result.response);
        // You could implement a modal here to show the response
      }
    } catch (error) {
      console.error("Failed to ask question:", error);
    }
  };

  const getClaimContext = () => ({
    rank: userProfile.rank,
    branch: userProfile.branch,
    hasDependents: userProfile.hasDependents,
    pcsType: "CONUS to CONUS", // Would be dynamic based on claim
    distance: 0, // Would be calculated
    currentSection: "basic",
  });

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />

        <div className="mobile-container py-12 sm:py-16">
          {/* Header */}
          <div className="mb-8">
            <Badge variant="primary">Enhanced Premium Feature</Badge>
          </div>
          <PageHeader
            title="PCS Money Copilot Elite"
            subtitle="Manual entry, real-time validation, and AI-powered guidance for maximum PCS profit"
          />

          {/* View Toggle */}
          <div className="mb-8 flex gap-2">
            <button
              onClick={() => setCurrentView("list")}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                currentView === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Icon name="List" className="mr-2 inline h-4 w-4" />
              Claims List
            </button>
            <button
              onClick={() => setCurrentView("manual")}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                currentView === "manual"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Icon name="Edit" className="mr-2 inline h-4 w-4" />
              Manual Entry
            </button>
            {isMobile && (
              <button
                onClick={() => setCurrentView("mobile")}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  currentView === "mobile"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Icon name="Monitor" className="mr-2 inline h-4 w-4" />
                Mobile Wizard
              </button>
            )}
          </div>

          {/* Main Content */}
          {currentView === "list" && (
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
                          <button
                            onClick={() => setSelectedClaim(claim)}
                            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                          >
                            Open Claim
                          </button>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Manual Entry View */}
          {currentView === "manual" && (
            <PCSManualEntry
              claimId={selectedClaim?.id || "new"}
              userProfile={userProfile}
              onSave={handleCreateClaim}
              onValidationChange={handleValidationChange}
            />
          )}

          {/* Mobile Wizard View */}
          {currentView === "mobile" && (
            <PCSMobileWizard
              userProfile={userProfile}
              onComplete={handleCreateClaim}
              onSave={handleCreateClaim}
              onValidationChange={handleValidationChange}
            />
          )}

          {/* Validation Explainer */}
          {validationFlags.length > 0 && (
            <div className="mt-8">
              <PCSValidationExplainer flags={validationFlags} claimContext={getClaimContext()} />
            </div>
          )}

          {/* Confidence Display */}
          {estimates && (
            <div className="mt-8">
              <PCSConfidenceDisplay estimates={estimates} />
            </div>
          )}

          {/* Enhanced Features */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatedCard className="p-6">
              <div className="mb-4 w-fit rounded-xl bg-blue-50 p-3">
                <Icon name="Edit" className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900">Manual Entry</h4>
              <p className="text-sm text-slate-600">
                Type in your PCS details with real-time validation and auto-population.
              </p>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="mb-4 w-fit rounded-xl bg-green-50 p-3">
                <Icon name="Shield" className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900">JTR Compliance</h4>
              <p className="text-sm text-slate-600">
                Real-time validation against Joint Travel Regulations with AI explanations.
              </p>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="mb-4 w-fit rounded-xl bg-purple-50 p-3">
                <Icon name="Sparkles" className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900">AI Guidance</h4>
              <p className="text-sm text-slate-600">
                Get personalized explanations and recommendations for your specific PCS.
              </p>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <div className="mb-4 w-fit rounded-xl bg-orange-50 p-3">
                <Icon name="Monitor" className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900">Mobile Optimized</h4>
              <p className="text-sm text-slate-600">
                Progressive wizard designed for mobile use during PCS moves.
              </p>
            </AnimatedCard>
          </div>
        </div>
      </div>

      {/* Help Widget */}
      <PCSHelpWidget claimContext={getClaimContext()} onAskQuestion={handleAskQuestion} />

      {/* New Claim Modal */}
      {showNewClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
            <h3 className="mb-6 text-2xl font-bold text-slate-900">Create New PCS Claim</h3>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowNewClaimModal(false);
                  setCurrentView("manual");
                }}
                className="w-full rounded-lg border-2 border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100"
              >
                <div className="flex items-center gap-3">
                  <Icon name="Edit" className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-semibold text-blue-900">Manual Entry</div>
                    <div className="text-sm text-blue-700">
                      Type in your details with real-time validation
                    </div>
                  </div>
                </div>
              </button>

              {isMobile && (
                <button
                  onClick={() => {
                    setShowNewClaimModal(false);
                    setCurrentView("mobile");
                  }}
                  className="w-full rounded-lg border-2 border-green-200 bg-green-50 p-4 transition-colors hover:bg-green-100"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Monitor" className="h-6 w-6 text-green-600" />
                    <div className="text-left">
                      <div className="font-semibold text-green-900">Mobile Wizard</div>
                      <div className="text-sm text-green-700">
                        Step-by-step mobile-optimized flow
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setShowNewClaimModal(false)}
                className="flex-1 rounded-lg bg-gray-200 px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

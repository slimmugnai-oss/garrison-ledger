"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import PCSAIExplanation from "@/app/components/pcs/PCSAIExplanation";
import PCSConfidenceDisplay from "@/app/components/pcs/PCSConfidenceDisplay";
import PCSDocumentLibrary from "@/app/components/pcs/PCSDocumentLibrary";
import PCSDocumentUploader from "@/app/components/pcs/PCSDocumentUploader";
import PCSHelpAnswerModal from "@/app/components/pcs/PCSHelpAnswerModal";
import PCSHelpSystem, { PCSQuickHelp } from "@/app/components/pcs/PCSHelpSystem";
import PCSHelpWidget from "@/app/components/pcs/PCSHelpWidget";
import PCSLoadingOverlay, { usePCSLoadingStates } from "@/app/components/pcs/PCSLoadingOverlay";
import PCSManualEntry from "@/app/components/pcs/PCSManualEntry";
import PCSMobileInterface from "@/app/components/pcs/PCSMobileInterface";
import PCSMobileWizard from "@/app/components/pcs/PCSMobileWizard";
import {
  PCSOnboardingTour,
  PCSOnboardingChecklist,
  PCSFeatureHighlights,
} from "@/app/components/pcs/PCSOnboardingTour";
// import { PCSOptimisticUI } from "@/app/components/pcs/PCSOptimisticUI";
import PCSRecommendationCards from "@/app/components/pcs/PCSRecommendationCards";
import PCSValidationResults from "@/app/components/pcs/PCSValidationResults";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Icon from "@/app/components/ui/Icon";
import PageHeader from "@/app/components/ui/PageHeader";
import { calculatePCSClaim, FormData, CalculationResult } from "@/lib/pcs/calculation-engine";
// import { validatePCSClaim, calculateConfidenceScore } from "@/lib/pcs/validation-engine";

interface Claim {
  id: string;
  claim_name: string;
  status: string;
  readiness_score: number;
  completion_percentage: number;
  entitlements: {
    total?: number;
    ppm?: number;
    ppm_withholding?: {
      gross_payout: number;
      net_payout: number;
      total_withholding: number;
      effective_rate: number;
      federal_rate: number;
      state_rate: number;
      fica_amount: number;
      medicare_amount: number;
    };
  } | null;
  created_at: string;
}

interface ValidationFlag {
  field: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
}

interface ValidationSummary {
  total_rules: number;
  passed: number;
  warnings: number;
  errors: number;
  overall_score: number;
  results: ValidationResult[];
}

interface ValidationResult {
  rule_code: string;
  rule_title: string;
  category: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
  citation: string;
  passed: boolean;
  details?: any;
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
  const [_isCreating, setIsCreating] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "manual" | "mobile" | "documents">(
    "list"
  );
  const [validationFlags, setValidationFlags] = useState<ValidationFlag[]>([]);
  const [estimates, setEstimates] = useState<CalculationResult | null>(null);
  const [formData, _setFormData] = useState<FormData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationSummary | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpContext, setHelpContext] = useState("general");
  const [helpAnswer, setHelpAnswer] = useState<any>(null);
  const [helpQuestion, setHelpQuestion] = useState<string>("");
  const [showHelpAnswerModal, setShowHelpAnswerModal] = useState(false);

  // Loading state management
  const loadingStates = usePCSLoadingStates();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check for first-time user and show onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("pcs-copilot-onboarding-completed");
    const isFirstTime = claims.length === 0 && !hasSeenOnboarding;

    if (isFirstTime) {
      setShowOnboarding(true);
    }
  }, [claims.length]);

  const handleCreateClaim = async (formData: Record<string, unknown> | FormData) => {
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

  const handleValidationChange = (flags: ValidationFlag[]) => {
    setValidationFlags(flags);
  };

  const _handleCalculateEstimates = async (formData: FormData) => {
    const loadingId = `calculation-${Date.now()}`;
    try {
      loadingStates.startLoading(loadingId, "calculation", "Calculating PCS entitlements...");
      const estimates = await calculatePCSClaim(formData);
      setEstimates(estimates);
      loadingStates.completeLoading(loadingId, true, "Calculations complete");

      // Show user feedback based on confidence scores
      if (estimates.dla.confidence === 0) {
        toast.warning("DLA rate unavailable. Using estimate. Please verify with finance office.");
      }

      if (estimates.malt.confidence < 100) {
        toast.info("MALT rate may be outdated. Please verify with finance office.");
      }

      if (estimates.perDiem.confidence < 100) {
        toast.info("Per diem rate may not be location-specific. Verify with finance office.");
      }

      if (estimates.confidence.overall < 80) {
        toast.warning("Some calculations used fallback rates. Please verify with finance office.");
      } else {
        toast.success("Calculations completed successfully!");
      }
    } catch (error) {
      console.error("Failed to calculate estimates:", error);
      loadingStates.completeLoading(loadingId, false, "Calculation failed");
      toast.error("Failed to calculate estimates. Please try again.");
    }
  };

  const handleValidateClaim = async (formData: FormData) => {
    const loadingId = `validation-${Date.now()}`;
    setIsValidating(true);
    try {
      loadingStates.startLoading(loadingId, "validation", "Validating PCS claim...");
      const response = await fetch("/api/pcs/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Validation failed");
      }

      const data = await response.json();
      setValidationResults(data.validation);

      if (data.validation.errors > 0) {
        loadingStates.completeLoading(
          loadingId,
          false,
          `${data.validation.errors} validation errors found`
        );
        toast.error(`${data.validation.errors} validation errors found`);
      } else if (data.validation.warnings > 0) {
        loadingStates.completeLoading(
          loadingId,
          true,
          `${data.validation.warnings} warnings found`
        );
        toast.warning(`${data.validation.warnings} warnings found`);
      } else {
        loadingStates.completeLoading(loadingId, true, "All validations passed!");
        toast.success("All validations passed!");
      }
    } catch (error) {
      console.error("Validation error:", error);
      loadingStates.completeLoading(loadingId, false, "Validation failed");
      toast.error("Failed to validate claim. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleAskQuestion = async (question: string) => {
    try {
      setHelpQuestion(question);
      toast.info("Getting answer...");

      const response = await fetch("/api/ask/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          templateId: "pcs-copilot-help",
        }),
      });

      const result = await response.json();

      if (result.success && result.answer) {
        setHelpAnswer(result.answer);
        setShowHelpAnswerModal(true);
        toast.success("Answer ready!");
      } else {
        console.error("Ask Assistant error:", result.error);
        toast.error("Sorry, I couldn't answer that question. Please try again.");
      }
    } catch (error) {
      console.error("Failed to ask question:", error);
      toast.error("Sorry, there was an error. Please try again.");
    }
  };

  const handleExportPDF = async () => {
    if (!selectedClaim) return;

    const loadingId = `export-pdf-${selectedClaim.id}`;
    try {
      setIsExporting(true);
      loadingStates.startLoading(loadingId, "export", "Generating PDF...");
      const response = await fetch("/api/pcs/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId: selectedClaim.id,
          type: "full",
        }),
      });

      if (!response.ok) {
        throw new Error("PDF generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pcs-claim-${selectedClaim.id}-full.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      loadingStates.completeLoading(loadingId, true, "PDF exported successfully!");
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export failed:", error);
      loadingStates.completeLoading(loadingId, false, "PDF export failed");
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedClaim) return;

    const loadingId = `export-excel-${selectedClaim.id}`;
    try {
      setIsExporting(true);
      loadingStates.startLoading(loadingId, "export", "Generating Excel...");
      const response = await fetch("/api/pcs/export/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId: selectedClaim.id,
          type: "full",
        }),
      });

      if (!response.ok) {
        throw new Error("Excel generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pcs-claim-${selectedClaim.id}-full.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      loadingStates.completeLoading(loadingId, true, "Excel file exported successfully!");
      toast.success("Excel file exported successfully!");
    } catch (error) {
      console.error("Excel export failed:", error);
      loadingStates.completeLoading(loadingId, false, "Excel export failed");
      toast.error("Failed to generate Excel file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    setShowOnboarding(false);
    localStorage.setItem("pcs-copilot-onboarding-completed", "true");
    toast.success("Welcome to PCS Copilot! You're ready to maximize your entitlements.");
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
      {/* Onboarding Tour */}
      <PCSOnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
        userType={isPremium ? "premium" : "new"}
      />

      {/* Help System */}
      <PCSHelpSystem
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        searchQuery=""
        category=""
      />

      {/* Loading Overlay */}
      <PCSLoadingOverlay
        loadingStates={loadingStates.loadingStates}
        onCancel={(id: string) => loadingStates.clearLoading(id)}
        showProgress={true}
        maxDisplay={3}
      />

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
            subtitle="Calculate your official PCS entitlements with JTR-compliant validation"
          />

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <Link
                  href="/dashboard/pcs-copilot"
                  className="border-b-2 border-blue-500 px-1 py-2 text-sm font-medium text-blue-600"
                  data-tour="new-claim-button"
                >
                  <Icon name="Plus" className="mr-2 inline h-4 w-4" />
                  New Claim
                </Link>
                <Link
                  href="/dashboard/pcs-copilot/library"
                  className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  <Icon name="Archive" className="mr-2 inline h-4 w-4" />
                  Claims Library
                </Link>
                <Link
                  href="/dashboard/pcs-copilot/comparison"
                  className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  <Icon name="BarChart" className="mr-2 inline h-4 w-4" />
                  Cost Comparison
                </Link>
                <Link
                  href="/dashboard/pcs-copilot/planner"
                  className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  <Icon name="MapPin" className="mr-2 inline h-4 w-4" />
                  Assignment Planner
                </Link>
              </nav>
            </div>
          </div>

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
              data-tour="manual-entry"
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
                data-tour="mobile-wizard"
              >
                <Icon name="Monitor" className="mr-2 inline h-4 w-4" />
                Mobile Wizard
              </button>
            )}
            <button
              onClick={() => setCurrentView("documents")}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                currentView === "documents"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              data-tour="documents"
            >
              <Icon name="File" className="mr-2 inline h-4 w-4" />
              Documents
            </button>
            {selectedClaim && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportPDF()}
                  disabled={isExporting}
                  className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  <Icon name="File" className="mr-2 inline h-4 w-4" />
                  {isExporting ? "Generating..." : "Export PDF"}
                </button>
                <button
                  onClick={() => handleExportExcel()}
                  disabled={isExporting}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  <Icon name="Download" className="mr-2 inline h-4 w-4" />
                  {isExporting ? "Generating..." : "Export Excel"}
                </button>
                <Link
                  href={`/dashboard/pcs-copilot/${selectedClaim.id}/summary`}
                  target="_blank"
                  className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700"
                >
                  <Icon name="Printer" className="mr-2 inline h-4 w-4" />
                  Print Summary
                </Link>
              </div>
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
                      <div className="text-sm text-slate-600">Total Entitlements</div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-blue-50 p-3">
                      <Icon name="Calculator" className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        $
                        {claims
                          .reduce((sum, c) => {
                            const totalEntitlements = c.entitlements?.total || 0;
                            const ppmAmount = c.entitlements?.ppm || 0;
                            const ppmWithholding = c.entitlements?.ppm_withholding;
                            
                            // Use accurate PPM net payout if available, otherwise estimate
                            if (ppmWithholding?.net_payout) {
                              // Use the accurate net payout from PPM withholding calculation
                              const otherEntitlements = totalEntitlements - ppmAmount;
                              return sum + (otherEntitlements + ppmWithholding.net_payout);
                            } else {
                              // Fallback to 25% estimate if no detailed withholding data
                              const estimatedWithholding = ppmAmount * 0.25;
                              return sum + (totalEntitlements - estimatedWithholding);
                            }
                          }, 0)
                          .toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600">Estimated Net Payout</div>
                      <div className="text-xs text-slate-500 mt-1">
                        (After typical withholdings)
                      </div>
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
            <div className="space-y-6">
              <PCSManualEntry
                claimId={selectedClaim?.id || "new"}
                userProfile={userProfile}
                onSave={handleCreateClaim}
                onValidationChange={handleValidationChange}
                onValidate={handleValidateClaim}
              />

              {/* Smart Recommendations */}
              {formData && (
                <div className="mt-8">
                  <PCSRecommendationCards
                    claimData={{
                      estimated_weight: formData.estimated_weight,
                      distance_miles: formData.distance_miles,
                      rank: userProfile.rank,
                      has_dependents: userProfile.hasDependents,
                      departure_date: formData.departure_date,
                      arrival_date: formData.arrival_date,
                      origin_base: formData.origin_base,
                      destination_base: formData.destination_base,
                      move_type: formData.travel_method as "dity" | "full" | "partial" | undefined,
                    }}
                    onRecommendationClick={(rec) => {
                      if (rec.link) {
                        window.location.href = rec.link;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Mobile Wizard View */}
          {currentView === "mobile" && (
            <div className="space-y-6">
              {/* Mobile Interface */}
              <PCSMobileInterface
                onSave={handleCreateClaim}
                onValidate={handleValidateClaim}
                showDebugTools={true}
              />

              {/* Fallback to original mobile wizard */}
              <div className="hidden">
                <PCSMobileWizard
                  userProfile={userProfile}
                  onComplete={handleCreateClaim}
                  onSave={handleCreateClaim}
                  onValidationChange={handleValidationChange}
                />
              </div>
            </div>
          )}

          {/* Documents View */}
          {currentView === "documents" && selectedClaim && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Document Management</h2>
                <p className="text-slate-600">
                  Upload and manage receipts, invoices, and other PCS-related documents
                </p>
              </div>

              {/* Document Uploader */}
              <PCSDocumentUploader
                claimId={selectedClaim.id}
                onDocumentUploaded={(document) => {
                  toast.success(`Document ${document.name} uploaded successfully`);
                }}
                onDocumentProcessed={(document) => {
                  toast.success(`Document ${document.name} processed successfully`);
                }}
              />

              {/* Document Library */}
              <PCSDocumentLibrary
                claimId={selectedClaim.id}
                onDocumentSelect={(document) => {
                  console.log("Document selected:", document);
                }}
                onDocumentDelete={(documentId) => {
                  toast.success("Document deleted successfully");
                }}
              />
            </div>
          )}

          {/* Validation Explainer */}
          {validationFlags.length > 0 && (
            <div className="mt-8">
              <PCSAIExplanation
                ruleCode="VALIDATION"
                ruleTitle="Validation Results"
                category="general"
                severity="info"
                message="Review validation results below"
                userContext={{
                  rank: userProfile.rank,
                  branch: userProfile.branch,
                  hasDependents: userProfile.hasDependents,
                  pcsType: "PCS",
                }}
              />
            </div>
          )}

          {/* Confidence Display */}
          {estimates && (
            <div className="mt-8">
              <PCSConfidenceDisplay
                estimates={{
                  dla: {
                    confidence: estimates.dla.confidence,
                    source: estimates.dla.source,
                    lastVerified: estimates.dla.lastVerified,
                  },
                  malt: {
                    confidence: estimates.malt.confidence,
                    source: estimates.malt.source,
                    lastVerified: estimates.malt.effectiveDate,
                  },
                  perDiem: {
                    confidence: estimates.perDiem.confidence,
                    source: estimates.perDiem.citation,
                    lastVerified: estimates.perDiem.effectiveDate,
                  },
                  total: estimates.total,
                  confidence: estimates.confidence.overall,
                  dataSources: estimates.dataSources,
                }}
              />
            </div>
          )}

          {/* Validation Results */}
          {validationResults && (
            <div className="mt-8">
              <PCSValidationResults
                validation={validationResults}
                onFixSuggestion={(ruleCode, suggestion) => {
                  toast.info(`Fix suggestion: ${suggestion}`);
                }}
              />
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

      {/* Help Answer Modal */}
      <PCSHelpAnswerModal
        isOpen={showHelpAnswerModal}
        onClose={() => setShowHelpAnswerModal(false)}
        answer={helpAnswer}
        question={helpQuestion}
      />

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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import PCSUnifiedWizard from "@/app/components/pcs/PCSUnifiedWizard";
import { logger } from "@/lib/logger";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
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

interface SimplifiedPCSClientProps {
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

export default function SimplifiedPCSClient({
  initialClaims,
  isPremium: _isPremium,
  tier: _tier,
  userProfile,
}: SimplifiedPCSClientProps) {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  // Check if we're editing a claim from URL param
  const [showWizard, setShowWizard] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return !!params.get("edit"); // Show wizard if ?edit param exists
    }
    return false; // Default to list view
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Watch for ?edit param changes and show wizard when present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const editParam = params.get("edit");

      if (editParam) {
        setShowWizard(true); // Show wizard when edit param exists
      }
    }
  }, []);

  // Get the edit claim ID from URL if present
  const getEditClaimId = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("edit");
    }
    return null;
  };

  // Clear ?edit param from URL when wizard is closed
  useEffect(() => {
    if (!showWizard && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("edit")) {
        params.delete("edit");
        const newUrl =
          window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [showWizard]);

  const handleWizardComplete = (claimId: string) => {
    // Refresh the page to show updated claims list
    window.location.reload();
  };

  const handleDeleteClaim = async (claimId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pcs/claims/${claimId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove claim from state
        setClaims(claims.filter((c) => c.id !== claimId));
        toast.success("Claim deleted successfully");
        setDeleteConfirmId(null);
      } else {
        toast.error("Failed to delete claim");
      }
    } catch (error) {
      logger.error("Failed to delete claim", error);
      toast.error("An error occurred while deleting the claim");
    } finally {
      setIsDeleting(false);
    }
  };

  // Show wizard (default view)
  if (showWizard) {
    return (
      <div className="pb-16">
        {/* Switch to Claims List (if user has claims) */}
        {claims.length > 0 && (
          <div className="mb-6 text-center">
            <button
              onClick={() => setShowWizard(false)}
              className="text-sm text-blue-600 hover:underline"
            >
              ← View your {claims.length} existing claim{claims.length > 1 ? "s" : ""}
            </button>
          </div>
        )}
        <PCSUnifiedWizard
          userProfile={userProfile}
          onComplete={handleWizardComplete}
          editClaimId={getEditClaimId() || undefined}
        />
      </div>
    );
  }

  // Returning user: Show claims list
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header with New Claim CTA */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Your PCS Claims</h2>
          <p className="mt-1 text-slate-600">Manage and track your PCS reimbursement claims</p>
        </div>
        <Button
          onClick={() => setShowWizard(true)}
          className="bg-blue-600 px-6 py-3 text-lg hover:bg-blue-700"
        >
          <Icon name="Plus" className="mr-2 h-5 w-5" />
          New PCS Claim
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
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
              <Icon name="CheckCircle" className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {claims.filter((c) => c.status === "completed").length}
              </div>
              <div className="text-sm text-slate-600">Completed</div>
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
                ${claims.reduce((sum, c) => sum + (c.entitlements?.total || 0), 0).toLocaleString()}
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
                    // Estimate net payout: total entitlements - estimated PPM withholding
                    // For PPM, assume ~25% withholding (federal + state + FICA + Medicare)
                    const estimatedWithholding = ppmAmount * 0.25;
                    return sum + (totalEntitlements - estimatedWithholding);
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
      </div>

      {/* Claims Grid */}
      {claims.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Icon name="FolderOpen" className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No claims yet</h3>
          <p className="mb-6 text-gray-600">
            Get started by creating your first PCS claim. It only takes 15 minutes.
          </p>
          <Button onClick={() => setShowWizard(true)} className="bg-blue-600 hover:bg-blue-700">
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Create Your First Claim
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {claims.map((claim) => (
            <AnimatedCard key={claim.id} className="group relative hover:shadow-xl">
              <div className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <Link href={`/dashboard/pcs-copilot/${claim.id}`} className="flex-1">
                    <h3 className="mb-1 cursor-pointer font-bold text-slate-900 group-hover:text-blue-600">
                      {claim.claim_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        claim.status === "completed"
                          ? "success"
                          : claim.completion_percentage === 100 && claim.readiness_score >= 80
                            ? "success"
                            : claim.status === "ready_to_submit"
                              ? "success"
                              : claim.status === "in_progress"
                                ? "primary"
                                : "secondary"
                      }
                    >
                      {claim.status === "completed"
                        ? "Completed"
                        : claim.completion_percentage === 100 && claim.readiness_score >= 80
                          ? "Ready to Submit"
                          : claim.status === "ready_to_submit"
                            ? "Ready to Submit"
                            : claim.status === "in_progress"
                              ? "In Progress"
                              : "Draft"}
                    </Badge>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteConfirmId(claim.id);
                      }}
                      className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Delete claim"
                    >
                      <Icon name="Trash2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Link href={`/dashboard/pcs-copilot/${claim.id}`} className="block">
                  {/* Total Entitlement */}
                  {claim.entitlements?.total && (
                    <div className="mb-4 rounded-lg bg-green-50 p-4">
                      <div className="text-sm text-green-700">Estimated Entitlement</div>
                      <div className="text-2xl font-black text-green-900">
                        ${claim.entitlements.total.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-slate-600">Completion</span>
                      <span className="font-medium text-slate-900">
                        {claim.completion_percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-700"
                        style={{ width: `${claim.completion_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Readiness Score */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-sm text-slate-600">Readiness Score</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-sm font-bold ${
                          claim.readiness_score >= 90
                            ? "text-green-600"
                            : claim.readiness_score >= 70
                              ? "text-blue-600"
                              : "text-amber-600"
                        }`}
                      >
                        {claim.readiness_score}%
                      </div>
                      {claim.readiness_score >= 90 && (
                        <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <AnimatedCard className="max-w-md">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-3">
                  <Icon name="AlertTriangle" className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Delete Claim?</h3>
              </div>
              <p className="mb-6 text-slate-600">
                Are you sure you want to delete "
                {claims.find((c) => c.id === deleteConfirmId)?.claim_name}"? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteClaim(deleteConfirmId)}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Quick Links */}
      {claims.length > 0 && (
        <div className="mt-12">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Quick Links</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/dashboard/pcs-copilot/library">
              <AnimatedCard className="cursor-pointer p-6 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-purple-50 p-3">
                    <Icon name="Archive" className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Claims Library</div>
                    <div className="text-sm text-slate-600">View all past claims</div>
                  </div>
                </div>
              </AnimatedCard>
            </Link>

            <AnimatedCard className="cursor-pointer p-6 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-50 p-3">
                  <Icon name="HelpCircle" className="h-6 w-6 text-blue-600" />
                </div>
                <Link href="/dashboard/ask?topic=pcs">
                  <div>
                    <div className="font-bold text-slate-900">Ask Military Expert</div>
                    <div className="text-sm text-slate-600">Get PCS-specific guidance</div>
                  </div>
                </Link>
              </div>
            </AnimatedCard>
          </div>
        </div>
      )}
    </div>
  );
}

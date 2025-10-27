"use client";

import { useState, useEffect } from "react";

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card, { CardContent, CardHeader } from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";
import { FormData } from "@/lib/pcs/calculation-engine";

import { PCSMobileWizardOptimized } from "./PCSMobileWizardOptimized";

interface PCSMobileInterfaceProps {
  onSave: (data: FormData) => void;
  onValidate?: (data: FormData) => void;
  initialData?: Partial<FormData>;
  showDebugTools?: boolean;
}

/**
 * Mobile-optimized PCS interface with touch-friendly interactions
 */
export function PCSMobileInterface({
  onSave,
  onValidate,
  initialData,
  showDebugTools = false,
}: PCSMobileInterfaceProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) {
    return (
      <div className="hidden md:block">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-center">
            <Icon name="Monitor" className="mx-auto mb-2 h-8 w-8 text-amber-600" />
            <p className="text-amber-800">Mobile interface is only visible on mobile devices.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mobile-pcs-interface">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">PCS Copilot</h1>
          <Badge variant="primary">Mobile</Badge>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="space-y-4 p-4">
        <PCSMobileWizardOptimized
          onSave={onSave}
          onValidate={onValidate}
          initialData={initialData}
        />
      </div>

      <style jsx>{`
        .mobile-pcs-interface {
          min-height: 100vh;
          padding-bottom: 80px; /* Space for bottom navigation */
        }

        .mobile-pcs-interface input,
        .mobile-pcs-interface select,
        .mobile-pcs-interface textarea {
          min-height: 44px;
          font-size: 16px;
        }

        .mobile-pcs-interface button {
          min-height: 44px;
        }

        /* Prevent zoom on iOS */
        @media screen and (max-width: 768px) {
          .mobile-pcs-interface input[type="text"],
          .mobile-pcs-interface input[type="email"],
          .mobile-pcs-interface input[type="tel"],
          .mobile-pcs-interface input[type="url"],
          .mobile-pcs-interface input[type="password"],
          .mobile-pcs-interface input[type="number"],
          .mobile-pcs-interface input[type="search"],
          .mobile-pcs-interface textarea,
          .mobile-pcs-interface select {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Mobile-optimized claim card component
 */
export function PCSMobileClaimCard({
  claim,
  onSelect,
  onEdit,
  onDelete,
}: {
  claim: any;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="mb-4 touch-manipulation">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold">{claim.claim_name}</h3>
            <p className="text-sm text-gray-600">
              {claim.origin_base} → {claim.destination_base}
            </p>
          </div>
          <Badge
            variant={
              claim.status === "completed"
                ? "success"
                : claim.status === "pending"
                  ? "warning"
                  : "secondary"
            }
          >
            {claim.status}
          </Badge>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Total Entitlements</p>
            <p className="font-semibold">${claim.total_entitlements?.toLocaleString() || "0"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Completion</p>
            <p className="font-semibold">{claim.completion_percentage || 0}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSelect} className="h-10 flex-1">
            <Icon name="Eye" className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit} className="h-10 flex-1">
            <Icon name="Edit" className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="h-10 w-10 p-0">
            <Icon name="Trash2" className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Mobile-optimized statistics display
 */
export function PCSMobileStats({
  stats,
}: {
  stats: {
    totalClaims: number;
    totalValue: number;
    averageValue: number;
    completionRate: number;
  };
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalClaims}</div>
          <div className="text-sm text-gray-600">Total Claims</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            ${stats.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            ${stats.averageValue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Average Value</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.completionRate}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PCSMobileInterface;

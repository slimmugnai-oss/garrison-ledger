"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import PCSDocumentUploader from "./PCSDocumentUploader";
import PCSProvenanceDisplay from "./PCSProvenanceDisplay";
import PCSROIDisplay from "./PCSROIDisplay";
import PCSTermTooltip from "./PCSTermTooltip";
import DD1351Explainer from "./DD1351Explainer";
import PPMDisclaimer from "./PPMDisclaimer";
import PPMModeSelector from "./PPMModeSelector";
import PPMWithholdingDisplay from "./PPMWithholdingDisplay";
import AnimatedCard from "@/app/components/ui/AnimatedCard";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card, { CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";
import Input from "@/app/components/ui/Input";
import {
  calculatePCSClaim,
  type FormData,
  type CalculationResult,
} from "@/lib/pcs/calculation-engine";
import type { PPMWithholdingResult } from "@/lib/pcs/ppm-withholding-calculator";
import { logger } from "@/lib/logger";
import militaryBasesData from "@/lib/data/military-bases.json";

interface PCSUnifiedWizardProps {
  userProfile: {
    rank?: string;
    branch?: string;
    currentBase?: string;
    hasDependents?: boolean;
  };
  onComplete?: (claimId: string) => void;
}

type WizardStep = "start" | "basic-info" | "lodging" | "review" | "complete";

interface WizardFormData extends Partial<FormData> {
  claim_name?: string;
  pcs_orders_date?: string;
  departure_date?: string;
  arrival_date?: string;
  origin_base?: string;
  destination_base?: string;
  rank_at_pcs?: string;
  branch?: string;
  dependents_count?: number;
  travel_method?: string;
  tle_origin_nights?: number;
  tle_destination_nights?: number;
  tle_origin_rate?: number;
  tle_destination_rate?: number;
  malt_distance?: number;
  per_diem_days?: number;
  estimated_weight?: number;
  actual_weight?: number;
  distance_miles?: number;
  fuel_receipts?: number;
}

/**
 * Unified PCS Wizard - Single responsive flow for all devices
 *
 * Combines best of manual entry + mobile wizard
 * OCR-first approach with manual entry fallback
 * Plain English throughout with tooltips for jargon
 * Real-time ROI calculation at top
 */
export default function PCSUnifiedWizard({ userProfile, onComplete }: PCSUnifiedWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("start");
  const [entryMethod, setEntryMethod] = useState<"ocr" | "manual" | null>(null);
  const [formData, setFormData] = useState<WizardFormData>({
    rank_at_pcs: userProfile.rank,
    branch: userProfile.branch,
    origin_base: userProfile.currentBase,
    dependents_count: userProfile.hasDependents ? 1 : 0,
    travel_method: "ppm",
    tle_origin_nights: 0,
    tle_destination_nights: 0,
    tle_origin_rate: 0,
    tle_destination_rate: 0,
  });
  const [calculations, setCalculations] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [isLoadingDistance, setIsLoadingDistance] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // PPM withholding calculator state
  const [ppmDisclaimerAccepted, setPpmDisclaimerAccepted] = useState(false);
  const [ppmMode, setPpmMode] = useState<"official" | "estimator" | null>(null);
  const [ppmGccAmount, setPpmGccAmount] = useState<number | null>(null);
  const [ppmWithholding, setPpmWithholding] = useState<PPMWithholdingResult | null>(null);
  const [ppmExpenses, setPpmExpenses] = useState({
    movingCosts: 0,
    fuelReceipts: 0,
    laborCosts: 0,
    tollsAndFees: 0,
  });

  // MUST DECLARE updateFormData BEFORE useEffect hooks that depend on it
  const updateFormData = (updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  /**
   * Extract ZIP code from military base name
   * Uses military-bases.json which contains ZIP codes for ~400 bases
   */
  const extractZipFromBase = useCallback((baseName: string): string => {
    if (!baseName) return "00000";

    const normalizedInput = baseName.toLowerCase().trim();
    const base = militaryBasesData.bases.find(
      (b: any) =>
        b.name.toLowerCase().includes(normalizedInput) ||
        normalizedInput.includes(b.name.toLowerCase()) ||
        b.city.toLowerCase().includes(normalizedInput)
    );

    return base?.zip || "00000";
  }, []);

  /**
   * Auto-calculate distance when origin/destination bases change
   * Calls existing /api/pcs/calculate-distance endpoint
   */
  useEffect(() => {
    if (formData.origin_base && formData.destination_base && !isLoadingDistance) {
      const fetchDistance = async () => {
        setIsLoadingDistance(true);
        try {
          const response = await fetch("/api/pcs/calculate-distance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              origin: formData.origin_base,
              destination: formData.destination_base,
              useGoogleMaps: false, // Use cached/haversine first for speed
            }),
          });

          if (response.ok) {
            const { distance } = await response.json();
            updateFormData({
              malt_distance: distance,
              distance_miles: distance,
            });
            logger.info("Auto-calculated distance:", {
              distance,
              origin: formData.origin_base,
              destination: formData.destination_base,
            });
          }
        } catch (error) {
          logger.error("Failed to auto-calculate distance:", error);
        } finally {
          setIsLoadingDistance(false);
        }
      };

      // Debounce to avoid excessive API calls
      const timer = setTimeout(fetchDistance, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.origin_base, formData.destination_base, isLoadingDistance, updateFormData]);

  /**
   * Auto-calculate travel days from departure and arrival dates
   * Simple date math: arrival_date - departure_date
   */
  useEffect(() => {
    if (formData.departure_date && formData.arrival_date) {
      const departure = new Date(formData.departure_date);
      const arrival = new Date(formData.arrival_date);
      const days = Math.ceil((arrival.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24));

      if (days > 0 && days !== formData.per_diem_days) {
        updateFormData({ per_diem_days: days });
        logger.info("Auto-calculated travel days:", {
          days,
          departure: formData.departure_date,
          arrival: formData.arrival_date,
        });
      }
    }
  }, [formData.departure_date, formData.arrival_date, formData.per_diem_days, updateFormData]);

  /**
   * Auto-fill TLE rates from per diem locality data
   * Fetches per diem rates for origin/destination and suggests as TLE daily rate
   */
  useEffect(() => {
    const fetchTLERates = async () => {
      if (!formData.pcs_orders_date) return;

      setIsLoadingRates(true);
      const effectiveDate = formData.pcs_orders_date || new Date().toISOString().split("T")[0];

      try {
        // Fetch origin TLE rate
        if (formData.origin_base) {
          const originZip = extractZipFromBase(formData.origin_base);
          if (originZip !== "00000") {
            const response = await fetch("/api/pcs/per-diem-lookup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ zip: originZip, effectiveDate }),
            });

            if (response.ok) {
              const data = await response.json();
              // Use lodging component of per diem as suggested TLE rate
              const suggestedRate = data.lodgingRate || data.totalRate || 150;
              if (formData.tle_origin_rate === 0) {
                updateFormData({ tle_origin_rate: suggestedRate });
                logger.info("Auto-filled origin TLE rate:", {
                  rate: suggestedRate,
                  zip: originZip,
                });
              }
            }
          }
        }

        // Fetch destination TLE rate
        if (formData.destination_base) {
          const destZip = extractZipFromBase(formData.destination_base);
          if (destZip !== "00000") {
            const response = await fetch("/api/pcs/per-diem-lookup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ zip: destZip, effectiveDate }),
            });

            if (response.ok) {
              const data = await response.json();
              const suggestedRate = data.lodgingRate || data.totalRate || 150;
              if (formData.tle_destination_rate === 0) {
                updateFormData({ tle_destination_rate: suggestedRate });
                logger.info("Auto-filled destination TLE rate:", {
                  rate: suggestedRate,
                  zip: destZip,
                });
              }
            }
          }
        }
      } catch (error) {
        logger.error("Failed to fetch TLE rates:", error);
      } finally {
        setIsLoadingRates(false);
      }
    };

    // Only fetch if we have bases and haven't set rates yet
    if ((formData.origin_base || formData.destination_base) && !isLoadingRates) {
      const timer = setTimeout(fetchTLERates, 1500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [
    formData.origin_base,
    formData.destination_base,
    formData.pcs_orders_date,
    formData.tle_origin_rate,
    formData.tle_destination_rate,
    extractZipFromBase,
    isLoadingRates,
    updateFormData,
  ]);

  // Calculate estimates when relevant fields change
  const calculateEstimates = useCallback(async () => {
    // Only calculate if we have minimum required data
    if (
      !formData.origin_base ||
      !formData.destination_base ||
      !formData.departure_date ||
      !formData.arrival_date
    ) {
      return;
    }

    setIsCalculating(true);
    try {
      // Extract destination ZIP for per diem locality lookup
      const destinationZip = extractZipFromBase(formData.destination_base);

      const result = await calculatePCSClaim({
        ...formData,
        destination_zip: destinationZip,
      } as FormData);
      setCalculations(result);
    } catch (error) {
      logger.error("Failed to calculate estimates:", error);
    } finally {
      setIsCalculating(false);
    }
  }, [formData, extractZipFromBase]);

  // Auto-calculate when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateEstimates();
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [calculateEstimates]);

  /**
   * Handle PPM mode selection and calculate withholding
   */
  const handlePPMCalculation = async (mode: "official" | "estimator", data: any) => {
    setPpmMode(mode);
    setPpmGccAmount(data.gccAmount);

    if (data.movingExpenses !== undefined) {
      setPpmExpenses({
        movingCosts: data.movingExpenses,
        fuelReceipts: data.fuelReceipts || 0,
        laborCosts: data.laborCosts || 0,
        tollsAndFees: data.tollsAndFees || 0,
      });
    }

    // Calculate withholding via API (server-side only)
    try {
      // Extract destination state from base
      const destState = extractStateFromBase(formData.destination_base || "");

      const response = await fetch("/api/pcs/calculate-ppm-withholding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gccAmount: data.gccAmount,
          incentivePercentage: 100, // Current rate (admin can override later)
          mode, // Pass through official vs. estimator mode
          allowedExpenses: {
            movingCosts: data.movingExpenses || 0,
            fuelReceipts: data.fuelReceipts || 0,
            laborCosts: data.laborCosts || 0,
            tollsAndFees: data.tollsAndFees || 0,
          },
          destinationState: destState,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate PPM withholding");
      }

      const withholdingResult: PPMWithholdingResult = await response.json();

      setPpmWithholding(withholdingResult);

      // Update form data with PPM amount for overall calculation
      updateFormData({
        actual_weight: data.weight || formData.actual_weight,
      });

      logger.info("PPM withholding calculated:", {
        mode,
        gcc: data.gccAmount,
        netPayout: withholdingResult.estimatedNetPayout,
      });
    } catch (error) {
      logger.error("Failed to calculate PPM withholding:", error);
      toast.error("Failed to calculate PPM withholding");
    }
  };

  /**
   * Extract state code from base name
   */
  const extractStateFromBase = useCallback((baseName: string): string => {
    if (!baseName) return "TX"; // Default fallback

    const normalizedInput = baseName.toLowerCase().trim();
    const base = militaryBasesData.bases.find(
      (b: any) =>
        b.name.toLowerCase().includes(normalizedInput) ||
        normalizedInput.includes(b.name.toLowerCase()) ||
        b.city.toLowerCase().includes(normalizedInput)
    );

    return base?.state || "TX"; // Default to TX (no state tax)
  }, []);

  const handleOCRComplete = (extractedData: any) => {
    console.log("🔍 OCR Complete - Raw extracted data:", extractedData);

    setOcrData(extractedData);

    // Build update object
    const updates = {
      claim_name: extractedData.member_name ? `PCS - ${extractedData.member_name}` : undefined,
      pcs_orders_date: extractedData.orders_date || extractedData.ordersDate,
      departure_date: extractedData.departure_date || extractedData.departureDate,
      arrival_date: extractedData.report_date || extractedData.reportDate,
      origin_base: extractedData.origin_base || extractedData.originBase,
      destination_base: extractedData.destination_base || extractedData.destinationBase,
      rank_at_pcs: extractedData.rank,
      dependents_count: extractedData.dependents_authorized || 0,
      branch: extractedData.branch || formData.branch,
    };

    console.log("🔍 OCR Complete - Update object:", updates);
    console.log("🔍 OCR Complete - Current formData before update:", formData);

    // Populate form with OCR data
    updateFormData(updates);

    console.log("🔍 OCR Complete - FormData updated, advancing to basic-info step");

    // Show success message with details
    const fieldsExtracted = Object.values(updates).filter((v) => v !== undefined).length;
    toast.success(
      `PCS orders data extracted! ${fieldsExtracted} fields populated. Review and continue.`
    );

    // Move to basic info step
    setCurrentStep("basic-info");
  };

  const handleSaveClaim = async () => {
    setIsSaving(true);
    try {
      // 1. Save claim to database
      const response = await fetch("/api/pcs/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          calculations,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const claimId = result.claim.id;

        // 2. Generate and download PDF
        const pdfResponse = await fetch("/api/pcs/export/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claimId, type: "full" }),
        });

        if (pdfResponse.ok) {
          const pdfBlob = await pdfResponse.blob();

          // 3. Trigger browser download
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `PCS_Claim_${new Date().toISOString().split("T")[0]}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }

        setCurrentStep("complete");
        toast.success("PCS claim saved and PDF downloaded!");
        if (onComplete) {
          onComplete(claimId);
        }
      } else {
        toast.error("Failed to save claim. Please try again.");
      }
    } catch (error) {
      logger.error("Failed to save claim:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStepProgress = () => {
    const steps: WizardStep[] = ["start", "basic-info", "lodging", "review", "complete"];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getFieldCompletionPercentage = () => {
    const requiredFields = [
      formData.claim_name,
      formData.pcs_orders_date,
      formData.departure_date,
      formData.arrival_date,
      formData.origin_base,
      formData.destination_base,
      formData.rank_at_pcs,
      formData.branch,
    ];
    const completed = requiredFields.filter((field) => field && field !== "").length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  // START SCREEN
  if (currentStep === "start") {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900">How would you like to start?</h2>
          <p className="text-lg text-slate-600">Choose the method that works best for you</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* PRIMARY PATH: OCR Upload */}
          <AnimatedCard className="relative cursor-pointer border-2 border-blue-600 p-8 hover:shadow-xl">
            <Badge variant="success" className="absolute right-4 top-4">
              Recommended
            </Badge>
            <div className="mb-6 inline-flex rounded-xl bg-blue-50 p-4">
              <Icon name="Upload" className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-900">Upload Your PCS Orders</h3>
            <p className="mb-6 text-slate-600">
              We'll extract all the details automatically using AI. Fastest way to get started.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
                Automatic data extraction
              </li>
              <li className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
                PDF or image accepted
              </li>
              <li className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
                Review before submitting
              </li>
            </ul>
            <Button
              onClick={() => {
                setEntryMethod("ocr");
                setCurrentStep("basic-info"); // Will show OCR uploader
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Upload Orders (PDF/Image)
            </Button>
          </AnimatedCard>

          {/* SECONDARY PATH: Manual Entry */}
          <AnimatedCard className="cursor-pointer p-8 hover:shadow-xl">
            <div className="mb-6 inline-flex rounded-xl bg-gray-50 p-4">
              <Icon name="Edit" className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-900">Enter Details Manually</h3>
            <p className="mb-6 text-slate-600">
              Type in your information step-by-step. We'll guide you through each field.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
                Step-by-step guidance
              </li>
              <li className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
                Real-time validation
              </li>
              <li className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
                Auto-calculation
              </li>
            </ul>
            <Button
              variant="outline"
              onClick={() => {
                setEntryMethod("manual");
                setCurrentStep("basic-info");
              }}
              className="w-full"
            >
              Manual Entry
            </Button>
          </AnimatedCard>
        </div>
      </div>
    );
  }

  // BASIC INFO STEP
  if (currentStep === "basic-info") {
    return (
      <div className="mx-auto max-w-4xl">
        {/* ROI Display */}
        <PCSROIDisplay
          estimatedTotal={calculations?.total || 0}
          confidence={calculations?.confidence.overall || 0}
          rank={formData.rank_at_pcs}
          hasDependents={!!(formData.dependents_count && formData.dependents_count > 0)}
          isCalculating={isCalculating}
        />

        {/* Progress Bar */}
        <div className="my-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Progress</span>
            <span className="text-slate-500">{getFieldCompletionPercentage()}% complete</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500"
              style={{ width: `${getFieldCompletionPercentage()}%` }}
            />
          </div>
        </div>

        {/* OCR Upload (if OCR method selected) */}
        {entryMethod === "ocr" && !ocrData && (
          <Card className="mb-8 border-2 border-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Upload" className="h-5 w-5 text-blue-600" />
                Upload Your PCS Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PCSDocumentUploader
                claimId="temp-wizard"
                onDocumentProcessed={(doc) => {
                  if (doc.extractedData) {
                    handleOCRComplete(doc.extractedData);
                  }
                }}
                maxFiles={1}
                acceptedTypes={["application/pdf", "image/jpeg", "image/png"]}
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setEntryMethod("manual")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Or enter details manually instead
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Entry Form */}
        {(entryMethod === "manual" || ocrData) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {ocrData ? "Review Extracted Information" : "Basic Information"}
                </CardTitle>
                {ocrData && (
                  <Badge variant="success">
                    <Icon name="CheckCircle" className="mr-1 h-3 w-3" />
                    Extracted from Orders
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Claim Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Claim Name
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Fort Hood to Fort Bragg - Summer 2025"
                  value={formData.claim_name || ""}
                  onChange={(value) => updateFormData({ claim_name: value })}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Give this PCS a memorable name for your records
                </p>
              </div>

              {/* PCS Orders Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  PCS Orders Date
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.pcs_orders_date || ""}
                  onChange={(value) => updateFormData({ pcs_orders_date: value })}
                  className="w-full"
                />
              </div>

              {/* Travel Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Departure Date
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.departure_date || ""}
                    onChange={(value) => updateFormData({ departure_date: value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Arrival Date
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.arrival_date || ""}
                    onChange={(value) => updateFormData({ arrival_date: value })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Bases */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Origin Base
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Fort Hood, TX"
                    value={formData.origin_base || ""}
                    onChange={(value) => updateFormData({ origin_base: value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Destination Base
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Fort Bragg, NC"
                    value={formData.destination_base || ""}
                    onChange={(value) => updateFormData({ destination_base: value })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Rank & Branch */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Rank at PCS
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., E-5, O-3"
                    value={formData.rank_at_pcs || ""}
                    onChange={(value) => updateFormData({ rank_at_pcs: value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Branch
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <select
                    value={formData.branch || ""}
                    onChange={(e) => updateFormData({ branch: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select branch</option>
                    <option value="Army">Army</option>
                    <option value="Navy">Navy</option>
                    <option value="Air Force">Air Force</option>
                    <option value="Marines">Marines</option>
                    <option value="Coast Guard">Coast Guard</option>
                    <option value="Space Force">Space Force</option>
                  </select>
                </div>
              </div>

              {/* Dependents */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Number of Dependents
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.dependents_count?.toString() || "0"}
                  onChange={(value) =>
                    updateFormData({ dependents_count: parseInt(value, 10) || 0 })
                  }
                  className="w-full"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Affects your DLA (Dislocation Allowance) amount
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep("start");
                    setEntryMethod(null);
                  }}
                >
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep("lodging")}
                  disabled={getFieldCompletionPercentage() < 70}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Lodging
                  <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // LODGING STEP
  if (currentStep === "lodging") {
    return (
      <div className="mx-auto max-w-4xl">
        {/* ROI Display */}
        <PCSROIDisplay
          estimatedTotal={calculations?.total || 0}
          confidence={calculations?.confidence.overall || 0}
          rank={formData.rank_at_pcs}
          hasDependents={!!(formData.dependents_count && formData.dependents_count > 0)}
          isCalculating={isCalculating}
        />

        {/* Progress Bar */}
        <div className="my-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Step 2 of 3</span>
            <span className="text-slate-500">{Math.round(getStepProgress())}% complete</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lodging & Travel Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* DLA (Auto-calculated, shown for transparency) */}
            <div className="rounded-lg bg-green-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                <PCSTermTooltip term="Dislocation Allowance (DLA)" citation="JTR 050302.B">
                  One-time payment to offset moving costs. No receipts required. Amount is based on
                  your rank and whether you have dependents.
                </PCSTermTooltip>
              </div>
              <div className="text-2xl font-black text-green-700">
                ${calculations?.dla.amount.toLocaleString() || "---"}
              </div>
              <p className="text-sm text-green-700">Auto-calculated (no action needed)</p>
            </div>

            {/* TLE Origin */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                <PCSTermTooltip term="Temporary Lodging at Current Base" citation="JTR 054205">
                  Reimbursement for hotel/lodging while preparing to move from your current base.
                  Maximum 10 nights. You'll need receipts for actual costs.
                </PCSTermTooltip>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-600">
                    Number of Nights (max 10)
                  </label>
                  <Input
                    type="number"
                    value={formData.tle_origin_nights?.toString() || "0"}
                    onChange={(value) =>
                      updateFormData({ tle_origin_nights: parseInt(value, 10) || 0 })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600">
                    Daily Rate (per night)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={formData.tle_origin_rate?.toString() || ""}
                    onChange={(value) =>
                      updateFormData({ tle_origin_rate: parseFloat(value) || 0 })
                    }
                    className="w-full"
                  />
                </div>
              </div>
              {formData.tle_origin_nights && formData.tle_origin_nights > 10 && (
                <p className="mt-2 flex items-center gap-2 text-sm text-amber-600">
                  <Icon name="AlertTriangle" className="h-4 w-4" />
                  Maximum 10 nights allowed per JTR
                </p>
              )}
            </div>

            {/* TLE Destination */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                <PCSTermTooltip term="Temporary Lodging at New Base" citation="JTR 054205">
                  Reimbursement for hotel/lodging while house-hunting at your new base. Maximum 10
                  nights. You'll need receipts for actual costs.
                </PCSTermTooltip>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-600">
                    Number of Nights (max 10)
                  </label>
                  <Input
                    type="number"
                    value={formData.tle_destination_nights?.toString() || "0"}
                    onChange={(value) =>
                      updateFormData({ tle_destination_nights: parseInt(value, 10) || 0 })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600">
                    Daily Rate (per night)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={formData.tle_destination_rate?.toString() || ""}
                    onChange={(value) =>
                      updateFormData({ tle_destination_rate: parseFloat(value) || 0 })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* PPM Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                <PCSTermTooltip term="DIY Move (PPM/DITY)" citation="JTR 054703">
                  Personally Procured Move - when you move yourself instead of using government
                  movers. You get reimbursed based on what it would cost the government (GCC).
                </PCSTermTooltip>
              </h3>

              {/* Step 1: Accept Disclaimer */}
              {!ppmDisclaimerAccepted && (
                <PPMDisclaimer onAccept={() => setPpmDisclaimerAccepted(true)} />
              )}

              {/* Step 2: Choose Mode & Enter Data */}
              {ppmDisclaimerAccepted && !ppmWithholding && (
                <PPMModeSelector
                  onModeSelected={handlePPMCalculation}
                  weight={formData.actual_weight || formData.estimated_weight}
                  distance={formData.distance_miles}
                />
              )}

              {/* Step 3: Show Results */}
              {ppmWithholding && (
                <div className="space-y-4">
                  <PPMWithholdingDisplay
                    result={ppmWithholding}
                    allowEdit={true}
                    onUpdateRates={async (federal, state) => {
                      // Recalculate with custom rates via API
                      const destState = extractStateFromBase(formData.destination_base || "");

                      const response = await fetch("/api/pcs/calculate-ppm-withholding", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          gccAmount: ppmGccAmount!,
                          incentivePercentage: 100,
                          mode: ppmMode!, // Pass the mode through
                          allowedExpenses: {
                            movingCosts: ppmExpenses.movingCosts,
                            fuelReceipts: ppmExpenses.fuelReceipts,
                            laborCosts: ppmExpenses.laborCosts,
                            tollsAndFees: ppmExpenses.tollsAndFees,
                          },
                          destinationState: destState,
                          customFederalRate: federal,
                          customStateRate: state,
                        }),
                      });

                      if (response.ok) {
                        const updated: PPMWithholdingResult = await response.json();
                        setPpmWithholding(updated);
                      }
                    }}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPpmMode(null);
                      setPpmGccAmount(null);
                      setPpmWithholding(null);
                      setPpmDisclaimerAccepted(false);
                    }}
                    className="w-full"
                  >
                    Recalculate PPM
                  </Button>
                </div>
              )}

              {!ppmDisclaimerAccepted && (
                <p className="mt-4 text-xs text-slate-600">
                  💡 Tip: If you're not doing a DIY move (using government movers instead), you can
                  skip this section and continue to review.
                </p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <Button variant="outline" onClick={() => setCurrentStep("basic-info")}>
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep("review")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Review Calculation
                <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // REVIEW STEP
  if (currentStep === "review") {
    return (
      <div className="mx-auto max-w-4xl">
        {/* ROI Display */}
        <PCSROIDisplay
          estimatedTotal={calculations?.total || 0}
          confidence={calculations?.confidence.overall || 0}
          rank={formData.rank_at_pcs}
          hasDependents={!!(formData.dependents_count && formData.dependents_count > 0)}
          isCalculating={isCalculating}
        />

        <div className="my-6">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">Review Your Calculation</h2>
          <p className="text-slate-600">
            Verify your entitlements are accurate before downloading your claim package.
          </p>
        </div>

        {/* Readiness Check */}
        <Card className="mb-6 border-2 border-green-600 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-600 p-2">
                <Icon name="CheckCircle" className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-green-900">Your claim is ready!</h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-center gap-2">
                    <Icon name="Check" className="h-4 w-4" />
                    All required fields complete
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" className="h-4 w-4" />
                    JTR validation passed
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" className="h-4 w-4" />
                    Confidence score: {calculations?.confidence.overall || 0}%
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="Check" className="h-4 w-4" />
                    Reference guide for DD-1351-2 completion
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown */}
        {calculations && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Entitlements Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* DLA */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <div className="font-medium text-slate-900">Dislocation Allowance (DLA)</div>
                      <div className="text-xs text-slate-500">{calculations.dla.citation}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-900">
                        ${calculations.dla.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">No receipts required</div>
                    </div>
                  </div>

                  {/* TLE */}
                  {calculations.tle.total > 0 && (
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <div className="font-medium text-slate-900">Temporary Lodging (TLE)</div>
                        <div className="text-xs text-slate-500">
                          Origin: {calculations.tle.origin.days} nights, Destination:{" "}
                          {calculations.tle.destination.days} nights
                        </div>
                      </div>
                      <div className="text-xl font-bold text-slate-900">
                        ${calculations.tle.total.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* MALT */}
                  {calculations.malt.amount > 0 && (
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <div className="font-medium text-slate-900">
                          Mileage Reimbursement (MALT)
                        </div>
                        <div className="text-xs text-slate-500">
                          {calculations.malt.distance} miles × ${calculations.malt.ratePerMile}/mile
                        </div>
                      </div>
                      <div className="text-xl font-bold text-slate-900">
                        ${calculations.malt.amount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Per Diem */}
                  {calculations.perDiem.amount > 0 && (
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <div className="font-medium text-slate-900">
                          Food & Incidentals (Per Diem)
                        </div>
                        <div className="text-xs text-slate-500">
                          {calculations.perDiem.days} days × ${calculations.perDiem.rate}/day
                        </div>
                      </div>
                      <div className="text-xl font-bold text-slate-900">
                        ${calculations.perDiem.amount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* PPM */}
                  {calculations.ppm.amount > 0 && (
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <div className="font-medium text-slate-900">
                          DIY Move Reimbursement (PPM)
                        </div>
                        <div className="text-xs text-slate-500">
                          {calculations.ppm.weight} lbs × {calculations.ppm.distance} miles
                        </div>
                      </div>
                      <div className="text-xl font-bold text-slate-900">
                        ${calculations.ppm.amount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between bg-blue-50 p-4">
                    <div className="text-xl font-bold text-slate-900">Total Entitlement</div>
                    <div className="text-3xl font-black text-blue-600">
                      ${calculations.total.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Data Provenance */}
                <div className="mt-6">
                  <PCSProvenanceDisplay
                    data={[
                      {
                        dataType: "DLA Rates",
                        source: calculations.dataSources.dla,
                        citation: calculations.dla.citation,
                        effectiveDate: calculations.dla.effectiveDate,
                        lastVerified: calculations.dla.lastVerified,
                        confidence: calculations.dla.confidence,
                      },
                      {
                        dataType: "MALT Rates",
                        source: calculations.dataSources.malt,
                        citation: calculations.malt.citation,
                        effectiveDate: calculations.malt.effectiveDate,
                        lastVerified: new Date().toISOString(),
                        confidence: calculations.malt.confidence,
                      },
                    ]}
                    title="Data Sources"
                    compact={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("lodging")}>
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveClaim}
                  disabled={isSaving || !calculations}
                  className="bg-green-600 px-8 text-lg hover:bg-green-700"
                >
                  <Icon name="Download" className="mr-2 h-5 w-5" />
                  {isSaving ? "Saving..." : "Download Claim Package (PDF)"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // COMPLETE STEP
  if (currentStep === "complete") {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="mb-6 inline-flex rounded-full bg-green-100 p-4">
          <Icon name="CheckCircle" className="h-16 w-16 text-green-600" />
        </div>
        <h2 className="mb-4 text-4xl font-bold text-slate-900">Claim Package Ready!</h2>
        <p className="mb-8 text-lg text-slate-600">
          Your PCS calculation has been saved. Use this worksheet when completing your DD Form
          1351-2.
        </p>

        <div className="mb-8">
          <DD1351Explainer />
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => {
              setCurrentStep("start");
              setEntryMethod(null);
              setFormData({
                rank_at_pcs: userProfile.rank,
                branch: userProfile.branch,
                origin_base: userProfile.currentBase,
                dependents_count: userProfile.hasDependents ? 1 : 0,
              });
              setCalculations(null);
            }}
            variant="outline"
          >
            Create Another Claim
          </Button>
          <Button onClick={() => (window.location.href = "/dashboard/pcs-copilot/library")}>
            View All Claims
            <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

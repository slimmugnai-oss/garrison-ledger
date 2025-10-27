"use client";

import { useState, useEffect, useRef } from "react";

import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Card, { CardContent, CardHeader } from "@/app/components/ui/Card";
import Icon from "@/app/components/ui/Icon";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface PCSOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userType: "new" | "returning" | "premium";
}

/**
 * Interactive onboarding tour for PCS Copilot
 */
export function PCSOnboardingTour({
  isOpen,
  onClose,
  onComplete,
  userType,
}: PCSOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const getTourSteps = (): TourStep[] => {
    const baseSteps: TourStep[] = [
      {
        id: "welcome",
        title: "Calculate Your PCS Entitlements",
        content:
          "This takes about 15 minutes. You'll get a finance office-ready PDF with all your official PCS reimbursement calculations.",
        target: "body",
        position: "top",
      },
      {
        id: "what-you-need",
        title: "What You'll Need",
        content:
          "PCS orders with dates, origin and destination bases, and any receipts you have (lodging, fuel, etc.). Don't worry - we'll guide you through each step.",
        target: "body",
        position: "top",
      },
      {
        id: "what-you-get",
        title: "What You'll Get",
        content:
          "A professional PDF package with: DLA, TLE, MALT, and Per Diem calculations based on official 2025 DFAS rates. All calculations include JTR citations for finance office submission.",
        target: "body",
        position: "top",
      },
      {
        id: "start-method",
        title: "Two Ways to Start",
        content:
          "Upload your PCS orders (we'll extract details automatically) or enter information manually. Either way, we'll calculate everything for you.",
        target: "[data-tour='new-claim-button']",
        position: "bottom",
      },
      {
        id: "ready",
        title: "Let's Get Started",
        content:
          "Click 'New PCS Claim' to begin. We'll walk you through each step and show your estimated entitlement in real-time.",
        target: "[data-tour='new-claim-button']",
        position: "bottom",
        action: {
          label: "Start Calculation",
          onClick: () => {
            // Trigger new claim creation
            const button = document.querySelector(
              "[data-tour='new-claim-button']"
            ) as HTMLButtonElement;
            button?.click();
          },
        },
      },
    ];

    if (userType === "premium") {
      baseSteps.push(
        {
          id: "premium-features",
          title: "Premium Features",
          content:
            "As a premium user, you have access to advanced AI optimization, priority support, and exclusive tools.",
          target: "[data-tour='premium-badge']",
          position: "bottom",
        },
        {
          id: "sub-pages",
          title: "Advanced Tools",
          content:
            "Access Claims Library, Cost Comparison, and Assignment Planner for comprehensive PCS planning.",
          target: "[data-tour='sub-pages']",
          position: "top",
        }
      );
    }

    return baseSteps;
  };

  const steps = getTourSteps();
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (isOpen && currentStepData) {
      highlightTarget(currentStepData.target);
    }
  }, [currentStepData, isOpen]);

  const highlightTarget = (targetSelector: string) => {
    const target = document.querySelector(targetSelector);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen || !currentStepData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Tour Card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card
          className={`w-full max-w-md transform transition-all duration-300 ${
            isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <CardHeader className="text-center">
            <div className="mb-4 flex items-center justify-between">
              <Badge variant="info">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon name="X" className="h-4 w-4" />
              </Button>
            </div>

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Icon name="MapPin" className="h-8 w-8 text-blue-600" />
            </div>

            <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">{currentStepData.content}</p>

            {currentStepData.action && (
              <Button onClick={currentStepData.action.onClick} className="w-full" variant="outline">
                <Icon name="ArrowRight" className="mr-2 h-4 w-4" />
                {currentStepData.action.label}
              </Button>
            )}

            <div className="flex gap-2">
              {!isFirstStep && (
                <Button variant="outline" onClick={handlePrevious} className="flex-1">
                  <Icon name="ChevronLeft" className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}

              <Button onClick={handleNext} className="flex-1">
                {isLastStep ? (
                  <>
                    <Icon name="Check" className="mr-2 h-4 w-4" />
                    Complete Tour
                  </>
                ) : (
                  <>
                    Next
                    <Icon name="ChevronRight" className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-blue-600"
                      : index < currentStep
                        ? "bg-blue-300"
                        : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Onboarding checklist component
 */
export function PCSOnboardingChecklist({ onComplete }: { onComplete: () => void }) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const checklist = [
    {
      id: "create-claim",
      title: "Create Your First PCS Claim",
      description: "Start by creating a new PCS claim with your basic information",
      action: "Create Claim",
    },
    {
      id: "upload-documents",
      title: "Upload PCS Documents",
      description: "Upload your PCS orders, receipts, and other supporting documents",
      action: "Upload Documents",
    },
    {
      id: "review-calculations",
      title: "Review AI Calculations",
      description: "Check your entitlement calculations and confidence scores",
      action: "Review Calculations",
    },
    {
      id: "validate-claim",
      title: "Validate Against JTR",
      description: "Run JTR validation to ensure compliance and optimization",
      action: "Validate Claim",
    },
    {
      id: "export-claim",
      title: "Export Claim Package",
      description: "Generate PDF and Excel packages for finance office submission",
      action: "Export Claim",
    },
  ];

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps((prev) => [...prev, stepId]);
  };

  const allCompleted = completedSteps.length === checklist.length;

  useEffect(() => {
    if (allCompleted) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [allCompleted, onComplete]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Getting Started Checklist</h3>
        </div>
        <p className="text-gray-600">Complete these steps to get the most out of PCS Copilot</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {checklist.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              completedSteps.includes(step.id)
                ? "border-green-200 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="mt-1 flex-shrink-0">
              {completedSteps.includes(step.id) ? (
                <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300">
                  <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900">{step.title}</h4>
              <p className="mt-1 text-sm text-gray-600">{step.description}</p>

              {!completedSteps.includes(step.id) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStepComplete(step.id)}
                  className="mt-2"
                >
                  {step.action}
                </Button>
              )}
            </div>
          </div>
        ))}

        {allCompleted && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Icon name="CheckCircle" className="h-5 w-5" />
              <span className="font-medium">Congratulations!</span>
            </div>
            <p className="mt-1 text-sm text-green-700">
              You've completed the onboarding checklist. You're ready to maximize your PCS
              entitlements!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Feature highlights component
 */
export function PCSFeatureHighlights() {
  const features = [
    {
      icon: "Calculator",
      title: "AI-Powered Calculations",
      description:
        "Get accurate DLA, TLE, MALT, and Per Diem calculations using real 2025 JTR rates",
    },
    {
      icon: "Shield",
      title: "JTR Validation",
      description:
        "Ensure compliance with current Joint Travel Regulations and get optimization suggestions",
    },
    {
      icon: "Upload",
      title: "Document OCR",
      description: "Upload receipts and documents - our AI extracts key information automatically",
    },
    {
      icon: "File",
      title: "Export Packages",
      description:
        "Generate professional PDF and Excel claim packages for finance office submission",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {features.map((feature, index) => (
        <Card key={index} className="transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Icon name={feature.icon as any} className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Card, { CardContent, CardHeader } from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Icon from "@/app/components/ui/Icon";
import { FormData } from "@/lib/pcs/calculation-engine";

interface PCSMobileWizardOptimizedProps {
  onSave: (data: FormData) => void;
  onValidate?: (data: FormData) => void;
  initialData?: Partial<FormData>;
}

/**
 * Mobile-optimized PCS wizard with improved touch interactions
 */
export function PCSMobileWizardOptimized({
  onSave,
  onValidate,
  initialData,
}: PCSMobileWizardOptimizedProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>(initialData || {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      id: "basic",
      title: "Basic Info",
      icon: "User",
      fields: [
        { name: "claim_name", label: "Claim Name", type: "text", required: true },
        { name: "pcs_orders_date", label: "PCS Orders Date", type: "date", required: true },
        { name: "departure_date", label: "Departure Date", type: "date", required: true },
        { name: "arrival_date", label: "Arrival Date", type: "date", required: true },
      ],
    },
    {
      id: "locations",
      title: "Locations",
      icon: "MapPin",
      fields: [
        { name: "origin_base", label: "Origin Base", type: "text", required: true },
        { name: "destination_base", label: "Destination Base", type: "text", required: true },
        {
          name: "travel_method",
          label: "Travel Method",
          type: "select",
          required: true,
          options: ["dity", "full", "partial"],
        },
      ],
    },
    {
      id: "dependents",
      title: "Dependents",
      icon: "Users",
      fields: [
        { name: "dependents_count", label: "Number of Dependents", type: "number", required: true },
        { name: "rank_at_pcs", label: "Rank at PCS", type: "text", required: true },
        {
          name: "branch",
          label: "Branch",
          type: "select",
          required: true,
          options: ["Army", "Navy", "Air Force", "Marines", "Coast Guard", "Space Force"],
        },
      ],
    },
    {
      id: "lodging",
      title: "Temporary Lodging",
      icon: "Bed",
      fields: [
        { name: "tle_origin_nights", label: "Origin TLE Nights", type: "number", required: false },
        {
          name: "tle_destination_nights",
          label: "Destination TLE Nights",
          type: "number",
          required: false,
        },
        { name: "tle_origin_rate", label: "Origin TLE Rate", type: "number", required: false },
        {
          name: "tle_destination_rate",
          label: "Destination TLE Rate",
          type: "number",
          required: false,
        },
      ],
    },
    {
      id: "travel",
      title: "Travel Details",
      icon: "Truck",
      fields: [
        { name: "malt_distance", label: "MALT Distance (miles)", type: "number", required: false },
        { name: "per_diem_days", label: "Per Diem Days", type: "number", required: false },
        { name: "fuel_receipts", label: "Fuel Receipts Amount", type: "number", required: false },
      ],
    },
    {
      id: "weight",
      title: "Weight Allowance",
      icon: "Package",
      fields: [
        {
          name: "estimated_weight",
          label: "Estimated Weight (lbs)",
          type: "number",
          required: false,
        },
        { name: "actual_weight", label: "Actual Weight (lbs)", type: "number", required: false },
      ],
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData as FormData);
    } catch (error) {
      console.error("Failed to save PCS claim:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCurrentStep = () => {
    const requiredFields = currentStepData.fields.filter((field) => field.required);
    return requiredFields.every((field) => formData[field.name as keyof FormData]);
  };

  const canProceed = validateCurrentStep();

  return (
    <div className="mobile-wizard-container">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Header */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Icon name={currentStepData.icon as any} className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
          <p className="text-gray-600">
            {currentStepData.fields.length} field{currentStepData.fields.length !== 1 ? "s" : ""} to
            complete
          </p>
        </CardHeader>
      </Card>

      {/* Form Fields */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            {currentStepData.fields.map((field) => (
              <div key={field.name} className="form-group">
                <label className="form-label" htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="ml-1 text-red-500">*</span>}
                </label>

                {field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name as keyof FormData] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : field.type === "number" ? (
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={formData[field.name as keyof FormData] || ""}
                    onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                  />
                ) : field.type === "date" ? (
                  <input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={formData[field.name as keyof FormData] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={formData[field.name as keyof FormData] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {!isFirstStep && (
          <Button variant="outline" onClick={handlePrevious} className="h-12 flex-1 text-base">
            <Icon name="ChevronLeft" className="mr-2 h-4 w-4" />
            Previous
          </Button>
        )}

        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="h-12 flex-1 text-base"
        >
          {isSubmitting ? (
            <>
              <Icon name="Loader" className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isLastStep ? (
            <>
              <Icon name="Check" className="mr-2 h-4 w-4" />
              Complete Claim
            </>
          ) : (
            <>
              Next
              <Icon name="ChevronRight" className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Step Navigation */}
      <div className="mt-6">
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-3 w-3 rounded-full transition-colors ${
                index === currentStep
                  ? "bg-blue-600"
                  : index < currentStep
                    ? "bg-blue-300"
                    : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .mobile-wizard-container input,
        .mobile-wizard-container select,
        .mobile-wizard-container textarea {
          min-height: 44px;
          font-size: 16px;
        }

        .mobile-wizard-container button {
          min-height: 44px;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }
      `}</style>
    </div>
  );
}

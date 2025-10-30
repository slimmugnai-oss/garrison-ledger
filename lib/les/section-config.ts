/**
 * LES SECTION CONFIGURATION
 * 
 * Shared constants for section colors, icons, and labels
 * Single source of truth for all LES section UI
 */

import type { LesSection } from "@/app/types/les";

export const SECTION_COLORS: Record<LesSection, string> = {
  ALLOWANCE: "border-green-200 bg-green-50",
  TAX: "border-red-200 bg-red-50",
  DEDUCTION: "border-orange-200 bg-orange-50",
  ALLOTMENT: "border-blue-200 bg-blue-50",
  DEBT: "border-gray-200 bg-gray-50",
  ADJUSTMENT: "border-purple-200 bg-purple-50",
  OTHER: "border-gray-200 bg-gray-50",
};

export const SECTION_ICON_COLORS: Record<LesSection, string> = {
  ALLOWANCE: "text-green-600",
  TAX: "text-red-600",
  DEDUCTION: "text-orange-600",
  ALLOTMENT: "text-blue-600",
  DEBT: "text-gray-600",
  ADJUSTMENT: "text-purple-600",
  OTHER: "text-gray-600",
};

export const SECTION_ICONS: Record<LesSection, string> = {
  ALLOWANCE: "DollarSign",
  TAX: "Landmark",
  DEDUCTION: "Calculator",
  ALLOTMENT: "Banknote",
  DEBT: "AlertCircle",
  ADJUSTMENT: "RefreshCw",
  OTHER: "File",
};

export const SECTION_LABELS: Record<LesSection, string> = {
  ALLOWANCE: "Allowances",
  TAX: "Taxes",
  DEDUCTION: "Deductions",
  ALLOTMENT: "Allotments",
  DEBT: "Debts",
  ADJUSTMENT: "Adjustments",
  OTHER: "Other",
};

/**
 * Get full section configuration
 */
export function getSectionConfig(section: LesSection) {
  return {
    section,
    label: SECTION_LABELS[section],
    icon: SECTION_ICONS[section],
    iconColor: SECTION_ICON_COLORS[section],
    color: SECTION_COLORS[section],
  };
}


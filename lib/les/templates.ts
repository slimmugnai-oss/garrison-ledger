/**
 * LES LINE ITEM TEMPLATES
 *
 * Pre-configured line item sets for common military pay scenarios
 * Users can select a template to pre-populate common fields
 */

import type { LineCodeOption, LesSection } from "@/app/types/les";

export interface LineItemTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  presetLines: Array<{
    code: string;
    section: LesSection;
    description: string;
    amountCents: number; // 0 = user must fill
    required: boolean; // If true, line is locked/prominent
  }>;
}

export const TEMPLATES: LineItemTemplate[] = [
  {
    id: "standard",
    name: "Standard Pay",
    description: "Base pay, BAH, BAS, and standard deductions",
    icon: "File",
    presetLines: [
      {
        code: "BASEPAY",
        section: "ALLOWANCE",
        description: "Base Pay",
        amountCents: 0,
        required: true,
      },
      {
        code: "BAH",
        section: "ALLOWANCE",
        description: "Basic Allowance for Housing",
        amountCents: 0,
        required: true,
      },
      {
        code: "BAS",
        section: "ALLOWANCE",
        description: "Basic Allowance for Subsistence",
        amountCents: 0,
        required: true,
      },
      {
        code: "TAX_FED",
        section: "TAX",
        description: "Federal Income Tax",
        amountCents: 0,
        required: true,
      },
      {
        code: "FICA",
        section: "TAX",
        description: "FICA (Social Security)",
        amountCents: 0,
        required: false,
      },
      {
        code: "MEDICARE",
        section: "TAX",
        description: "Medicare Tax",
        amountCents: 0,
        required: false,
      },
      {
        code: "TSP",
        section: "DEDUCTION",
        description: "Thrift Savings Plan",
        amountCents: 0,
        required: false,
      },
      {
        code: "SGLI",
        section: "DEDUCTION",
        description: "SGLI Life Insurance",
        amountCents: 0,
        required: false,
      },
    ],
  },
  {
    id: "oconus",
    name: "OCONUS / Deployed",
    description: "Standard pay + COLA and deployment allowances",
    icon: "Shield",
    presetLines: [
      {
        code: "BASEPAY",
        section: "ALLOWANCE",
        description: "Base Pay",
        amountCents: 0,
        required: true,
      },
      {
        code: "BAH",
        section: "ALLOWANCE",
        description: "Basic Allowance for Housing",
        amountCents: 0,
        required: true,
      },
      {
        code: "BAS",
        section: "ALLOWANCE",
        description: "Basic Allowance for Subsistence",
        amountCents: 0,
        required: true,
      },
      {
        code: "COLA",
        section: "ALLOWANCE",
        description: "Cost of Living Allowance",
        amountCents: 0,
        required: false,
      },
      {
        code: "HFP",
        section: "ALLOWANCE",
        description: "Hostile Fire Pay / Imminent Danger Pay",
        amountCents: 0,
        required: false,
      },
      {
        code: "TAX_FED",
        section: "TAX",
        description: "Federal Income Tax",
        amountCents: 0,
        required: true,
      },
      {
        code: "FICA",
        section: "TAX",
        description: "FICA (Social Security)",
        amountCents: 0,
        required: false,
      },
      {
        code: "MEDICARE",
        section: "TAX",
        description: "Medicare Tax",
        amountCents: 0,
        required: false,
      },
      {
        code: "TSP",
        section: "DEDUCTION",
        description: "Thrift Savings Plan",
        amountCents: 0,
        required: false,
      },
      {
        code: "SGLI",
        section: "DEDUCTION",
        description: "SGLI Life Insurance",
        amountCents: 0,
        required: false,
      },
    ],
  },
  {
    id: "special-duty",
    name: "Special Duty",
    description: "Includes special pays like SDAP, Flight Pay, etc.",
    icon: "Star",
    presetLines: [
      {
        code: "BASEPAY",
        section: "ALLOWANCE",
        description: "Base Pay",
        amountCents: 0,
        required: true,
      },
      {
        code: "BAH",
        section: "ALLOWANCE",
        description: "Basic Allowance for Housing",
        amountCents: 0,
        required: true,
      },
      {
        code: "BAS",
        section: "ALLOWANCE",
        description: "Basic Allowance for Subsistence",
        amountCents: 0,
        required: true,
      },
      {
        code: "SDAP",
        section: "ALLOWANCE",
        description: "Special Duty Assignment Pay",
        amountCents: 0,
        required: false,
      },
      {
        code: "FLIGHT_PAY",
        section: "ALLOWANCE",
        description: "Aviation Career Incentive Pay",
        amountCents: 0,
        required: false,
      },
      {
        code: "TAX_FED",
        section: "TAX",
        description: "Federal Income Tax",
        amountCents: 0,
        required: true,
      },
      {
        code: "FICA",
        section: "TAX",
        description: "FICA (Social Security)",
        amountCents: 0,
        required: false,
      },
      {
        code: "MEDICARE",
        section: "TAX",
        description: "Medicare Tax",
        amountCents: 0,
        required: false,
      },
      {
        code: "TSP",
        section: "DEDUCTION",
        description: "Thrift Savings Plan",
        amountCents: 0,
        required: false,
      },
      {
        code: "SGLI",
        section: "DEDUCTION",
        description: "SGLI Life Insurance",
        amountCents: 0,
        required: false,
      },
    ],
  },
  {
    id: "navy-sea",
    name: "Navy / Sea Duty",
    description: "Includes sea pay and submarine duty pay",
    icon: "Shield",
    presetLines: [
      {
        code: "BASEPAY",
        section: "ALLOWANCE",
        description: "Base Pay",
        amountCents: 0,
        required: true,
      },
      {
        code: "BAH",
        section: "ALLOWANCE",
        description: "Basic Allowance for Housing",
        amountCents: 0,
        required: true,
      },
      {
        code: "BAS",
        section: "ALLOWANCE",
        description: "Basic Allowance for Subsistence",
        amountCents: 0,
        required: true,
      },
      {
        code: "SEA_PAY",
        section: "ALLOWANCE",
        description: "Career Sea Pay",
        amountCents: 0,
        required: false,
      },
      {
        code: "SUB_PAY",
        section: "ALLOWANCE",
        description: "Submarine Duty Pay",
        amountCents: 0,
        required: false,
      },
      {
        code: "TAX_FED",
        section: "TAX",
        description: "Federal Income Tax",
        amountCents: 0,
        required: true,
      },
      {
        code: "FICA",
        section: "TAX",
        description: "FICA (Social Security)",
        amountCents: 0,
        required: false,
      },
      {
        code: "MEDICARE",
        section: "TAX",
        description: "Medicare Tax",
        amountCents: 0,
        required: false,
      },
      {
        code: "TSP",
        section: "DEDUCTION",
        description: "Thrift Savings Plan",
        amountCents: 0,
        required: false,
      },
      {
        code: "SGLI",
        section: "DEDUCTION",
        description: "SGLI Life Insurance",
        amountCents: 0,
        required: false,
      },
    ],
  },
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch and add your own items",
    icon: "Edit",
    presetLines: [],
  },
];

/**
 * Convert template to DynamicLineItem array
 */
export function templateToLineItems(
  templateId: string
): Array<Omit<import("@/app/types/les").DynamicLineItem, "id">> {
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) return [];

  return template.presetLines.map((preset) => ({
    line_code: preset.code,
    description: preset.description,
    amount_cents: preset.amountCents,
    section: preset.section,
    isCustom: false,
    isParsed: false,
  }));
}

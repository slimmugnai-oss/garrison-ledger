/**
 * LINE ITEM CONVERTER
 *
 * Convert DynamicLineItem[] to AuditInputs format for audit computation
 */

import type { DynamicLineItem } from "@/app/types/les";
import type { AuditInputs } from "@/app/hooks/useLesAudit";

/**
 * Convert dynamic line items to audit input format
 */
export function convertLineItemsToAuditInputs(
  lineItems: DynamicLineItem[],
  month: number | null,
  year: number | null,
  profile: {
    paygrade: string;
    yos: number;
    mhaOrZip: string;
    withDependents: boolean;
  } | null
): AuditInputs {
  // Group items by section
  const allowances = lineItems
    .filter((item) => item.section === "ALLOWANCE")
    .map((item) => ({
      code: item.line_code,
      description: item.description,
      amount_cents: item.amount_cents,
    }));

  const taxes = lineItems
    .filter((item) => item.section === "TAX")
    .map((item) => ({
      code: item.line_code,
      description: item.description,
      amount_cents: item.amount_cents,
    }));

  const deductions = lineItems
    .filter((item) => item.section === "DEDUCTION")
    .map((item) => ({
      code: item.line_code,
      description: item.description,
      amount_cents: item.amount_cents,
    }));

  const allotments = lineItems
    .filter((item) => item.section === "ALLOTMENT")
    .map((item) => ({
      code: item.line_code,
      description: item.description,
      amount_cents: item.amount_cents,
    }));

  const debts = lineItems
    .filter((item) => item.section === "DEBT")
    .map((item) => ({
      code: item.line_code,
      description: item.description,
      amount_cents: item.amount_cents,
    }));

  const adjustments = lineItems
    .filter((item) => item.section === "ADJUSTMENT" || item.section === "OTHER")
    .map((item) => ({
      code: item.line_code,
      description: item.description,
      amount_cents: item.amount_cents,
    }));

  // Find net pay (if any line is NET_PAY or we can calculate it)
  let netPay: number | undefined;
  const netPayItem = lineItems.find(
    (item) => item.line_code === "NET_PAY" || item.description.toLowerCase().includes("net pay")
  );
  if (netPayItem) {
    netPay = netPayItem.amount_cents;
  }

  return {
    month,
    year,
    profile,
    actual: {
      allowances,
      taxes,
      deductions,
      allotments,
      debts,
      adjustments,
    },
    net_pay_cents: netPay,
  };
}

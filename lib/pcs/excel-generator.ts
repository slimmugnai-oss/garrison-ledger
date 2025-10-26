/**
 * PCS CLAIM EXCEL GENERATOR
 *
 * Generates Excel workbooks with:
 * - Itemized expense breakdown
 * - Receipt tracking and categorization
 * - JTR compliance validation results
 * - Finance office submission format
 */

import * as XLSX from "xlsx";
import { logger } from "@/lib/logger";

export interface PCSClaimData {
  id: string;
  claim_name: string;
  member_name: string;
  rank: string;
  branch: string;
  origin_base: string;
  destination_base: string;
  pcs_orders_date: string;
  departure_date: string;
  dependents_authorized: boolean;
  dependents_count: number;
  estimated_weight: number;
  travel_method: "dity" | "full" | "partial";
  distance: number;
  created_at: string;
  updated_at: string;
}

export interface PCSDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  ocr_text?: string;
  extracted_data?: {
    amount?: number;
    date?: string;
    vendor?: string;
    category?: string;
  };
  uploaded_at: string;
}

export interface PCSCalculations {
  dla: {
    amount: number;
    confidence: number;
    source: string;
    lastVerified: string;
  };
  tle: {
    amount: number;
    confidence: number;
    source: string;
    lastVerified: string;
  };
  malt: {
    amount: number;
    confidence: number;
    source: string;
    lastVerified: string;
  };
  per_diem: {
    amount: number;
    confidence: number;
    source: string;
    lastVerified: string;
  };
  ppm: {
    amount: number;
    confidence: number;
    source: string;
    lastVerified: string;
  };
  total_entitlements: number;
  confidence: {
    overall: number;
    dataSources: Record<string, string>;
  };
}

export interface ValidationResult {
  rule_code: string;
  rule_title: string;
  category: string;
  severity: "error" | "warning" | "info";
  message: string;
  jtr_citation?: string;
  suggested_fix?: string;
}

/**
 * Generate Excel workbook for PCS claim
 */
export async function generatePCSClaimExcel(
  claimData: PCSClaimData,
  calculations: PCSCalculations,
  documents: PCSDocument[],
  validationResults: ValidationResult[]
): Promise<Buffer> {
  try {
    const workbook = XLSX.utils.book_new();

    // Create claim summary sheet
    const summarySheet = createClaimSummarySheet(claimData, calculations);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Claim Summary");

    // Create calculations sheet
    const calculationsSheet = createCalculationsSheet(calculations);
    XLSX.utils.book_append_sheet(workbook, calculationsSheet, "Calculations");

    // Create documents sheet
    const documentsSheet = createDocumentsSheet(documents);
    XLSX.utils.book_append_sheet(workbook, documentsSheet, "Documents");

    // Create validation sheet
    const validationSheet = createValidationSheet(validationResults);
    XLSX.utils.book_append_sheet(workbook, validationSheet, "Validation");

    // Create expense breakdown sheet
    const expenseSheet = createExpenseBreakdownSheet(documents);
    XLSX.utils.book_append_sheet(workbook, expenseSheet, "Expense Breakdown");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      compression: true,
    });

    logger.info("PCS claim Excel workbook generated", {
      claimId: claimData.id,
      sheets: workbook.SheetNames.length,
      size: excelBuffer.length,
    });

    return Buffer.from(excelBuffer);
  } catch (error) {
    logger.error("Failed to generate PCS claim Excel:", error);
    throw new Error("Excel generation failed");
  }
}

/**
 * Create claim summary sheet
 */
function createClaimSummarySheet(claimData: PCSClaimData, calculations: PCSCalculations) {
  const summaryData = [
    ["PCS CLAIM SUMMARY", ""],
    ["", ""],
    ["Claim Information", ""],
    ["Claim Name", claimData.claim_name],
    ["Member Name", claimData.member_name],
    ["Rank", claimData.rank],
    ["Branch", claimData.branch],
    ["Origin Base", claimData.origin_base],
    ["Destination Base", claimData.destination_base],
    ["Orders Date", claimData.pcs_orders_date],
    ["Departure Date", claimData.departure_date],
    ["Dependents Authorized", claimData.dependents_authorized ? "Yes" : "No"],
    ["Dependents Count", claimData.dependents_count],
    ["Estimated Weight", `${claimData.estimated_weight} lbs`],
    ["Travel Method", claimData.travel_method.toUpperCase()],
    ["Distance", `${claimData.distance} miles`],
    ["", ""],
    ["Entitlements Summary", ""],
    ["Total Estimated Entitlements", `$${calculations.total_entitlements.toFixed(2)}`],
    ["", ""],
    ["Individual Entitlements", ""],
    ["DLA", `$${calculations.dla.amount.toFixed(2)}`],
    ["TLE", `$${calculations.tle.amount.toFixed(2)}`],
    ["MALT", `$${calculations.malt.amount.toFixed(2)}`],
    ["Per Diem", `$${calculations.per_diem.amount.toFixed(2)}`],
    ["PPM", `$${calculations.ppm.amount.toFixed(2)}`],
    ["", ""],
    ["Data Confidence", ""],
    ["Overall Confidence", `${(calculations.confidence.overall * 100).toFixed(1)}%`],
    ["DLA Confidence", `${(calculations.dla.confidence * 100).toFixed(1)}%`],
    ["TLE Confidence", `${(calculations.tle.confidence * 100).toFixed(1)}%`],
    ["MALT Confidence", `${(calculations.malt.confidence * 100).toFixed(1)}%`],
    ["Per Diem Confidence", `${(calculations.per_diem.confidence * 100).toFixed(1)}%`],
    ["PPM Confidence", `${(calculations.ppm.confidence * 100).toFixed(1)}%`],
    ["", ""],
    ["Generated", new Date().toLocaleString()],
    ["Source", "Garrison Ledger PCS Copilot"],
  ];

  return XLSX.utils.aoa_to_sheet(summaryData);
}

/**
 * Create calculations sheet
 */
function createCalculationsSheet(calculations: PCSCalculations) {
  const calculationsData = [
    ["CALCULATIONS BREAKDOWN", "", "", "", ""],
    ["", "", "", "", ""],
    ["Entitlement", "Amount", "Confidence", "Source", "Last Verified"],
    [
      "DLA (Dislocation Allowance)",
      `$${calculations.dla.amount.toFixed(2)}`,
      `${(calculations.dla.confidence * 100).toFixed(1)}%`,
      calculations.dla.source,
      calculations.dla.lastVerified,
    ],
    [
      "TLE (Temporary Lodging)",
      `$${calculations.tle.amount.toFixed(2)}`,
      `${(calculations.tle.confidence * 100).toFixed(1)}%`,
      calculations.tle.source,
      calculations.tle.lastVerified,
    ],
    [
      "MALT (Mileage Allowance)",
      `$${calculations.malt.amount.toFixed(2)}`,
      `${(calculations.malt.confidence * 100).toFixed(1)}%`,
      calculations.malt.source,
      calculations.malt.lastVerified,
    ],
    [
      "Per Diem",
      `$${calculations.per_diem.amount.toFixed(2)}`,
      `${(calculations.per_diem.confidence * 100).toFixed(1)}%`,
      calculations.per_diem.source,
      calculations.per_diem.lastVerified,
    ],
    [
      "PPM (Personally Procured Move)",
      `$${calculations.ppm.amount.toFixed(2)}`,
      `${(calculations.ppm.confidence * 100).toFixed(1)}%`,
      calculations.ppm.source,
      calculations.ppm.lastVerified,
    ],
    ["", "", "", "", ""],
    ["TOTAL ENTITLEMENTS", `$${calculations.total_entitlements.toFixed(2)}`, "", "", ""],
    ["", "", "", "", ""],
    ["Data Sources", "", "", "", ""],
    ...Object.entries(calculations.confidence.dataSources).map(([source, status]) => [
      source,
      status,
      "",
      "",
      "",
    ]),
  ];

  return XLSX.utils.aoa_to_sheet(calculationsData);
}

/**
 * Create documents sheet
 */
function createDocumentsSheet(documents: PCSDocument[]) {
  const documentsData = [
    ["SUPPORTING DOCUMENTS", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["Document Name", "Type", "Size (KB)", "Uploaded", "Amount", "Vendor", "Date"],
    ...documents.map((doc) => [
      doc.name,
      doc.type,
      (doc.size / 1024).toFixed(1),
      new Date(doc.uploaded_at).toLocaleDateString(),
      doc.extracted_data?.amount ? `$${doc.extracted_data.amount.toFixed(2)}` : "",
      doc.extracted_data?.vendor || "",
      doc.extracted_data?.date || "",
    ]),
  ];

  return XLSX.utils.aoa_to_sheet(documentsData);
}

/**
 * Create validation sheet
 */
function createValidationSheet(validationResults: ValidationResult[]) {
  const validationData = [
    ["JTR COMPLIANCE VALIDATION", "", "", "", ""],
    ["", "", "", "", ""],
    ["Rule Code", "Rule Title", "Severity", "Message", "Suggested Fix"],
    ...validationResults.map((result) => [
      result.rule_code,
      result.rule_title,
      result.severity.toUpperCase(),
      result.message,
      result.suggested_fix || "",
    ]),
  ];

  return XLSX.utils.aoa_to_sheet(validationData);
}

/**
 * Create expense breakdown sheet
 */
function createExpenseBreakdownSheet(documents: PCSDocument[]) {
  // Group documents by category
  const categories = documents.reduce(
    (acc, doc) => {
      const category = doc.extracted_data?.category || "uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    },
    {} as Record<string, PCSDocument[]>
  );

  const expenseData = [
    ["EXPENSE BREAKDOWN BY CATEGORY", "", "", ""],
    ["", "", "", ""],
    ["Category", "Document Count", "Total Amount", "Documents"],
    ...Object.entries(categories).map(([category, docs]) => {
      const totalAmount = docs.reduce((sum, doc) => sum + (doc.extracted_data?.amount || 0), 0);
      const docNames = docs.map((doc) => doc.name).join(", ");
      return [category, docs.length, `$${totalAmount.toFixed(2)}`, docNames];
    }),
    ["", "", "", ""],
    [
      "TOTAL EXPENSES",
      "",
      `$${documents.reduce((sum, doc) => sum + (doc.extracted_data?.amount || 0), 0).toFixed(2)}`,
      "",
    ],
  ];

  return XLSX.utils.aoa_to_sheet(expenseData);
}

/**
 * Generate a simple expense tracking Excel file
 */
export async function generateExpenseTrackingExcel(documents: PCSDocument[]): Promise<Buffer> {
  try {
    const workbook = XLSX.utils.book_new();

    // Create expense tracking sheet
    const expenseData = [
      ["EXPENSE TRACKING", "", "", "", ""],
      ["", "", "", "", ""],
      ["Date", "Vendor", "Amount", "Category", "Receipt"],
      ...documents.map((doc) => [
        doc.extracted_data?.date || new Date(doc.uploaded_at).toLocaleDateString(),
        doc.extracted_data?.vendor || "",
        doc.extracted_data?.amount ? `$${doc.extracted_data.amount.toFixed(2)}` : "",
        doc.extracted_data?.category || "",
        doc.name,
      ]),
      ["", "", "", "", ""],
      [
        "TOTAL",
        "",
        `$${documents.reduce((sum, doc) => sum + (doc.extracted_data?.amount || 0), 0).toFixed(2)}`,
        "",
        "",
      ],
    ];

    const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(workbook, expenseSheet, "Expense Tracking");

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      compression: true,
    });

    logger.info("Expense tracking Excel generated", {
      documentCount: documents.length,
      size: excelBuffer.length,
    });

    return Buffer.from(excelBuffer);
  } catch (error) {
    logger.error("Failed to generate expense tracking Excel:", error);
    throw new Error("Expense tracking Excel generation failed");
  }
}

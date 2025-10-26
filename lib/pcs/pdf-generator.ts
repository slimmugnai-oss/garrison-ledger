/**
 * PCS CLAIM PDF GENERATOR
 *
 * Generates professional PDF claim packages with:
 * - Claim summary and calculations
 * - All uploaded receipts and documents
 * - JTR compliance validation results
 * - Finance office submission format
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
 * Generate a complete PCS claim PDF package
 */
export async function generatePCSClaimPDF(
  claimData: PCSClaimData,
  calculations: PCSCalculations,
  documents: PCSDocument[],
  validationResults: ValidationResult[]
): Promise<Buffer> {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add header
    await addHeader(pdf, claimData);
    yPosition = 40;

    // Add claim summary
    yPosition = await addClaimSummary(pdf, claimData, calculations, yPosition);

    // Add calculations breakdown
    yPosition = await addCalculationsBreakdown(pdf, calculations, yPosition);

    // Add validation results
    yPosition = await addValidationResults(pdf, validationResults, yPosition);

    // Add documents list
    yPosition = await addDocumentsList(pdf, documents, yPosition);

    // Add footer
    addFooter(pdf);

    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    logger.info("PCS claim PDF generated successfully", {
      claimId: claimData.id,
      pages: pdf.getNumberOfPages(),
      size: pdfBuffer.length,
    });

    return pdfBuffer;
  } catch (error) {
    logger.error("Failed to generate PCS claim PDF:", error);
    throw new Error("PDF generation failed");
  }
}

/**
 * Add header with claim information
 */
async function addHeader(pdf: jsPDF, claimData: PCSClaimData): Promise<void> {
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("PCS CLAIM PACKAGE", 20, 20);

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Claim: ${claimData.claim_name}`, 20, 30);
  pdf.text(`Member: ${claimData.member_name} (${claimData.rank})`, 20, 35);
  pdf.text(`Branch: ${claimData.branch}`, 20, 40);
  pdf.text(`Move: ${claimData.origin_base} → ${claimData.destination_base}`, 20, 45);
  pdf.text(`Orders Date: ${claimData.pcs_orders_date}`, 20, 50);
  pdf.text(`Departure: ${claimData.departure_date}`, 20, 55);
  pdf.text(
    `Dependents: ${claimData.dependents_authorized ? "Yes" : "No"} (${claimData.dependents_count})`,
    20,
    60
  );
  pdf.text(`Travel Method: ${claimData.travel_method.toUpperCase()}`, 20, 65);
  pdf.text(`Distance: ${claimData.distance} miles`, 20, 70);
  pdf.text(`Weight Allowance: ${claimData.estimated_weight} lbs`, 20, 75);
}

/**
 * Add claim summary section
 */
async function addClaimSummary(
  pdf: jsPDF,
  claimData: PCSClaimData,
  calculations: PCSCalculations,
  yPosition: number
): Promise<number> {
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("CLAIM SUMMARY", 20, yPosition);

  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");

  // Total entitlements
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `Total Estimated Entitlements: $${calculations.total_entitlements.toFixed(2)}`,
    20,
    yPosition
  );
  yPosition += 10;

  pdf.setFont("helvetica", "normal");
  pdf.text(
    `DLA: $${calculations.dla.amount.toFixed(2)} (${(calculations.dla.confidence * 100).toFixed(0)}% confidence)`,
    20,
    yPosition
  );
  yPosition += 8;

  pdf.text(
    `TLE: $${calculations.tle.amount.toFixed(2)} (${(calculations.tle.confidence * 100).toFixed(0)}% confidence)`,
    20,
    yPosition
  );
  yPosition += 8;

  pdf.text(
    `MALT: $${calculations.malt.amount.toFixed(2)} (${(calculations.malt.confidence * 100).toFixed(0)}% confidence)`,
    20,
    yPosition
  );
  yPosition += 8;

  pdf.text(
    `Per Diem: $${calculations.per_diem.amount.toFixed(2)} (${(calculations.per_diem.confidence * 100).toFixed(0)}% confidence)`,
    20,
    yPosition
  );
  yPosition += 8;

  pdf.text(
    `PPM: $${calculations.ppm.amount.toFixed(2)} (${(calculations.ppm.confidence * 100).toFixed(0)}% confidence)`,
    20,
    yPosition
  );
  yPosition += 15;

  return yPosition;
}

/**
 * Add detailed calculations breakdown
 */
async function addCalculationsBreakdown(
  pdf: jsPDF,
  calculations: PCSCalculations,
  yPosition: number
): Promise<number> {
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("CALCULATIONS BREAKDOWN", 20, yPosition);

  yPosition += 15;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  // DLA details
  pdf.text("DLA (Dislocation Allowance):", 20, yPosition);
  yPosition += 6;
  pdf.text(`  Amount: $${calculations.dla.amount.toFixed(2)}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`  Source: ${calculations.dla.source}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`  Last Verified: ${calculations.dla.lastVerified}`, 25, yPosition);
  yPosition += 10;

  // TLE details
  pdf.text("TLE (Temporary Lodging Expense):", 20, yPosition);
  yPosition += 6;
  pdf.text(`  Amount: $${calculations.tle.amount.toFixed(2)}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`  Source: ${calculations.tle.source}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`  Last Verified: ${calculations.tle.lastVerified}`, 25, yPosition);
  yPosition += 10;

  // MALT details
  pdf.text("MALT (Mileage Allowance in Lieu of Transportation):", 20, yPosition);
  yPosition += 6;
  pdf.text(`  Amount: $${calculations.malt.amount.toFixed(2)}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`  Source: ${calculations.malt.source}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`  Last Verified: ${calculations.malt.lastVerified}`, 25, yPosition);
  yPosition += 10;

  // Per Diem details
  pdf.text("Per Diem:", 20, yPosition);
  yPosition += 6;
  pdf.text(`  Amount: $${calculations.per_diem.amount.toFixed(2)}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`  Source: ${calculations.per_diem.source}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`  Last Verified: ${calculations.per_diem.lastVerified}`, 25, yPosition);
  yPosition += 10;

  // PPM details
  pdf.text("PPM (Personally Procured Move):", 20, yPosition);
  yPosition += 6;
  pdf.text(`  Amount: $${calculations.ppm.amount.toFixed(2)}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`  Source: ${calculations.ppm.source}`, 25, yPosition);
  yPosition += 5;
  pdf.text(`  Last Verified: ${calculations.ppm.lastVerified}`, 25, yPosition);
  yPosition += 15;

  return yPosition;
}

/**
 * Add validation results section
 */
async function addValidationResults(
  pdf: jsPDF,
  validationResults: ValidationResult[],
  yPosition: number
): Promise<number> {
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("JTR COMPLIANCE VALIDATION", 20, yPosition);

  yPosition += 15;

  if (validationResults.length === 0) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("✅ No validation issues found", 20, yPosition);
    yPosition += 10;
  } else {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const errors = validationResults.filter((r) => r.severity === "error");
    const warnings = validationResults.filter((r) => r.severity === "warning");
    const info = validationResults.filter((r) => r.severity === "info");

    if (errors.length > 0) {
      pdf.setFont("helvetica", "bold");
      pdf.text(`❌ ERRORS (${errors.length}):`, 20, yPosition);
      yPosition += 8;

      pdf.setFont("helvetica", "normal");
      errors.forEach((result, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${index + 1}. ${result.rule_title} (${result.rule_code})`, 25, yPosition);
        yPosition += 5;
        pdf.text(`   ${result.message}`, 25, yPosition);
        yPosition += 5;
        if (result.suggested_fix) {
          pdf.text(`   Fix: ${result.suggested_fix}`, 25, yPosition);
          yPosition += 5;
        }
        yPosition += 5;
      });
    }

    if (warnings.length > 0) {
      pdf.setFont("helvetica", "bold");
      pdf.text(`⚠️ WARNINGS (${warnings.length}):`, 20, yPosition);
      yPosition += 8;

      pdf.setFont("helvetica", "normal");
      warnings.forEach((result, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${index + 1}. ${result.rule_title} (${result.rule_code})`, 25, yPosition);
        yPosition += 5;
        pdf.text(`   ${result.message}`, 25, yPosition);
        yPosition += 5;
        if (result.suggested_fix) {
          pdf.text(`   Fix: ${result.suggested_fix}`, 25, yPosition);
          yPosition += 5;
        }
        yPosition += 5;
      });
    }

    if (info.length > 0) {
      pdf.setFont("helvetica", "bold");
      pdf.text(`ℹ️ INFORMATION (${info.length}):`, 20, yPosition);
      yPosition += 8;

      pdf.setFont("helvetica", "normal");
      info.forEach((result, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${index + 1}. ${result.rule_title} (${result.rule_code})`, 25, yPosition);
        yPosition += 5;
        pdf.text(`   ${result.message}`, 25, yPosition);
        yPosition += 5;
        if (result.suggested_fix) {
          pdf.text(`   Fix: ${result.suggested_fix}`, 25, yPosition);
          yPosition += 5;
        }
        yPosition += 5;
      });
    }
  }

  yPosition += 10;
  return yPosition;
}

/**
 * Add documents list section
 */
async function addDocumentsList(
  pdf: jsPDF,
  documents: PCSDocument[],
  yPosition: number
): Promise<number> {
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("SUPPORTING DOCUMENTS", 20, yPosition);

  yPosition += 15;

  if (documents.length === 0) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("No documents uploaded", 20, yPosition);
    yPosition += 10;
  } else {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    documents.forEach((doc, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.text(`${index + 1}. ${doc.name}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`   Type: ${doc.type}`, 25, yPosition);
      yPosition += 4;
      pdf.text(`   Size: ${(doc.size / 1024).toFixed(1)} KB`, 25, yPosition);
      yPosition += 4;
      pdf.text(`   Uploaded: ${new Date(doc.uploaded_at).toLocaleDateString()}`, 25, yPosition);
      yPosition += 4;

      if (doc.extracted_data?.amount) {
        pdf.text(`   Amount: $${doc.extracted_data.amount.toFixed(2)}`, 25, yPosition);
        yPosition += 4;
      }

      if (doc.extracted_data?.vendor) {
        pdf.text(`   Vendor: ${doc.extracted_data.vendor}`, 25, yPosition);
        yPosition += 4;
      }

      if (doc.extracted_data?.date) {
        pdf.text(`   Date: ${doc.extracted_data.date}`, 25, yPosition);
        yPosition += 4;
      }

      yPosition += 8;
    });
  }

  return yPosition;
}

/**
 * Add footer with generation info
 */
function addFooter(pdf: jsPDF): void {
  const pageCount = pdf.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    // Add page number
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Page ${i} of ${pageCount}`, 20, 290);

    // Add generation timestamp
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 295);

    // Add Garrison Ledger branding
    pdf.text("Garrison Ledger PCS Copilot", 150, 290);
    pdf.text("garrisonledger.com", 150, 295);
  }
}

/**
 * Generate a simple claim summary PDF (for quick reference)
 */
export async function generateClaimSummaryPDF(
  claimData: PCSClaimData,
  calculations: PCSCalculations
): Promise<Buffer> {
  try {
    const pdf = new jsPDF("p", "mm", "a4");

    // Add header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("PCS CLAIM SUMMARY", 20, 20);

    // Add claim details
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Member: ${claimData.member_name} (${claimData.rank})`, 20, 35);
    pdf.text(`Move: ${claimData.origin_base} → ${claimData.destination_base}`, 20, 42);
    pdf.text(`Departure: ${claimData.departure_date}`, 20, 49);

    // Add calculations
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("ENTITLEMENTS", 20, 70);

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Total: $${calculations.total_entitlements.toFixed(2)}`, 20, 85);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`DLA: $${calculations.dla.amount.toFixed(2)}`, 20, 100);
    pdf.text(`TLE: $${calculations.tle.amount.toFixed(2)}`, 20, 110);
    pdf.text(`MALT: $${calculations.malt.amount.toFixed(2)}`, 20, 120);
    pdf.text(`Per Diem: $${calculations.per_diem.amount.toFixed(2)}`, 20, 130);
    pdf.text(`PPM: $${calculations.ppm.amount.toFixed(2)}`, 20, 140);

    // Add footer
    pdf.setFontSize(8);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 280);
    pdf.text("Garrison Ledger PCS Copilot", 150, 280);

    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    logger.info("PCS claim summary PDF generated", {
      claimId: claimData.id,
      size: pdfBuffer.length,
    });

    return pdfBuffer;
  } catch (error) {
    logger.error("Failed to generate claim summary PDF:", error);
    throw new Error("Summary PDF generation failed");
  }
}

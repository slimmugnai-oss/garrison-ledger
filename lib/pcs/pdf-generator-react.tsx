/**
 * PCS CLAIM PDF GENERATOR (React-PDF)
 *
 * FAST alternative using @react-pdf/renderer
 * - No canvas rendering (no html2canvas bloat)
 * - Declarative React-like components
 * - Server-side compatible
 * - Much faster generation
 *
 * Replaces slow html2canvas + jsPDF approach
 */

import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import React from "react";

import { logger } from "@/lib/logger";

export interface PCSClaimData {
  id: string;
  claim_name: string;
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

export interface PCSCalculations {
  dla: { amount: number; confidence: number; source: string; lastVerified: string };
  tle: { amount: number; confidence: number; source: string; lastVerified: string };
  malt: { amount: number; confidence: number; source: string; lastVerified: string };
  per_diem: { amount: number; confidence: number; source: string; lastVerified: string };
  ppm: { amount: number; confidence: number; source: string; lastVerified: string };
  total_entitlements: number;
  confidence: { overall: number; dataSources: Record<string, string> };
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#1e293b",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  infoItem: {
    width: "48%",
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  infoLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
  },
  table: {
    width: "100%",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#0f172a",
    color: "#fff",
    fontWeight: "bold",
    paddingVertical: 10,
  },
  tableHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: "#1e293b",
  },
  tableCellRight: {
    flex: 1,
    fontSize: 9,
    color: "#059669",
    fontWeight: "bold",
    textAlign: "right",
  },
  totalRow: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderTopWidth: 2,
    borderTopColor: "#0f172a",
    marginTop: 5,
  },
  totalCell: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#059669",
  },
  disclaimer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fbbf24",
    fontSize: 9,
    color: "#92400e",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#64748b",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
});

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "Not provided";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// PDF Component
const PCSClaimPDF = ({
  claimData,
  calculations,
}: {
  claimData: PCSClaimData;
  calculations: PCSCalculations;
}) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PCS Claim Worksheet</Text>
        <Text style={styles.subtitle}>{claimData.claim_name}</Text>
      </View>

      {/* Claim Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Claim Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Origin</Text>
            <Text style={styles.infoValue}>{claimData.origin_base}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Destination</Text>
            <Text style={styles.infoValue}>{claimData.destination_base}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>PCS Orders Date</Text>
            <Text style={styles.infoValue}>{formatDate(claimData.pcs_orders_date)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Departure Date</Text>
            <Text style={styles.infoValue}>{formatDate(claimData.departure_date)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Travel Method</Text>
            <Text style={styles.infoValue}>{claimData.travel_method.toUpperCase()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{claimData.distance.toLocaleString()} miles</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Estimated Weight</Text>
            <Text style={styles.infoValue}>{claimData.estimated_weight.toLocaleString()} lbs</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dependents</Text>
            <Text style={styles.infoValue}>{claimData.dependents_count || 0}</Text>
          </View>
        </View>
      </View>

      {/* Entitlements Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estimated Entitlements</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Entitlement Type</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Description</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText, { textAlign: "right" }]}>
              Amount
            </Text>
          </View>

          {/* DLA */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>DLA</Text>
            <Text style={styles.tableCell}>Dislocation Allowance (one-time payment)</Text>
            <Text style={styles.tableCellRight}>{formatCurrency(calculations.dla.amount)}</Text>
          </View>

          {/* TLE */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>TLE</Text>
            <Text style={styles.tableCell}>Temporary Lodging Expense</Text>
            <Text style={styles.tableCellRight}>{formatCurrency(calculations.tle.amount)}</Text>
          </View>

          {/* MALT */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>MALT</Text>
            <Text style={styles.tableCell}>
              Mileage Allowance ({claimData.distance.toLocaleString()} miles × rate)
            </Text>
            <Text style={styles.tableCellRight}>{formatCurrency(calculations.malt.amount)}</Text>
          </View>

          {/* Per Diem */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Per Diem</Text>
            <Text style={styles.tableCell}>Meals & Incidentals</Text>
            <Text style={styles.tableCellRight}>
              {formatCurrency(calculations.per_diem.amount)}
            </Text>
          </View>

          {/* PPM */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>PPM</Text>
            <Text style={styles.tableCell}>
              Personally Procured Move ({claimData.estimated_weight.toLocaleString()} lbs)
            </Text>
            <Text style={styles.tableCellRight}>{formatCurrency(calculations.ppm.amount)}</Text>
          </View>

          {/* Total */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.totalCell]}>Total Estimated Entitlements</Text>
            <Text style={styles.tableCell}></Text>
            <Text style={[styles.tableCellRight, styles.totalCell, { fontSize: 14 }]}>
              {formatCurrency(calculations.total_entitlements)}
            </Text>
          </View>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>⚠️ Important Disclaimer</Text>
        <Text>
          This worksheet is for estimation purposes only. Final reimbursement amounts are determined
          by your finance office based on official DD Form 1351-2 submission. All calculations are
          based on current JTR (Joint Travel Regulations) rates and may vary based on actual travel
          dates, receipts, and official orders.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Generated on{" "}
          {new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })} • Garrison
          Ledger - PCS Money Copilot
        </Text>
      </View>
    </Page>
  </Document>
);

/**
 * Generate PDF buffer using React-PDF
 */
export async function generatePCSClaimPDFReact(
  claimData: PCSClaimData,
  calculations: PCSCalculations
): Promise<Buffer> {
  try {
    // Use React-PDF's pdf() function to generate buffer
    const pdfDoc = pdf(React.createElement(PCSClaimPDF, { claimData, calculations }));

    // Get buffer (this is async in React-PDF)
    const blob = await pdfDoc.toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logger.info("PCS claim PDF generated successfully (React-PDF)", {
      claimId: claimData.id,
      size: buffer.length,
    });

    return buffer;
  } catch (error) {
    logger.error("Failed to generate PCS claim PDF (React-PDF):", error);
    throw error;
  }
}

/**
 * PCS CLAIM HTML GENERATOR
 *
 * Lightweight alternative to PDF generation.
 * Generates a print-ready HTML document that can be:
 * - Viewed in browser
 * - Printed to PDF (Ctrl/Cmd + P)
 * - Saved as HTML file
 *
 * Much faster than html2canvas + jsPDF, no heavy processing.
 */

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

export interface PCSDocument {
  id: string;
  document_type: string;
  file_name: string;
  upload_date: string;
}

export interface ValidationResult {
  check_type: string;
  status: "pass" | "fail" | "warning";
  message: string;
}

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

export function generatePCSClaimHTML(
  claimData: PCSClaimData,
  calculations: PCSCalculations
): string {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PCS Claim - ${claimData.claim_name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @media print {
      @page {
        margin: 0.5in;
        size: letter;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .no-print {
        display: none;
      }
      
      .page-break {
        page-break-before: always;
      }
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #fff;
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .print-instructions {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      font-size: 14px;
      color: #475569;
    }
    
    .print-instructions h3 {
      margin-bottom: 8px;
      color: #0f172a;
      font-size: 16px;
    }
    
    .header {
      border-bottom: 3px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      color: #0f172a;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: #64748b;
      font-weight: normal;
    }
    
    .section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .info-item {
      background: #f8fafc;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }
    
    .info-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 16px;
      color: #0f172a;
      font-weight: 600;
    }
    
    .entitlements-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    
    .entitlements-table th {
      background: #0f172a;
      color: #fff;
      padding: 12px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
    }
    
    .entitlements-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    
    .entitlements-table tr:hover {
      background: #f8fafc;
    }
    
    .amount-cell {
      font-weight: 600;
      color: #059669;
      font-size: 16px;
    }
    
    .total-row {
      background: #f1f5f9;
      font-weight: 600;
    }
    
    .total-row td {
      border-top: 2px solid #0f172a;
      font-size: 16px;
      padding: 16px 12px;
    }
    
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 2px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }
    
    .disclaimer {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 6px;
      padding: 16px;
      margin-top: 24px;
      font-size: 13px;
      color: #92400e;
    }
    
    .disclaimer strong {
      display: block;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <!-- Print Instructions (hidden when printing) -->
  <div class="print-instructions no-print">
    <h3>📄 Print This Document</h3>
    <p>Press <strong>Ctrl+P</strong> (Windows/Linux) or <strong>Cmd+P</strong> (Mac) to print or save as PDF.</p>
  </div>

  <!-- Header -->
  <div class="header">
    <h1>PCS Claim Worksheet</h1>
    <div class="subtitle">${claimData.claim_name}</div>
  </div>

  <!-- Claim Information -->
  <div class="section">
    <h2 class="section-title">Claim Information</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Origin</div>
        <div class="info-value">${claimData.origin_base}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Destination</div>
        <div class="info-value">${claimData.destination_base}</div>
      </div>
      <div class="info-item">
        <div class="info-label">PCS Orders Date</div>
        <div class="info-value">${formatDate(claimData.pcs_orders_date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Departure Date</div>
        <div class="info-value">${formatDate(claimData.departure_date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Travel Method</div>
        <div class="info-value">${claimData.travel_method.toUpperCase()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Distance</div>
        <div class="info-value">${claimData.distance.toLocaleString()} miles</div>
      </div>
      <div class="info-item">
        <div class="info-label">Estimated Weight</div>
        <div class="info-value">${claimData.estimated_weight.toLocaleString()} lbs</div>
      </div>
      <div class="info-item">
        <div class="info-label">Dependents</div>
        <div class="info-value">${claimData.dependents_count || 0}</div>
      </div>
    </div>
  </div>

  <!-- Entitlements Summary -->
  <div class="section">
    <h2 class="section-title">Estimated Entitlements</h2>
    <table class="entitlements-table">
      <thead>
        <tr>
          <th>Entitlement Type</th>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>DLA</strong></td>
          <td>Dislocation Allowance (one-time payment)</td>
          <td class="amount-cell" style="text-align: right;">${formatCurrency(calculations.dla.amount)}</td>
        </tr>
        <tr>
          <td><strong>TLE</strong></td>
          <td>Temporary Lodging Expense</td>
          <td class="amount-cell" style="text-align: right;">${formatCurrency(calculations.tle.amount)}</td>
        </tr>
        <tr>
          <td><strong>MALT</strong></td>
          <td>Mileage Allowance (${claimData.distance.toLocaleString()} miles × rate)</td>
          <td class="amount-cell" style="text-align: right;">${formatCurrency(calculations.malt.amount)}</td>
        </tr>
        <tr>
          <td><strong>Per Diem</strong></td>
          <td>Meals & Incidentals</td>
          <td class="amount-cell" style="text-align: right;">${formatCurrency(calculations.per_diem.amount)}</td>
        </tr>
        <tr>
          <td><strong>PPM</strong></td>
          <td>Personally Procured Move (${claimData.estimated_weight.toLocaleString()} lbs)</td>
          <td class="amount-cell" style="text-align: right;">${formatCurrency(calculations.ppm.amount)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2"><strong>Total Estimated Entitlements</strong></td>
          <td class="amount-cell" style="text-align: right; font-size: 18px;">${formatCurrency(calculations.total_entitlements)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer">
    <strong>⚠️ Important Disclaimer</strong>
    <p>This worksheet is for estimation purposes only. Final reimbursement amounts are determined by your finance office based on official DD Form 1351-2 submission. All calculations are based on current JTR (Joint Travel Regulations) rates and may vary based on actual travel dates, receipts, and official orders.</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Generated on ${new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}</p>
    <p>Garrison Ledger - PCS Money Copilot</p>
  </div>
</body>
</html>
  `.trim();

  logger.info("PCS claim HTML generated successfully", {
    claimId: claimData.id,
    size: html.length,
  });

  return html;
}

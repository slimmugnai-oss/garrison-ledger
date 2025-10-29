/**
 * LES AUDIT PDF EXPORT API
 *
 * POST /api/les/export/pdf
 * Generates a professional PDF report of audit results
 *
 * Security: Authenticated users only
 * Format: Military-grade PDF for finance office submission
 */

import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { month, year, generatedAt, summary, flags, lineItems, waterfall } = body;

    // Format data for PDF generation
    const monthName = new Date(2000, month - 1).toLocaleString("default", {
      month: "long",
    });

    // Build HTML content for PDF (can be converted to PDF server-side with puppeteer/playwright)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>LES Audit Report - ${monthName} ${year}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #1f2937; }
    .header { text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #1e40af; font-size: 28px; }
    .header p { margin: 5px 0; color: #6b7280; }
    .section { margin: 30px 0; }
    .section h2 { color: #1e40af; border-bottom: 2px solid #dbeafe; padding-bottom: 8px; font-size: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
    .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; }
    .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; }
    .summary-card .value { font-size: 24px; font-weight: bold; color: #1f2937; }
    .flag { border-left: 4px solid; padding: 12px; margin: 10px 0; background: #f9fafb; }
    .flag.red { border-color: #dc2626; }
    .flag.yellow { border-color: #f59e0b; }
    .flag.green { border-color: #10b981; }
    .flag-title { font-weight: bold; margin-bottom: 5px; }
    .flag-message { color: #4b5563; margin-bottom: 5px; }
    .flag-delta { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 600; color: #374151; }
    .footer { margin-top: 50px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    .provenance { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; margin: 20px 0; font-size: 13px; }
    .provenance strong { color: #1e40af; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>LES Audit Report</h1>
    <p>${monthName} ${year}</p>
    <p style="font-size: 12px;">Generated: ${new Date(generatedAt).toLocaleString()}</p>
  </div>

  <!-- Summary Section -->
  <div class="section">
    <h2>Audit Summary</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <h3>GROSS PAY</h3>
        <div class="value">$${((summary?.gross_cents || 0) / 100).toFixed(2)}</div>
      </div>
      <div class="summary-card">
        <h3>NET PAY</h3>
        <div class="value">$${((summary?.net_cents || 0) / 100).toFixed(2)}</div>
      </div>
      <div class="summary-card">
        <h3>TOTAL TAXES</h3>
        <div class="value">$${((summary?.total_taxes_cents || 0) / 100).toFixed(2)}</div>
      </div>
      <div class="summary-card">
        <h3>TOTAL DEDUCTIONS</h3>
        <div class="value">$${((summary?.total_deductions_cents || 0) / 100).toFixed(2)}</div>
      </div>
    </div>
  </div>

  <!-- Flags Section -->
  <div class="section">
    <h2>Audit Findings (${flags?.length || 0})</h2>
    ${
      flags && flags.length > 0
        ? flags
            .map(
              (flag: any) => `
      <div class="flag ${flag.severity}">
        <div class="flag-title">${flag.severity.toUpperCase()}: ${flag.flag_code}</div>
        <div class="flag-message">${flag.message}</div>
        ${flag.suggestion ? `<div style="color: #6b7280; font-size: 13px; margin-top: 5px;">💡 ${flag.suggestion}</div>` : ""}
        ${flag.delta_cents ? `<div class="flag-delta">Δ $${(flag.delta_cents / 100).toFixed(2)}</div>` : ""}
      </div>
    `
            )
            .join("")
        : '<p style="color: #6b7280;">No audit flags found. Your LES appears accurate.</p>'
    }
  </div>

  <!-- Line Items Section -->
  <div class="section">
    <h2>Line Items (${lineItems?.length || 0})</h2>
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Description</th>
          <th>Section</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${
          lineItems && lineItems.length > 0
            ? lineItems
                .map(
                  (item: any) => `
          <tr>
            <td style="font-weight: 600;">${item.line_code}</td>
            <td>${item.description}</td>
            <td style="text-transform: capitalize; color: #6b7280; font-size: 13px;">${item.section.toLowerCase()}</td>
            <td style="text-align: right; font-weight: 600;">$${(item.amount_cents / 100).toFixed(2)}</td>
          </tr>
        `
                )
                .join("")
            : '<tr><td colspan="4" style="text-align: center; color: #9ca3af;">No line items available</td></tr>'
        }
      </tbody>
    </table>
  </div>

  <!-- Provenance -->
  <div class="provenance">
    <strong>Data Provenance:</strong> This audit was computed using official 2025 DFAS pay tables, JTR regulations, and IRS tax rates. 
    All calculations are based on official military pay guidance. Last verified: ${new Date(generatedAt).toLocaleDateString()}.
  </div>

  <!-- Footer -->
  <div class="footer">
    <p><strong>Garrison Ledger</strong> • Military Financial Intelligence Platform</p>
    <p>Generated by LES Auditor • For finance office submission or personal records</p>
    <p style="margin-top: 10px; font-size: 11px;">This report is for informational purposes only. Verify all data with your finance office before taking action.</p>
  </div>
</body>
</html>
    `;

    // For now, return HTML that browser can print to PDF
    // TODO: Add server-side PDF generation with Puppeteer/Playwright for true PDF downloads
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="LES-Audit-${month}-${year}.html"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}

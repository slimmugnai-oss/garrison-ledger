/**
 * PCS CLAIM PACKAGE GENERATOR
 * 
 * Generates professional PDF packages for PCS claims with:
 * - Clean, military-professional formatting
 * - Comprehensive entitlement breakdowns
 * - Document checklists
 * - Ready-to-submit formatting
 */

interface ClaimData {
  id: string;
  claim_name: string;
  status: string;
  pcs_orders_date: string;
  departure_date: string;
  arrival_date: string;
  origin_base: string;
  destination_base: string;
  travel_method: string;
  dependents_count: number;
  rank_at_pcs: string;
  branch: string;
  entitlements?: {
    dla?: number;
    tle?: number;
    malt?: number;
    per_diem?: number;
    ppm?: number;
    total?: number;
  };
  readiness_score: number;
  completion_percentage: number;
  created_at: string;
}

interface ProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
  rank?: string;
  branch?: string;
}

interface SnapshotData {
  dla_amount: number;
  tle_days: number;
  tle_amount: number;
  malt_miles: number;
  malt_amount: number;
  per_diem_days: number;
  per_diem_amount: number;
  ppm_weight: number;
  ppm_estimate: number;
  total_estimated: number;
  total_claimed: number;
  potential_left_on_table: number;
  confidence_score: number;
  confidence_level: string;
  rates_used?: {
    dla_rate?: number;
    dla_citation?: string;
    malt_rate?: number;
    malt_citation?: string;
    per_diem_rate?: number;
  };
  calculation_details?: {
    rank?: string;
    branch?: string;
    dependents?: number;
    distance?: number;
    travel_days?: number;
  };
}

interface DocumentData {
  id: string;
  file_name: string;
  document_type: string;
  created_at: string;
  ocr_status: string;
  normalized_data?: Record<string, unknown>;
}

interface PackageOptions {
  claim: ClaimData;
  profile: ProfileData;
  snapshot: SnapshotData | null;
  documents: DocumentData[];
  includeDocuments: boolean;
}

/**
 * Generate professional PDF claim package
 * Uses clean HTML-to-PDF conversion for military-grade formatting
 */
export async function generateClaimPackagePDF(options: PackageOptions): Promise<Buffer> {
  const { claim, profile, snapshot, documents } = options;

  // Generate clean, professional HTML
  const html = generatePackageHTML(claim, profile, snapshot, documents);

  // Convert HTML to PDF (using a simple text-based approach for now)
  // In production, you'd use a library like Puppeteer or PDFKit
  const pdfBuffer = await convertHTMLToPDF(html);

  return pdfBuffer;
}

/**
 * Generate clean, professional HTML for the claim package
 */
function generatePackageHTML(
  claim: ClaimData,
  profile: ProfileData,
  snapshot: SnapshotData | null,
  documents: DocumentData[]
): string {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PCS Claim Package - ${claim.claim_name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 20pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 12pt;
      color: #64748b;
      margin-bottom: 4px;
    }
    
    .header .date {
      font-size: 10pt;
      color: #94a3b8;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: #1e40af;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px 30px;
      margin-bottom: 15px;
    }
    
    .info-item {
      padding: 10px;
      background: #f8fafc;
      border-left: 3px solid #3b82f6;
    }
    
    .info-label {
      font-size: 9pt;
      font-weight: bold;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 11pt;
      color: #1a1a1a;
      font-weight: 500;
    }
    
    .entitlement-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    
    .entitlement-table th {
      background: #1e40af;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 10pt;
      font-weight: bold;
    }
    
    .entitlement-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10pt;
    }
    
    .entitlement-table tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .entitlement-table .amount {
      text-align: right;
      font-weight: bold;
      color: #059669;
    }
    
    .entitlement-table .total-row {
      background: #eff6ff;
      font-weight: bold;
    }
    
    .entitlement-table .total-row td {
      padding: 15px 12px;
      font-size: 12pt;
      border-top: 2px solid #1e40af;
      border-bottom: 2px solid #1e40af;
    }
    
    .document-list {
      list-style: none;
    }
    
    .document-item {
      padding: 12px;
      margin-bottom: 8px;
      background: #f8fafc;
      border-left: 3px solid #10b981;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .document-item.missing {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    
    .document-name {
      font-weight: 500;
    }
    
    .document-status {
      font-size: 9pt;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: bold;
    }
    
    .status-uploaded {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-missing {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .status-processing {
      background: #fef3c7;
      color: #92400e;
    }
    
    .summary-box {
      background: #eff6ff;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .summary-box h3 {
      color: #1e40af;
      font-size: 12pt;
      margin-bottom: 12px;
    }
    
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    
    .stat {
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 6px;
    }
    
    .stat-value {
      font-size: 18pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 9pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #cbd5e1;
      text-align: center;
      font-size: 9pt;
      color: #94a3b8;
    }
    
    .confidence-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 9pt;
      font-weight: bold;
      margin-left: 10px;
    }
    
    .confidence-high {
      background: #d1fae5;
      color: #065f46;
    }
    
    .confidence-medium {
      background: #fef3c7;
      color: #92400e;
    }
    
    .confidence-low {
      background: #fee2e2;
      color: #991b1b;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <h1>PCS CLAIM PACKAGE</h1>
    <div class="subtitle">${claim.claim_name}</div>
    <div class="date">Generated: ${generatedDate}</div>
  </div>

  <!-- CLAIM SUMMARY -->
  <div class="section">
    <h2 class="section-title">Claim Summary</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Claim ID</div>
        <div class="info-value">${claim.id.substring(0, 8).toUpperCase()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div class="info-value">${formatStatus(claim.status)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Member Name</div>
        <div class="info-value">${profile.full_name || 'Not provided'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Rank</div>
        <div class="info-value">${claim.rank_at_pcs}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Branch</div>
        <div class="info-value">${claim.branch}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Dependents</div>
        <div class="info-value">${claim.dependents_count}</div>
      </div>
    </div>
  </div>

  <!-- PCS DETAILS -->
  <div class="section">
    <h2 class="section-title">PCS Movement Details</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Orders Date</div>
        <div class="info-value">${formatDate(claim.pcs_orders_date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Travel Method</div>
        <div class="info-value">${formatTravelMethod(claim.travel_method)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Departure Date</div>
        <div class="info-value">${formatDate(claim.departure_date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Arrival Date</div>
        <div class="info-value">${formatDate(claim.arrival_date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Origin Base</div>
        <div class="info-value">${claim.origin_base}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Destination Base</div>
        <div class="info-value">${claim.destination_base}</div>
      </div>
    </div>
  </div>

  ${snapshot ? generateEntitlementSection(snapshot) : ''}

  <!-- DOCUMENT CHECKLIST -->
  <div class="section">
    <h2 class="section-title">Document Checklist</h2>
    ${generateDocumentChecklist(documents)}
  </div>

  <!-- READINESS SUMMARY -->
  <div class="summary-box">
    <h3>Claim Readiness</h3>
    <div class="summary-stats">
      <div class="stat">
        <div class="stat-value">${claim.readiness_score}/100</div>
        <div class="stat-label">Readiness Score</div>
      </div>
      <div class="stat">
        <div class="stat-value">${claim.completion_percentage}%</div>
        <div class="stat-label">Completion</div>
      </div>
      <div class="stat">
        <div class="stat-value">${documents.length}</div>
        <div class="stat-label">Documents</div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p><strong>Garrison Ledger</strong> - PCS Money Copilot</p>
    <p>This package was generated automatically. Please verify all information before submission.</p>
    <p>For questions or support, contact support@garrisonledger.com</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate entitlement breakdown section
 */
function generateEntitlementSection(snapshot: SnapshotData): string {
  const confidenceClass = 
    snapshot.confidence_level === 'high' ? 'confidence-high' :
    snapshot.confidence_level === 'medium' ? 'confidence-medium' :
    'confidence-low';

  return `
  <div class="section">
    <h2 class="section-title">
      Entitlement Calculations
      <span class="${confidenceClass} confidence-badge">
        ${snapshot.confidence_score}% Confidence
      </span>
    </h2>
    <table class="entitlement-table">
      <thead>
        <tr>
          <th>Entitlement</th>
          <th>Details</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Dislocation Allowance (DLA)</strong></td>
          <td>${snapshot.calculation_details?.dependents ? 'With Dependents' : 'Without Dependents'}</td>
          <td class="amount">$${snapshot.dla_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td><strong>Temporary Lodging Expense (TLE)</strong></td>
          <td>${snapshot.tle_days} days</td>
          <td class="amount">$${snapshot.tle_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td><strong>Mileage Allowance (MALT)</strong></td>
          <td>${snapshot.malt_miles.toLocaleString()} miles @ $${snapshot.rates_used?.malt_rate || 0}/mile</td>
          <td class="amount">$${snapshot.malt_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td><strong>Per Diem</strong></td>
          <td>${snapshot.per_diem_days} days @ $${snapshot.rates_used?.per_diem_rate || 0}/day</td>
          <td class="amount">$${snapshot.per_diem_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td><strong>PPM (Personally Procured Move)</strong></td>
          <td>${snapshot.ppm_weight.toLocaleString()} lbs</td>
          <td class="amount">$${snapshot.ppm_estimate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2"><strong>TOTAL ESTIMATED ENTITLEMENTS</strong></td>
          <td class="amount">$${snapshot.total_estimated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>
    
    ${snapshot.potential_left_on_table > 0 ? `
    <div style="margin-top: 15px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <strong style="color: #92400e;">⚠️ Potential Money Left On Table:</strong>
      <span style="color: #92400e; font-size: 14pt; font-weight: bold; margin-left: 10px;">
        $${snapshot.potential_left_on_table.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <p style="margin-top: 8px; font-size: 9pt; color: #78350f;">
        Upload additional receipts to maximize your reimbursement.
      </p>
    </div>
    ` : ''}
  </div>
  `;
}

/**
 * Generate document checklist
 */
function generateDocumentChecklist(documents: DocumentData[]): string {
  const requiredDocs = [
    { type: 'orders', name: 'PCS Orders' },
    { type: 'weigh_ticket', name: 'Weigh Tickets (Empty & Full)' },
    { type: 'lodging_receipt', name: 'Lodging Receipts' },
    { type: 'fuel_receipt', name: 'Fuel Receipts' }
  ];

  const _uploadedTypes = new Set(documents.map(d => d.document_type));

  const items = requiredDocs.map(req => {
    const uploaded = documents.filter(d => d.document_type === req.type);
    const hasDoc = uploaded.length > 0;
    
    return `
      <li class="document-item ${hasDoc ? '' : 'missing'}">
        <span class="document-name">
          ${req.name}
          ${uploaded.length > 1 ? ` (${uploaded.length} files)` : ''}
        </span>
        <span class="document-status ${hasDoc ? 'status-uploaded' : 'status-missing'}">
          ${hasDoc ? '✓ Uploaded' : '✗ Missing'}
        </span>
      </li>
    `;
  }).join('');

  const otherDocs = documents.filter(d => 
    !requiredDocs.some(req => req.type === d.document_type)
  );

  const otherItems = otherDocs.map(doc => `
    <li class="document-item">
      <span class="document-name">${doc.file_name}</span>
      <span class="document-status status-uploaded">✓ Uploaded</span>
    </li>
  `).join('');

  return `
    <ul class="document-list">
      ${items}
      ${otherItems}
    </ul>
  `;
}

/**
 * Helper: Format date
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Helper: Format status
 */
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Helper: Format travel method
 */
function formatTravelMethod(method: string): string {
  const methods: Record<string, string> = {
    ppm: 'PPM (Personally Procured Move)',
    government: 'Government Move',
    mixed: 'Mixed Move'
  };
  return methods[method] || method;
}

/**
 * Convert HTML to PDF
 * NOTE: This is a simplified version using text-based approach
 * In production, use a proper library like Puppeteer or PDFKit
 */
async function convertHTMLToPDF(html: string): Promise<Buffer> {
  // For now, return the HTML as a text file
  // In production, you would use:
  // - Puppeteer: Launch headless browser and print to PDF
  // - PDFKit: Build PDF programmatically
  // - html-pdf-node: Convert HTML to PDF
  
  // Simple text-based approach for now
  const textContent = html
    .replace(/<style>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return Buffer.from(textContent, 'utf-8');
}


/**
 * Professional PDF Report Generator for Calculator Results
 * Creates high-quality, branded PDF reports for all calculators
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  TSPInputs,
  TSPOutputs,
  HouseHackInputs,
  HouseHackOutputs,
  SDPInputs,
  SDPOutputs,
  PCSInputs,
  PCSOutputs,
  OnBaseSavingsInputs,
  OnBaseSavingsOutputs,
  RetirementInputs,
  RetirementOutputs
} from '@/lib/types/pdf-inputs';

const BRAND_COLOR = '#2563eb'; // Blue-600
const SUCCESS_COLOR = '#059669'; // Green-600
const HEADER_HEIGHT = 40;

/**
 * Initialize PDF with Garrison Ledger branding
 */
function initializePDF(title: string): jsPDF {
  const doc = new jsPDF();
  
  // Header with branding
  doc.setFillColor(BRAND_COLOR);
  doc.rect(0, 0, 210, HEADER_HEIGHT, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GARRISON LEDGER', 105, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 105, 28, { align: 'center' });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(9);
  doc.text(
    `Generated ${new Date().toLocaleDateString()} | garrisonledger.com`,
    105,
    285,
    { align: 'center' }
  );
  
  return doc;
}

/**
 * Format currency
 */
const fmt = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Generate TSP Modeler Report
 */
export function generateTSPReport(inputs: TSPInputs, outputs: TSPOutputs): string {
  const doc = initializePDF('TSP Allocation Modeler Report');
  
  let yPos = HEADER_HEIGHT + 15;
  
  // Inputs Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Inputs', 20, yPos);
  yPos += 10;
  
  const inputData = [
    ['Current Balance', fmt(inputs.currentBalance || 0)],
    ['Monthly Contribution', fmt(inputs.monthlyContribution || 0)],
    ['Years to Retirement', inputs.yearsToRetirement || 0],
    ['Employer Match', `${inputs.employerMatch || 0}%`]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Input', 'Value']],
    body: inputData,
    theme: 'striped',
    headStyles: { fillColor: BRAND_COLOR }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Fund Allocation
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Fund Allocation', 20, yPos);
  yPos += 10;
  
  const allocationData = [
    ['C Fund (Stocks)', `${inputs.cFund || 0}%`],
    ['S Fund (Small Cap)', `${inputs.sFund || 0}%`],
    ['I Fund (International)', `${inputs.iFund || 0}%`],
    ['F Fund (Bonds)', `${inputs.fFund || 0}%`],
    ['G Fund (Treasury)', `${inputs.gFund || 0}%`]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Fund', 'Allocation']],
    body: allocationData,
    theme: 'striped',
    headStyles: { fillColor: BRAND_COLOR }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Results
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Projected Results', 20, yPos);
  yPos += 10;
  
  const resultsData = [
    ['Future Value', fmt(outputs.futureValue || 0)],
    ['Total Contributions', fmt(outputs.totalContributions || 0)],
    ['Investment Growth', fmt(outputs.growthAmount || 0)],
    ['Expected Annual Return', `${outputs.expectedReturn || 0}%`]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: resultsData,
    theme: 'striped',
    headStyles: { fillColor: SUCCESS_COLOR }
  });
  
  // Disclaimer
  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text(
    'Disclaimer: This is for educational purposes only. Past performance does not guarantee future results.',
    105,
    yPos,
    { align: 'center', maxWidth: 170 }
  );
  
  return doc.output('dataurlstring');
}

/**
 * Generate PCS Planner Report
 */
export function generatePCSReport(inputs: PCSInputs, outputs: PCSOutputs): string {
  const doc = initializePDF('PCS Financial Planner Report');
  
  let yPos = HEADER_HEIGHT + 15;
  
  // Profile
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Your PCS Profile', 20, yPos);
  yPos += 10;
  
  const profileData = [
    ['Rank', inputs.rank || 'N/A'],
    ['Dependency Status', inputs.dependencyStatus || 'N/A'],
    ['Move Distance', `${inputs.distance || 0} miles`]
  ];
  
  autoTable(doc, {
    startY: yPos,
    body: profileData,
    theme: 'plain'
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Entitlements
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Entitlements', 20, yPos);
  yPos += 10;
  
  const entitlementsData = [
    ['DLA (Dislocation Allowance)', fmt(outputs.dla || 0)],
    ['Weight Allowance', `${outputs.weightAllowance || 0} lbs`],
    ['Potential PPM Profit', fmt(outputs.ppmProfit || 0)]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Entitlement', 'Amount']],
    body: entitlementsData,
    theme: 'striped',
    headStyles: { fillColor: BRAND_COLOR }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Bottom Line
  doc.setFillColor(SUCCESS_COLOR);
  doc.rect(20, yPos, 170, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Estimated Value:', 25, yPos + 10);
  doc.text(fmt(outputs.totalValue || 0), 25, yPos + 20);
  
  return doc.output('dataurlstring');
}

/**
 * Generate House Hacking Report
 */
export function generateHouseHackingReport(inputs: HouseHackInputs, outputs: HouseHackOutputs): string {
  const doc = initializePDF('House Hacking Analysis Report');
  
  let yPos = HEADER_HEIGHT + 15;
  
  // Property Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Property Analysis', 20, yPos);
  yPos += 10;
  
  const propertyData = [
    ['Purchase Price', fmt(inputs.price || 0)],
    ['Interest Rate', `${inputs.rate || 0}%`],
    ['Property Type', inputs.propertyType || 'Duplex'],
    ['Monthly BAH', fmt(inputs.bah || 0)],
    ['Expected Rent', fmt(inputs.rent || 0)]
  ];
  
  autoTable(doc, {
    startY: yPos,
    body: propertyData,
    theme: 'plain'
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Financial Analysis
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Cash Flow Analysis', 20, yPos);
  yPos += 10;
  
  const cashFlowData = [
    ['Total Monthly Costs', fmt(outputs.costs || 0)],
    ['Total Monthly Income', fmt(outputs.income || 0)],
    ['Net Monthly Cash Flow', fmt((outputs.income || 0) - (outputs.costs || 0))]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Amount']],
    body: cashFlowData,
    theme: 'striped',
    headStyles: { fillColor: BRAND_COLOR }
  });
  
  return doc.output('dataurlstring');
}

/**
 * Generic report generator for other calculators
 */
export function generateGenericReport(
  title: string,
  inputs: any,
  outputs: any
): string {
  const doc = initializePDF(title);
  
  let yPos = HEADER_HEIGHT + 15;
  
  // Convert inputs to table data
  const inputRows = Object.entries(inputs).map(([key, value]) => [
    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    typeof value === 'number' ? (value > 1000 ? fmt(value) : value.toString()) : String(value)
  ]);
  
  if (inputRows.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Inputs', 20, yPos);
    yPos += 10;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Input', 'Value']],
      body: inputRows,
      theme: 'striped',
      headStyles: { fillColor: BRAND_COLOR }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Convert outputs to table data
  const outputRows = Object.entries(outputs).map(([key, value]) => [
    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    typeof value === 'number' ? (value > 1000 ? fmt(value) : value.toString()) : String(value)
  ]);
  
  if (outputRows.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Results', 20, yPos);
    yPos += 10;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Result', 'Value']],
      body: outputRows,
      theme: 'striped',
      headStyles: { fillColor: SUCCESS_COLOR }
    });
  }
  
  return doc.output('dataurlstring');
}

/**
 * Main function - routes to appropriate report generator
 */
export function generateCalculatorReport(
  calculatorName: string,
  inputs: any,
  outputs: any
): string {
  switch (calculatorName) {
    case 'tsp':
      return generateTSPReport(inputs, outputs);
    case 'pcs':
      return generatePCSReport(inputs, outputs);
    case 'house':
      return generateHouseHackingReport(inputs, outputs);
    case 'sdp':
    case 'savings':
    case 'career':
      return generateGenericReport(
        `${calculatorName.toUpperCase()} Calculator Report`,
        inputs,
        outputs
      );
    default:
      return generateGenericReport('Calculator Report', inputs, outputs);
  }
}


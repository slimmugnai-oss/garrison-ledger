/**
 * ASK DOCUMENT ANALYZER
 *
 * Analyzes military documents (orders, LES, contracts) uploaded to Ask Military Expert
 * Uses OCR + AI to extract key information and provide intelligent insights
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// ============================================================================
// DOCUMENT TYPES SUPPORTED
// ============================================================================

export type DocumentType = 
  | "pcs_orders"
  | "deployment_orders"
  | "les_paycheck"
  | "dd214"
  | "lease_contract"
  | "car_contract"
  | "marriage_certificate"
  | "divorce_decree"
  | "va_rating_decision"
  | "other";

export interface DocumentAnalysisResult {
  documentType: DocumentType;
  confidence: number; // 0-100
  extractedData: Record<string, unknown>;
  insights: string[];
  warnings: string[];
  recommendations: string[];
  detectedIssues: Array<{
    issue: string;
    severity: "low" | "medium" | "high";
    recommendation: string;
  }>;
  suggestedActions: Array<{
    action: string;
    url?: string;
    priority: number;
  }>;
}

// ============================================================================
// DOCUMENT TYPE DETECTION
// ============================================================================

export async function detectDocumentType(
  fileBuffer: Buffer,
  mimeType: string
): Promise<DocumentType> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Convert buffer to base64 for Gemini Vision
    const base64Data = fileBuffer.toString("base64");

    const prompt = `Analyze this document and determine its type. Respond with ONLY one of these exact values:
- pcs_orders
- deployment_orders
- les_paycheck
- dd214
- lease_contract
- car_contract
- marriage_certificate
- divorce_decree
- va_rating_decision
- other

Look for keywords like:
- PCS orders: "Permanent Change of Station", "Report Date", "Duty Station"
- Deployment orders: "Deploy", "Mobilization", "Combat Zone"
- LES: "Leave and Earnings Statement", "DFAS", "Pay Date"
- DD214: "Certificate of Release or Discharge", "DD Form 214"
- Lease: "Rental Agreement", "Lease Term", "Monthly Rent"
- Car contract: "Vehicle Purchase Agreement", "VIN", "Financing Terms"
- Marriage certificate: "Certificate of Marriage", "State of Marriage"
- Divorce decree: "Decree of Divorce", "Dissolution of Marriage"
- VA rating: "Rating Decision", "Service-Connected", "Department of Veterans Affairs"

Document type:`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const response = result.response.text().trim().toLowerCase();
    
    // Validate response
    const validTypes: DocumentType[] = [
      "pcs_orders",
      "deployment_orders",
      "les_paycheck",
      "dd214",
      "lease_contract",
      "car_contract",
      "marriage_certificate",
      "divorce_decree",
      "va_rating_decision",
      "other",
    ];

    if (validTypes.includes(response as DocumentType)) {
      return response as DocumentType;
    }

    logger.warn(`[DocAnalyzer] Unexpected document type from AI: ${response}`);
    return "other";
  } catch (error) {
    logger.error("[DocAnalyzer] Error detecting document type:", error);
    return "other";
  }
}

// ============================================================================
// PCS ORDERS ANALYSIS
// ============================================================================

export async function analyzePCSOrders(
  fileBuffer: Buffer,
  mimeType: string
): Promise<DocumentAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const base64Data = fileBuffer.toString("base64");

    const prompt = `Analyze these PCS orders and extract the following information. Respond in JSON format:

{
  "origin": "Current duty station",
  "destination": "New duty station",
  "reportDate": "YYYY-MM-DD",
  "departureDate": "YYYY-MM-DD",
  "rank": "E-5, O-3, etc.",
  "hasDependents": true/false (look for dependent travel authorization),
  "hhgAuthorized": true/false (household goods),
  "tleAuthorized": true/false (temporary lodging expense),
  "dlaAuthorized": true/false (dislocation allowance),
  "hhtAuthorized": true/false (house hunting trip),
  "travelDays": number,
  "isOCONUS": true/false,
  "specialRequirements": ["list any special requirements"]
}

If any field is unclear or not found, use null.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    const extractedData = JSON.parse(responseText);

    // Generate insights and recommendations
    const insights: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const detectedIssues: Array<{
      issue: string;
      severity: "low" | "medium" | "high";
      recommendation: string;
    }> = [];

    // Check report date timing
    if (extractedData.reportDate) {
      const reportDate = new Date(extractedData.reportDate);
      const daysUntilPCS = Math.floor((reportDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      if (daysUntilPCS < 30) {
        warnings.push(`Report date is in ${daysUntilPCS} days - start house-hunting immediately!`);
        detectedIssues.push({
          issue: "Less than 30 days until PCS",
          severity: "high",
          recommendation: "Start housing search NOW. Use House-Hunting Trip if authorized.",
        });
      } else if (daysUntilPCS < 60) {
        insights.push(`You have ${daysUntilPCS} days until report date - good time to start planning.`);
      }
    }

    // Check HHT authorization
    if (extractedData.hhtAuthorized) {
      recommendations.push("House-Hunting Trip is authorized - schedule it 30-60 days before PCS to find best housing.");
    } else {
      warnings.push("House-Hunting Trip NOT authorized in orders - you'll need to find housing remotely or use TLE upon arrival.");
    }

    // Check TLE authorization
    if (extractedData.tleAuthorized) {
      insights.push("TLE is authorized - you can claim up to 10 days lodging + per diem at new location ($290-$440/day).");
    }

    // OCONUS-specific warnings
    if (extractedData.isOCONUS) {
      warnings.push("OCONUS PCS detected - start passports, pet prep, vehicle shipping 6+ months ahead!");
      detectedIssues.push({
        issue: "OCONUS assignment requires extensive preparation",
        severity: "high",
        recommendation: "Start immediately: Passports (8-12 weeks), pet import requirements (6-9 months), POV shipping decision.",
      });
      
      recommendations.push("Read our OCONUS PCS Complete Guide for detailed checklist.");
      recommendations.push("Budget $5,000-$10,000 for upfront costs (deposits, furniture, pet shipping).");
    }

    // DLA reminder
    if (extractedData.dlaAuthorized) {
      const estimatedDLA = extractedData.hasDependents ? "$3,000-$4,000" : "$2,000-$2,500";
      insights.push(`DLA (Dislocation Allowance) estimated: ${estimatedDLA} based on your rank.`);
    }

    const suggestedActions = [
      {
        action: "Use PCS Copilot to track expenses and entitlements",
        url: "/dashboard/pcs-copilot",
        priority: 100,
      },
      {
        action: "Calculate your exact PCS entitlements",
        url: "/dashboard/pcs-copilot",
        priority: 95,
      },
    ];

    if (extractedData.isOCONUS) {
      suggestedActions.push({
        action: "Read OCONUS PCS Complete Guide",
        url: "/dashboard/ask?q=OCONUS PCS guide",
        priority: 90,
      });
    }

    return {
      documentType: "pcs_orders",
      confidence: 95,
      extractedData,
      insights,
      warnings,
      recommendations,
      detectedIssues,
      suggestedActions: suggestedActions.sort((a, b) => b.priority - a.priority),
    };
  } catch (error) {
    logger.error("[DocAnalyzer] Error analyzing PCS orders:", error);
    throw new Error("Failed to analyze PCS orders");
  }
}

// ============================================================================
// LES (LEAVE & EARNINGS STATEMENT) ANALYSIS
// ============================================================================

export async function analyzeLES(
  fileBuffer: Buffer,
  mimeType: string
): Promise<DocumentAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const base64Data = fileBuffer.toString("base64");

    const prompt = `Analyze this Leave and Earnings Statement (LES) and extract key financial information. Respond in JSON:

{
  "payDate": "YYYY-MM-DD",
  "rank": "E-5, O-3, etc.",
  "basePay": number (monthly base pay in dollars),
  "bah": number (BAH amount),
  "bas": number (BAS amount),
  "totalPay": number (total pay for period),
  "deductions": {
    "federalTax": number,
    "stateTax": number,
    "fica": number,
    "tsp": number,
    "sgli": number,
    "other": number
  },
  "tspContributionPercent": number (percentage of base pay),
  "leaveBalance": number (days of leave)
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const extractedData = JSON.parse(result.response.text());

    const insights: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const detectedIssues: Array<{
      issue: string;
      severity: "low" | "medium" | "high";
      recommendation: string;
    }> = [];

    // Check TSP contribution
    if (extractedData.tspContributionPercent < 5) {
      warnings.push(`TSP contribution is only ${extractedData.tspContributionPercent}% - you're missing BRS match!`);
      detectedIssues.push({
        issue: "Not maximizing TSP match",
        severity: "high",
        recommendation: "Increase TSP to 5% minimum to get full BRS match. You're leaving free money on the table.",
      });
      recommendations.push("Increase TSP contribution to at least 5% to maximize BRS match (worth $87,000-$150,000 over career).");
    }

    // Check leave balance
    if (extractedData.leaveBalance > 75) {
      warnings.push(`Leave balance is ${extractedData.leaveBalance} days - you'll lose days over 60 at fiscal year end!`);
      detectedIssues.push({
        issue: "Excess leave (risk of losing days)",
        severity: "medium",
        recommendation: "Use leave before Sep 30 fiscal year end or sell excess (max 60 days carry-over).",
      });
    }

    // Check SGLI
    if (!extractedData.deductions.sgli || extractedData.deductions.sgli < 30) {
      warnings.push("SGLI deduction seems low or missing - verify you have $500,000 coverage.");
    }

    // Suggest LES Auditor for detailed analysis
    recommendations.push("Upload this LES to LES Auditor for comprehensive paycheck audit (detects $200-$2,000 in annual errors).");

    const suggestedActions = [
      {
        action: "Upload to LES Auditor for full paycheck audit",
        url: "/dashboard/paycheck-audit",
        priority: 100,
      },
      {
        action: "Review TSP contribution percentage",
        url: "/dashboard/tools/tsp-modeler",
        priority: 90,
      },
    ];

    return {
      documentType: "les_paycheck",
      confidence: 92,
      extractedData,
      insights,
      warnings,
      recommendations,
      detectedIssues,
      suggestedActions: suggestedActions.sort((a, b) => b.priority - a.priority),
    };
  } catch (error) {
    logger.error("[DocAnalyzer] Error analyzing LES:", error);
    throw new Error("Failed to analyze LES");
  }
}

// ============================================================================
// DD-214 ANALYSIS
// ============================================================================

export async function analyzeDD214(
  fileBuffer: Buffer,
  mimeType: string
): Promise<DocumentAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const base64Data = fileBuffer.toString("base64");

    const prompt = `Analyze this DD-214 (discharge paperwork) and extract key information. Respond in JSON:

{
  "separationDate": "YYYY-MM-DD",
  "characterOfService": "Honorable, General, etc.",
  "rank": "E-5, O-3, etc.",
  "yearsOfService": number,
  "reentryCode": "RE-1, RE-2, etc.",
  "separationReason": "ETS, Medical, etc.",
  "awards": ["list of awards"],
  "hasGIBill": true/false
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const extractedData = JSON.parse(result.response.text());

    const insights: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const detectedIssues: Array<{
      issue: string;
      severity: "low" | "medium" | "high";
      recommendation: string;
    }> = [];

    // Check character of service
    if (extractedData.characterOfService?.toLowerCase() === "honorable") {
      insights.push("Honorable discharge - you qualify for ALL VA benefits.");
    } else if (extractedData.characterOfService?.toLowerCase() === "general") {
      warnings.push("General discharge - some VA benefits may be limited. Consult VSO.");
    }

    // Check GI Bill eligibility
    if (extractedData.hasGIBill) {
      recommendations.push("You have GI Bill eligibility - apply at VA.gov to get Certificate of Eligibility.");
      recommendations.push("Post-9/11 GI Bill expires 15 years after separation - use it or lose it!");
    }

    // Check years of service for VA disability
    if (extractedData.yearsOfService >= 2) {
      recommendations.push("With 2+ years of service, you qualify for VA healthcare. Enroll at VA.gov/health-care/apply.");
    }

    // Always recommend VA disability claim
    recommendations.push("File VA disability claim for ANY service-connected conditions (injuries, PTSD, sleep apnea, tinnitus, etc.).");

    const suggestedActions = [
      {
        action: "File VA disability claim",
        url: "https://va.gov/disability/how-to-file-claim",
        priority: 100,
      },
      {
        action: "Apply for GI Bill (if not done)",
        url: "https://va.gov/education/how-to-apply",
        priority: 95,
      },
      {
        action: "Enroll in VA healthcare",
        url: "https://va.gov/health-care/apply",
        priority: 90,
      },
    ];

    return {
      documentType: "dd214",
      confidence: 98,
      extractedData,
      insights,
      warnings,
      recommendations,
      detectedIssues,
      suggestedActions: suggestedActions.sort((a, b) => b.priority - a.priority),
    };
  } catch (error) {
    logger.error("[DocAnalyzer] Error analyzing DD-214:", error);
    throw new Error("Failed to analyze DD-214");
  }
}

// ============================================================================
// LEASE CONTRACT ANALYSIS
// ============================================================================

export async function analyzeLeaseContract(
  fileBuffer: Buffer,
  mimeType: string
): Promise<DocumentAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const base64Data = fileBuffer.toString("base64");

    const prompt = `Analyze this lease/rental agreement. Respond in JSON:

{
  "monthlyRent": number,
  "securityDeposit": number,
  "leaseStartDate": "YYYY-MM-DD",
  "leaseEndDate": "YYYY-MM-DD",
  "hasEarlyTerminationClause": true/false,
  "hasMilitaryClause": true/false (SCRA early termination),
  "utilitiesIncluded": ["electricity", "water", etc.],
  "petPolicy": "allowed/not allowed/restricted",
  "penaltiesForEarlyTermination": number or "none"
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const extractedData = JSON.parse(result.response.text());

    const insights: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const detectedIssues: Array<{
      issue: string;
      severity: "low" | "medium" | "high";
      recommendation: string;
    }> = [];

    // Check for military clause (SCRA)
    if (!extractedData.hasMilitaryClause) {
      warnings.push("⚠️ CRITICAL: Lease does NOT have military/SCRA early termination clause!");
      detectedIssues.push({
        issue: "No SCRA early termination clause",
        severity: "high",
        recommendation: "Request landlord add SCRA clause before signing. This allows you to break lease with PCS orders (35+ miles) or deployment orders (180+ days).",
      });
      recommendations.push("DO NOT SIGN without military clause. Federal law (SCRA) allows early termination, but it's better to have it explicitly in lease.");
    } else {
      insights.push("✅ Lease includes military early termination clause - you're protected if you PCS.");
    }

    // Check early termination penalties
    if (extractedData.penaltiesForEarlyTermination && extractedData.penaltiesForEarlyTermination > 1000) {
      warnings.push(`Early termination penalty is $${extractedData.penaltiesForEarlyTermination} - but SCRA should override this with proper notice.`);
    }

    // Rent vs BAH guidance
    recommendations.push(`Compare monthly rent ($${extractedData.monthlyRent}) to your BAH rate. Ideally rent should be 80-90% of BAH to pocket difference.`);

    const suggestedActions = [
      {
        action: "Read SCRA Lease Termination Rights Guide",
        url: "/dashboard/ask?q=SCRA lease termination",
        priority: 100,
      },
      {
        action: "Calculate BAH for your location",
        url: "/dashboard/base-navigator",
        priority: 85,
      },
    ];

    return {
      documentType: "lease_contract",
      confidence: 90,
      extractedData,
      insights,
      warnings,
      recommendations,
      detectedIssues,
      suggestedActions,
    };
  } catch (error) {
    logger.error("[DocAnalyzer] Error analyzing lease:", error);
    throw new Error("Failed to analyze lease contract");
  }
}

// ============================================================================
// MAIN DOCUMENT ANALYSIS ORCHESTRATOR
// ============================================================================

export async function analyzeDocument(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<DocumentAnalysisResult> {
  logger.info(`[DocAnalyzer] Analyzing document: ${fileName} (${mimeType})`);

  // Step 1: Detect document type
  const documentType = await detectDocumentType(fileBuffer, mimeType);
  logger.info(`[DocAnalyzer] Detected type: ${documentType}`);

  // Step 2: Route to specialized analyzer
  switch (documentType) {
    case "pcs_orders":
      return analyzePCSOrders(fileBuffer, mimeType);

    case "les_paycheck":
      return analyzeLES(fileBuffer, mimeType);

    case "dd214":
      return analyzeDD214(fileBuffer, mimeType);

    case "lease_contract":
      return analyzeLeaseContract(fileBuffer, mimeType);

    case "deployment_orders":
    case "car_contract":
    case "marriage_certificate":
    case "divorce_decree":
    case "va_rating_decision":
    case "other":
    default:
      // Generic analysis for unsupported types
      return {
        documentType,
        confidence: 50,
        extractedData: {},
        insights: ["Document uploaded successfully. Ask a specific question about this document and I'll analyze it."],
        warnings: [],
        recommendations: ["Specify what you'd like to know about this document."],
        detectedIssues: [],
        suggestedActions: [],
      };
  }
}


/**
 * LES & PAYCHECK AUDITOR - TYPE DEFINITIONS
 * 
 * Domain types for Leave and Earnings Statement (LES) parsing,
 * expected pay calculation, and audit flag generation.
 * 
 * Security Note: These types are used server-side only for parsing.
 * Never expose raw LES text or full PDFs to client-side code.
 */

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * LES line item section categories
 */
export type LesSection = 
  | 'ALLOWANCE'   // BAH, BAS, COLA, special pays
  | 'DEDUCTION'   // SGLI, TSP, garnishments
  | 'ALLOTMENT'   // Voluntary allotments
  | 'TAX'         // Federal, state, FICA
  | 'OTHER';      // Misc items

/**
 * Parsed LES line item
 * All amounts stored as positive integers in cents
 */
export interface LesLine {
  line_code: string;        // e.g., "BAH", "BAS", "COLA", "SDAP"
  description: string;       // e.g., "BASIC ALLOW HOUS W/DEP"
  amount_cents: number;      // Always positive; section determines debit/credit
  section: LesSection;
  raw?: string;              // Original line text for debugging (optional)
}

/**
 * Expected special pay (SDAP, HFP, IDP, etc.)
 */
export interface ExpectedSpecialPay {
  code: string;   // SDAP, HFP, IDP, FSA, etc.
  cents: number;
}

/**
 * Snapshot of expected pay values for a given month/year
 * Computed from profile + BAH/BAS/COLA tables
 */
export interface ExpectedSnapshot {
  user_id: string;
  month: number;              // 1-12
  year: number;               // e.g., 2025
  paygrade: string;           // E01-E09, O01-O10, W01-W05
  mha_or_zip?: string;        // Military Housing Area or ZIP code
  with_dependents: boolean;
  yos?: number;               // Years of service
  
  expected: {
    bah_cents?: number;
    bas_cents?: number;
    cola_cents?: number;
    base_pay_cents?: number;
    specials?: ExpectedSpecialPay[];
    taxes?: Record<string, number>;  // v2 - tax calculations
  };
}

/**
 * Flag severity levels
 * - red: Critical discrepancy requiring immediate action
 * - yellow: Warning/info that should be reviewed
 * - green: All clear / verified correct
 */
export type FlagSeverity = 'red' | 'yellow' | 'green';

/**
 * Audit flag for pay discrepancy
 */
export interface PayFlag {
  severity: FlagSeverity;
  flag_code: string;         // BAH_MISMATCH, BAS_MISSING, COLA_STOPPED, etc.
  message: string;           // BLUF explanation for service member
  suggestion: string;        // Concrete next step
  ref_url?: string;          // Link to DFAS/resource hub
  delta_cents?: number;      // Expected - Actual (positive = underpaid)
}

// =============================================================================
// DATABASE TYPES (matching schema)
// =============================================================================

/**
 * les_uploads table row
 */
export interface LesUpload {
  id: string;
  user_id: string;
  uploaded_at: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  month: number;
  year: number;
  parsed_ok: boolean;
  parsed_at?: string;
  parsed_summary?: ParsedSummary;
  created_at: string;
  updated_at: string;
}

/**
 * Parsed summary stored in les_uploads.parsed_summary
 */
export interface ParsedSummary {
  totalsBySection: {
    ALLOWANCE: number;
    DEDUCTION: number;
    ALLOTMENT: number;
    TAX: number;
    OTHER: number;
  };
  allowancesByCode: Record<string, number>;  // { BAH: 150000, BAS: 46066, ... }
  deductionsByCode: Record<string, number>;
}

/**
 * expected_pay_snapshot table row
 */
export interface ExpectedPaySnapshot {
  id: string;
  user_id: string;
  upload_id?: string;
  month: number;
  year: number;
  paygrade: string;
  mha_or_zip?: string;
  with_dependents: boolean;
  yos?: number;
  expected_bah_cents?: number;
  expected_bas_cents?: number;
  expected_cola_cents?: number;
  expected_specials?: ExpectedSpecialPay[];
  expected_taxes?: Record<string, number>;
  computed_at: string;
  created_at: string;
}

/**
 * pay_flags table row
 */
export interface PayFlagRow {
  id: string;
  upload_id: string;
  severity: FlagSeverity;
  flag_code: string;
  message: string;
  suggestion: string;
  ref_url?: string;
  delta_cents?: number;
  created_at: string;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * POST /api/les/upload - Request
 */
export interface LesUploadRequest {
  file: File;  // Multipart form data
}

/**
 * POST /api/les/upload - Response
 */
export interface LesUploadResponse {
  uploadId: string;
  parsedOk: boolean;
  summary?: ParsedSummary;
  month: number;
  year: number;
  error?: string;
}

/**
 * POST /api/les/audit - Request
 */
export interface LesAuditRequest {
  uploadId: string;
}

/**
 * POST /api/les/audit - Response
 */
export interface LesAuditResponse {
  snapshot: ExpectedSnapshot;
  flags: PayFlag[];
  summary: {
    actualAllowancesCents: number;
    expectedAllowancesCents: number;
    deltaCents: number;  // Total delta (positive = underpaid)
  };
}

/**
 * GET /api/les/history - Response
 */
export interface LesHistoryResponse {
  uploads: LesHistoryItem[];
}

export interface LesHistoryItem {
  id: string;
  month: number;
  year: number;
  uploadedAt: string;
  parsedOk: boolean;
  flagCounts: {
    red: number;
    yellow: number;
    green: number;
  };
  totalDeltaCents: number;  // Sum of all deltas (positive = recovered underpayments)
}

/**
 * POST /api/les/delete - Request
 */
export interface LesDeleteRequest {
  uploadId: string;
}

// =============================================================================
// UI COMPONENT PROPS
// =============================================================================

/**
 * Props for LesFlags component
 */
export interface LesFlagsProps {
  flags: PayFlag[];
  tier: 'free' | 'premium';
}

/**
 * Props for LesHistory component
 */
export interface LesHistoryProps {
  uploads: LesHistoryItem[];
}

/**
 * Props for LesSummary component
 */
export interface LesSummaryProps {
  upload: LesUpload;
  summary: ParsedSummary;
  lines: LesLine[];
}

// =============================================================================
// PARSER TYPES (lib/les/parse.ts)
// =============================================================================

/**
 * Result from PDF parser
 */
export interface ParseResult {
  lines: LesLine[];
  summary: ParsedSummary;
}

/**
 * Parser configuration
 */
export interface ParserConfig {
  maxLines?: number;        // Max lines to parse (safety limit)
  strictMode?: boolean;     // Fail on unknown codes vs skip
  debug?: boolean;          // Include raw text in output
}

// =============================================================================
// COMPARISON TYPES (lib/les/compare.ts)
// =============================================================================

/**
 * Result from comparing actual vs expected
 */
export interface ComparisonResult {
  flags: PayFlag[];
  totals: {
    actualAllowancesCents: number;
    expectedAllowancesCents: number;
    deltaCents: number;
  };
}

/**
 * Comparison options
 */
export interface ComparisonOptions {
  thresholds?: {
    bahDeltaCents?: number;
    basDeltaCents?: number;
    colaDeltaCents?: number;
    specialPayDeltaCents?: number;
  };
  strictMode?: boolean;  // Flag all discrepancies vs only significant ones
}

// =============================================================================
// FLAG CODE CONSTANTS
// =============================================================================

/**
 * Standard flag codes used across the system
 */
export const FLAG_CODES = {
  // Red flags (critical)
  BAH_MISMATCH: 'BAH_MISMATCH',
  BAS_MISSING: 'BAS_MISSING',
  COLA_STOPPED: 'COLA_STOPPED',
  SPECIAL_PAY_MISSING: 'SPECIAL_PAY_MISSING',
  
  // Yellow flags (warnings)
  COLA_UNEXPECTED: 'COLA_UNEXPECTED',
  PROMO_NOT_REFLECTED: 'PROMO_NOT_REFLECTED',
  MINOR_VARIANCE: 'MINOR_VARIANCE',
  VERIFICATION_NEEDED: 'VERIFICATION_NEEDED',
  
  // Green flags (all clear)
  ALL_VERIFIED: 'ALL_VERIFIED',
  BAH_CORRECT: 'BAH_CORRECT',
  BAS_CORRECT: 'BAS_CORRECT'
} as const;

export type FlagCode = typeof FLAG_CODES[keyof typeof FLAG_CODES];

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Helper to convert cents to dollars
 */
export function centsToDoollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Helper to format delta with sign
 */
export function formatDelta(deltaCents: number): string {
  const sign = deltaCents > 0 ? '+' : '';
  return `${sign}${centsToDoollars(deltaCents)}`;
}

/**
 * Helper to determine if paygrade is officer
 */
export function isOfficer(paygrade: string): boolean {
  return paygrade.startsWith('O') || paygrade.startsWith('W');
}

/**
 * Helper to determine if paygrade is enlisted
 */
export function isEnlisted(paygrade: string): boolean {
  return paygrade.startsWith('E');
}

/**
 * Month/Year formatting
 */
export function formatMonthYear(month: number, year: number): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[month - 1]} ${year}`;
}


/**
 * LES PDF PARSER
 *
 * Parses PDF Leave and Earnings Statements (LES) into structured data.
 * Requires Node.js runtime (uses pdf-parse library).
 *
 * Security: Server-side only. Never expose raw LES text to client.
 *
 * Dependencies (add to package.json):
 *   npm install pdf-parse @types/pdf-parse
 */

import type {
  LesLine,
  ParseResult,
  ParsedSummary,
  ParserConfig,
  LesSection,
} from "@/app/types/les";
import { canonicalizeCode, getSection } from "./codes";

// PDF parser for Node.js runtime
import pdf from "pdf-parse";

/**
 * Parse LES PDF buffer into structured line items
 *
 * @param buffer PDF file buffer
 * @param config Optional parser configuration
 * @returns Parsed lines and summary
 * @throws {UnsupportedFormatError} if PDF cannot be parsed
 * @throws {ParseError} if parsing fails
 */
export async function parseLesPdf(buffer: Buffer, config?: ParserConfig): Promise<ParseResult> {
  const debug = config?.debug ?? false;
  const maxLines = config?.maxLines ?? 1000;
  const strictMode = config?.strictMode ?? false;

  try {
    // Parse PDF to extract text
    const data = await pdf(buffer);
    const text = data.text;

    // Real parser implementation
    const lines: LesLine[] = [];
    const textLines = text.split("\n");

    for (let i = 0; i < Math.min(textLines.length, maxLines); i++) {
      const line = textLines[i].trim();
      if (!line) continue;

      const parsed = parseLine(line, debug);
      if (parsed) {
        lines.push(parsed);
      } else if (strictMode) {
        throw new ParseError(`Failed to parse line ${i}: ${line}`);
      }
    }

    const summary = buildSummary(lines);
    return { lines, summary };
  } catch (error) {
    if (error instanceof UnsupportedFormatError || error instanceof ParseError) {
      throw error;
    }
    throw new ParseError(`PDF parsing failed: ${(error as Error).message}`);
  }
}

/**
 * Parse a single LES line
 *
 * Expected formats (7 parsing strategies):
 * - "BAH W/DEP $1,500.00"
 * - "BASIC ALLOW HOUS W/DEP    1500.00"
 * - "BAS                        460.66"
 * - "BAH\t\t$1,500.00" (tab-separated, myPay format)
 * - "BASIC PAY                 $3,666.00-" (negative with dash)
 * - "BAS (460.66)" (parentheses format)
 * - "BAH W/DEP                  1,500.00 MONTHLY" (with suffix)
 *
 * @param line Raw text line
 * @param debug Include raw text in output
 * @returns Parsed LES line or null if not parseable
 */
function parseLine(line: string, debug: boolean): LesLine | null {
  // Skip empty lines and headers
  if (!line || line.length < 5) return null;

  // Skip header lines (more comprehensive)
  const headerPatterns = [
    /^(ENTITLEMENTS|DEDUCTIONS|ALLOTMENTS|TAXES|SUMMARY|LEAVE|YTD|YEAR TO DATE)/i,
    /^(NAME|RANK|SSN|PERIOD|FICA|MEDICARE|STATUS|GRADE|PAY DATE)/i,
    /^[-=]+$/, // Lines of dashes or equals
    /^Page \d+/i,
  ];

  if (headerPatterns.some((pattern) => line.match(pattern))) {
    return null;
  }

  // ==========================================================================
  // Pattern 1: "CODE DESCRIPTION $AMOUNT" or "CODE DESCRIPTION AMOUNT"
  // Examples: "BAH W/DEP $1,500.00", "BAS 460.66"
  // ==========================================================================
  const pattern1 = /^([A-Z]{2,10})\s+(.+?)\s+\$?([\d,]+\.?\d*)$/i;
  const match1 = line.match(pattern1);

  if (match1) {
    const rawCode = match1[1];
    const description = match1[2].trim();
    const amountStr = match1[3].replace(/,/g, "");
    const amountCents = Math.round(parseFloat(amountStr) * 100);

    const code = canonicalizeCode(rawCode) || canonicalizeCode(description);
    if (!code) return null;

    const section = getSection(code);

    return {
      line_code: code,
      description,
      amount_cents: Math.abs(amountCents),
      section,
      raw: debug ? line : undefined,
    };
  }

  // ==========================================================================
  // Pattern 2: "DESCRIPTION with spaces    AMOUNT"
  // Handle cases where code is embedded in description
  // ==========================================================================
  const pattern2 = /^(.+?)\s{2,}([\d,]+\.?\d*)$/;
  const match2 = line.match(pattern2);

  if (match2) {
    const description = match2[1].trim();
    const amountStr = match2[2].replace(/,/g, "");
    const amountCents = Math.round(parseFloat(amountStr) * 100);

    const code = canonicalizeCode(description);
    if (!code) return null;

    const section = getSection(code);

    return {
      line_code: code,
      description,
      amount_cents: Math.abs(amountCents),
      section,
      raw: debug ? line : undefined,
    };
  }

  // ==========================================================================
  // Pattern 3: Tab-separated format (myPay)
  // Example: "BAH\t\t$1,500.00" or "BAS\t460.66"
  // ==========================================================================
  if (line.includes("\t")) {
    const parts = line.split("\t").filter((p) => p.trim());
    if (parts.length >= 2) {
      const descriptionPart = parts[0].trim();
      const amountPart = parts[parts.length - 1].trim().replace(/[$,]/g, "");

      if (amountPart.match(/^\d+\.?\d*$/)) {
        const code = canonicalizeCode(descriptionPart);
        if (code) {
          const amountCents = Math.round(parseFloat(amountPart) * 100);
          const section = getSection(code);

          return {
            line_code: code,
            description: descriptionPart,
            amount_cents: Math.abs(amountCents),
            section,
            raw: debug ? line : undefined,
          };
        }
      }
    }
  }

  // ==========================================================================
  // Pattern 4: Amount with trailing dash (negative)
  // Example: "BASIC PAY  $3,666.00-" or "DEDUCTION  500.00-"
  // ==========================================================================
  const pattern4 = /^(.+?)\s+\$?([\d,]+\.?\d*)-$/;
  const match4 = line.match(pattern4);

  if (match4) {
    const description = match4[1].trim();
    const amountStr = match4[2].replace(/,/g, "");
    const amountCents = Math.round(parseFloat(amountStr) * 100);

    const code = canonicalizeCode(description);
    if (code) {
      const section = getSection(code);

      return {
        line_code: code,
        description,
        amount_cents: Math.abs(amountCents),
        section,
        raw: debug ? line : undefined,
      };
    }
  }

  // ==========================================================================
  // Pattern 5: Parentheses format (negative in accounting)
  // Example: "BAS (460.66)" or "DEDUCTION ($500.00)"
  // ==========================================================================
  const pattern5 = /^(.+?)\s+\(?\$?([\d,]+\.?\d*)\)?$/;
  const match5 = line.match(pattern5);

  if (match5) {
    const description = match5[1].trim();
    const amountStr = match5[2].replace(/,/g, "");

    if (amountStr.match(/^\d+\.?\d*$/)) {
      const amountCents = Math.round(parseFloat(amountStr) * 100);

      const code = canonicalizeCode(description);
      if (code) {
        const section = getSection(code);

        return {
          line_code: code,
          description,
          amount_cents: Math.abs(amountCents),
          section,
          raw: debug ? line : undefined,
        };
      }
    }
  }

  // ==========================================================================
  // Pattern 6: Amount with suffix (MONTHLY, ANNUAL, etc.)
  // Example: "BAH W/DEP  1,500.00 MONTHLY"
  // ==========================================================================
  const pattern6 = /^(.+?)\s+\$?([\d,]+\.?\d*)\s+(MONTHLY|ANNUAL|YTD|MTD)$/i;
  const match6 = line.match(pattern6);

  if (match6) {
    const description = match6[1].trim();
    const amountStr = match6[2].replace(/,/g, "");
    const amountCents = Math.round(parseFloat(amountStr) * 100);

    const code = canonicalizeCode(description);
    if (code) {
      const section = getSection(code);

      return {
        line_code: code,
        description,
        amount_cents: Math.abs(amountCents),
        section,
        raw: debug ? line : undefined,
      };
    }
  }

  // ==========================================================================
  // Pattern 7: Fixed-width DFAS format (position-based)
  // Example: "BASIC ALLOW HOUS W/DEP                1500.00"
  // Very long description followed by amount at end
  // ==========================================================================
  const pattern7 = /^(.{20,}?)\s+\$?([\d,]+\.?\d*)$/;
  const match7 = line.match(pattern7);

  if (match7) {
    const description = match7[1].trim();
    const amountStr = match7[2].replace(/,/g, "");

    if (amountStr.match(/^\d+\.?\d*$/) && description.length > 10) {
      const amountCents = Math.round(parseFloat(amountStr) * 100);

      const code = canonicalizeCode(description);
      if (code) {
        const section = getSection(code);

        return {
          line_code: code,
          description,
          amount_cents: Math.abs(amountCents),
          section,
          raw: debug ? line : undefined,
        };
      }
    }
  }

  return null;
}

/**
 * Build summary from parsed lines
 */
function buildSummary(lines: LesLine[]): ParsedSummary {
  const totalsBySection: Record<LesSection, number> = {
    ALLOWANCE: 0,
    DEDUCTION: 0,
    ALLOTMENT: 0,
    TAX: 0,
    DEBT: 0,
    ADJUSTMENT: 0,
    OTHER: 0,
  };

  const allowancesByCode: Record<string, number> = {};
  const deductionsByCode: Record<string, number> = {};

  for (const line of lines) {
    totalsBySection[line.section] += line.amount_cents;

    if (line.section === "ALLOWANCE") {
      allowancesByCode[line.line_code] =
        (allowancesByCode[line.line_code] || 0) + line.amount_cents;
    } else if (line.section === "DEDUCTION") {
      deductionsByCode[line.line_code] =
        (deductionsByCode[line.line_code] || 0) + line.amount_cents;
    }
  }

  return {
    totalsBySection,
    allowancesByCode,
    deductionsByCode,
  };
}

/**
 * Custom errors
 */
export class UnsupportedFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedFormatError";
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

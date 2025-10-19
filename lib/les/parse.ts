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
  LesSection
} from '@/app/types/les';
import { canonicalizeCode, getSection } from './codes';

// PDF parser for Node.js runtime
import pdf from 'pdf-parse';

/**
 * Parse LES PDF buffer into structured line items
 * 
 * @param buffer PDF file buffer
 * @param config Optional parser configuration
 * @returns Parsed lines and summary
 * @throws {UnsupportedFormatError} if PDF cannot be parsed
 * @throws {ParseError} if parsing fails
 */
export async function parseLesPdf(
  buffer: Buffer,
  config?: ParserConfig
): Promise<ParseResult> {
  const debug = config?.debug ?? false;
  const maxLines = config?.maxLines ?? 1000;
  const strictMode = config?.strictMode ?? false;

  try {
    // Parse PDF to extract text
    const data = await pdf(buffer);
    const text = data.text;
    
    // Real parser implementation
    const lines: LesLine[] = [];
    const textLines = text.split('\n');
    
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
 * Expected formats:
 * - "BAH W/DEP $1,500.00"
 * - "BASIC ALLOW HOUS W/DEP    1500.00"
 * - "BAS                        460.66"
 * 
 * @param line Raw text line
 * @param debug Include raw text in output
 * @returns Parsed LES line or null if not parseable
 */
function parseLine(line: string, debug: boolean): LesLine | null {
  // Skip empty lines and headers
  if (!line || line.length < 5) return null;
  if (line.match(/^(ENTITLEMENTS|DEDUCTIONS|ALLOTMENTS|TAXES|SUMMARY)/i)) return null;
  
  // Pattern 1: "CODE DESCRIPTION $AMOUNT" or "CODE DESCRIPTION AMOUNT"
  // Examples:
  // - "BAH W/DEP $1,500.00"
  // - "BAS 460.66"
  const pattern1 = /^([A-Z]{2,10})\s+(.+?)\s+\$?([\d,]+\.?\d*)$/i;
  const match1 = line.match(pattern1);
  
  if (match1) {
    const rawCode = match1[1];
    const description = match1[2].trim();
    const amountStr = match1[3].replace(/,/g, '');
    const amountCents = Math.round(parseFloat(amountStr) * 100);
    
    const code = canonicalizeCode(rawCode) || canonicalizeCode(description);
    if (!code) return null;
    
    const section = getSection(code);
    
    return {
      line_code: code,
      description,
      amount_cents: Math.abs(amountCents), // Always positive
      section,
      raw: debug ? line : undefined
    };
  }
  
  // Pattern 2: "DESCRIPTION with spaces    AMOUNT"
  // Handle cases where code is embedded in description
  const pattern2 = /^(.+?)\s{2,}([\d,]+\.?\d*)$/;
  const match2 = line.match(pattern2);
  
  if (match2) {
    const description = match2[1].trim();
    const amountStr = match2[2].replace(/,/g, '');
    const amountCents = Math.round(parseFloat(amountStr) * 100);
    
    const code = canonicalizeCode(description);
    if (!code) return null;
    
    const section = getSection(code);
    
    return {
      line_code: code,
      description,
      amount_cents: Math.abs(amountCents),
      section,
      raw: debug ? line : undefined
    };
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
    OTHER: 0
  };
  
  const allowancesByCode: Record<string, number> = {};
  const deductionsByCode: Record<string, number> = {};
  
  for (const line of lines) {
    totalsBySection[line.section] += line.amount_cents;
    
    if (line.section === 'ALLOWANCE') {
      allowancesByCode[line.line_code] = (allowancesByCode[line.line_code] || 0) + line.amount_cents;
    } else if (line.section === 'DEDUCTION') {
      deductionsByCode[line.line_code] = (deductionsByCode[line.line_code] || 0) + line.amount_cents;
    }
  }
  
  return {
    totalsBySection,
    allowancesByCode,
    deductionsByCode
  };
}

/**
 * Custom errors
 */
export class UnsupportedFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedFormatError';
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}


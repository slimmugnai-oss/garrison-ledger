#!/usr/bin/env ts-node
/**
 * SECRET SCANNER
 * 
 * Scans codebase for exposed API keys, tokens, and credentials.
 * Runs in CI and pre-commit hooks to prevent secret exposure.
 * 
 * Usage:
 *   npm run secret-scan
 *   npm run secret-scan -- --fix (to auto-mask found secrets)
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

// Secret patterns to detect
const SECRET_PATTERNS = [
  {
    name: 'Google API Key',
    pattern: /AIzaSy[a-zA-Z0-9_-]{33}/g,
    severity: 'HIGH',
    mask: (match: string) => `${match.slice(0, 6)}****${match.slice(-3)}`
  },
  {
    name: 'GreatSchools API Key',
    pattern: /uMuZB1PZdohiyLmJ7rVt2psjHRLHQjZ5Z868lCld/g,
    severity: 'HIGH',
    mask: (match: string) => `${match.slice(0, 4)}****${match.slice(-3)}`
  },
  {
    name: 'Generic API Key',
    pattern: /(api[_-]?key|apikey)\s*[=:]\s*['\"]?([a-zA-Z0-9_-]{32,})['\"]?/gi,
    severity: 'HIGH',
    mask: (match: string) => match.replace(/([a-zA-Z0-9_-]{32,})/, '****_masked')
  },
  {
    name: 'Stripe Secret Key',
    pattern: /sk_(test|live)_[a-zA-Z0-9]{24,}/g,
    severity: 'CRITICAL',
    mask: (match: string) => `${match.slice(0, 8)}****${match.slice(-4)}`
  },
  {
    name: 'Clerk Secret Key',
    pattern: /sk_[a-z]+_[a-zA-Z0-9]{32,}/g,
    severity: 'CRITICAL',
    mask: (match: string) => `${match.slice(0, 7)}****${match.slice(-4)}`
  },
  {
    name: 'Supabase Service Role Key',
    pattern: /eyJ[a-zA-Z0-9_-]{100,}/g,
    severity: 'CRITICAL',
    mask: (match: string) => `${match.slice(0, 10)}****${match.slice(-10)}`
  },
  {
    name: 'Generic Secret/Token',
    pattern: /(secret|token|password)\s*[=:]\s*['\"]?([a-zA-Z0-9_-]{20,})['\"]?/gi,
    severity: 'MEDIUM',
    mask: (match: string) => match.replace(/([a-zA-Z0-9_-]{20,})/, '****_masked')
  },
  {
    name: 'RapidAPI Key',
    pattern: /RAPIDAPI_KEY\s*=\s*[a-zA-Z0-9_-]{32,}/gi,
    severity: 'HIGH',
    mask: (match: string) => match.replace(/=\s*[a-zA-Z0-9_-]{32,}/, '=****_your_key_here')
  }
];

// Files/directories to skip
const IGNORE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  'dist/**',
  'build/**',
  '.git/**',
  '*.log',
  'package-lock.json',
  'SECURITY_NOTICE_REMEDIATION.md' // Intentionally contains examples
];

// File extensions to scan
const SCAN_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.md',
  '.json',
  '.env.example',
  '.yml',
  '.yaml'
];

interface SecretMatch {
  file: string;
  line: number;
  column: number;
  pattern: string;
  match: string;
  severity: string;
  context: string;
}

async function scanFiles(): Promise<SecretMatch[]> {
  const matches: SecretMatch[] = [];
  
  // Get all files to scan
  const files = await glob('**/*', {
    ignore: IGNORE_PATTERNS,
    nodir: true,
    absolute: false
  });

  // Filter by extension
  const filesToScan = files.filter(file => 
    SCAN_EXTENSIONS.some(ext => file.endsWith(ext))
  );

  console.log(`${colors.blue}Scanning ${filesToScan.length} files for secrets...${colors.reset}\n`);

  for (const file of filesToScan) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      SECRET_PATTERNS.forEach(({ name, pattern, severity }) => {
        // Reset regex state
        pattern.lastIndex = 0;
        
        let match;
        while ((match = pattern.exec(line)) !== null) {
          matches.push({
            file,
            line: lineIndex + 1,
            column: match.index + 1,
            pattern: name,
            match: match[0],
            severity,
            context: line.trim()
          });
        }
      });
    });
  }

  return matches;
}

function formatMatches(matches: SecretMatch[]): void {
  if (matches.length === 0) {
    console.log(`${colors.green}${colors.bold}✓ No secrets detected!${colors.reset}\n`);
    return;
  }

  console.log(`${colors.red}${colors.bold}✗ Found ${matches.length} potential secret(s):${colors.reset}\n`);

  // Group by file
  const byFile = matches.reduce((acc, match) => {
    if (!acc[match.file]) acc[match.file] = [];
    acc[match.file].push(match);
    return acc;
  }, {} as Record<string, SecretMatch[]>);

  Object.entries(byFile).forEach(([file, fileMatches]) => {
    console.log(`${colors.yellow}${file}${colors.reset}`);
    fileMatches.forEach(match => {
      const severityColor = match.severity === 'CRITICAL' ? colors.red :
                           match.severity === 'HIGH' ? colors.yellow :
                           colors.blue;
      
      console.log(`  ${severityColor}${match.severity}${colors.reset} ${match.pattern}`);
      console.log(`    Line ${match.line}:${match.column}`);
      console.log(`    ${match.context.substring(0, 100)}${match.context.length > 100 ? '...' : ''}`);
      console.log('');
    });
  });

  console.log(`${colors.red}${colors.bold}SECURITY VIOLATION: Secrets detected in codebase!${colors.reset}`);
  console.log(`${colors.yellow}Action required: Remove or mask these secrets immediately.${colors.reset}\n`);
}

async function autoMask(matches: SecretMatch[]): Promise<number> {
  let maskedCount = 0;
  
  // Group by file
  const byFile = matches.reduce((acc, match) => {
    if (!acc[match.file]) acc[match.file] = [];
    acc[match.file].push(match);
    return acc;
  }, {} as Record<string, SecretMatch[]>);

  Object.entries(byFile).forEach(([file, fileMatches]) => {
    let content = fs.readFileSync(file, 'utf-8');
    
    fileMatches.forEach(match => {
      const pattern = SECRET_PATTERNS.find(p => p.name === match.pattern);
      if (pattern && pattern.mask) {
        const masked = pattern.mask(match.match);
        content = content.replace(match.match, masked);
        maskedCount++;
      }
    });

    fs.writeFileSync(file, content, 'utf-8');
    console.log(`${colors.green}✓ Masked secrets in ${file}${colors.reset}`);
  });

  return maskedCount;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');

  console.log(`${colors.bold}${colors.blue}🔒 Garrison Ledger Secret Scanner${colors.reset}\n`);

  const matches = await scanFiles();

  if (shouldFix && matches.length > 0) {
    console.log(`${colors.yellow}Auto-masking ${matches.length} secrets...${colors.reset}\n`);
    const maskedCount = await autoMask(matches);
    console.log(`\n${colors.green}✓ Masked ${maskedCount} secret(s)${colors.reset}`);
    console.log(`${colors.yellow}⚠ Review changes before committing!${colors.reset}\n`);
    process.exit(0);
  } else {
    formatMatches(matches);
    
    if (matches.length > 0) {
      console.log(`${colors.yellow}Tip: Run 'npm run secret-scan -- --fix' to auto-mask secrets${colors.reset}\n`);
      process.exit(1); // Exit with error code for CI
    }
  }
}

main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});


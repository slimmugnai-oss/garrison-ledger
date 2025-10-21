#!/usr/bin/env ts-node
/**
 * EMPTY CATCH BLOCK AUDITOR
 * 
 * Finds all empty catch blocks in the codebase
 * Helps track progress on error handling improvements
 * 
 * Usage:
 * npx ts-node scripts/audit-empty-catches.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface EmptyCatchLocation {
  file: string;
  lineNumber: number;
  context: string;
}

const TARGET_DIRS = ['app', 'lib'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'out'];

console.log('🔍 Auditing empty catch blocks...\n');

const results: EmptyCatchLocation[] = [];

// Use ripgrep to find catch blocks
try {
  const output = execSync(
    `grep -rn "catch.*{" ${TARGET_DIRS.join(' ')} --include="*.ts" --include="*.tsx" | grep -v "node_modules"`,
    { encoding: 'utf-8' }
  );

  const lines = output.split('\n').filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^(.+):(\d+):(.+)$/);
    if (!match) continue;

    const [, file, lineNum, content] = match;

    // Read the file to check if catch block is empty
    try {
      const fileContent = fs.readFileSync(file, 'utf-8');
      const fileLines = fileContent.split('\n');
      const catchLineNum = parseInt(lineNum) - 1;

      // Simple heuristic: check next few lines for empty block
      const nextLines = fileLines.slice(catchLineNum, catchLineNum + 5).join('\n');

      if (nextLines.includes('} catch') && !nextLines.includes('console') && !nextLines.includes('logger')) {
        // Likely empty or has only comments
        const isTrulyEmpty = /catch\s*\([^)]*\)\s*\{\s*\}/.test(nextLines) ||
                            /catch\s*\([^)]*\)\s*\{\s*\/\//.test(nextLines);

        if (isTrulyEmpty) {
          results.push({
            file: file.replace(process.cwd() + '/', ''),
            lineNumber: parseInt(lineNum),
            context: content.trim()
          });
        }
      }
    } catch (fileError) {
      // Skip files that can't be read
    }
  }
} catch (grepError) {
  console.error('Error running grep:', grepError);
}

// Output results
console.log(`📊 Found ${results.length} empty catch blocks:\n`);

const byDirectory = results.reduce((acc, item) => {
  const dir = item.file.split('/')[0];
  if (!acc[dir]) acc[dir] = [];
  acc[dir].push(item);
  return acc;
}, {} as Record<string, EmptyCatchLocation[]>);

for (const [dir, items] of Object.entries(byDirectory)) {
  console.log(`\n📁 ${dir}/ (${items.length} files)`);
  console.log('─'.repeat(60));
  
  for (const item of items.slice(0, 10)) {
    console.log(`  ${item.file}:${item.lineNumber}`);
    console.log(`    ${item.context.substring(0, 80)}...`);
  }
  
  if (items.length > 10) {
    console.log(`  ... and ${items.length - 10} more`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n✅ Audit complete. Found ${results.length} empty catch blocks.`);
console.log(`\n💡 Fix pattern:`);
console.log(`
  catch (error) {
    logger.error('Operation failed', error, { context });
    // Decide: throw, return default, or continue
  }
`);


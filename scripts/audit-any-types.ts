#!/usr/bin/env ts-node
/**
 * ANY TYPE AUDITOR
 * 
 * Finds all uses of 'any' type in the codebase
 * Helps track progress on type safety improvements
 * 
 * Usage:
 * npx ts-node scripts/audit-any-types.ts
 */

import { execSync } from 'child_process';

const TARGET_DIRS = ['app', 'lib'];

console.log('🔍 Auditing `any` types...\n');

try {
  const output = execSync(
    `grep -rn ": any" ${TARGET_DIRS.join(' ')} --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "Record<string, any>"`,
    { encoding: 'utf-8' }
  );

  const lines = output.split('\n').filter(Boolean);
  
  console.log(`📊 Found ${lines.length} uses of 'any' type:\n`);

  // Group by file
  const byFile = lines.reduce((acc, line) => {
    const match = line.match(/^([^:]+):/);
    if (match) {
      const file = match[1].replace(process.cwd() + '/', '');
      if (!acc[file]) acc[file] = [];
      acc[file].push(line);
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Sort by count descending
  const sorted = Object.entries(byFile).sort((a, b) => b[1].length - a[1].length);

  // Show top 20 files
  console.log('🔴 Top files by `any` count:\n');
  for (const [file, occurrences] of sorted.slice(0, 20)) {
    console.log(`  ${occurrences.length}× ${file}`);
    
    // Show first 3 occurrences
    for (const occ of occurrences.slice(0, 3)) {
      const parts = occ.split(':');
      if (parts.length >= 3) {
        const lineNum = parts[1];
        const content = parts.slice(2).join(':').trim();
        console.log(`    Line ${lineNum}: ${content.substring(0, 70)}...`);
      }
    }
    
    if (occurrences.length > 3) {
      console.log(`    ... and ${occurrences.length - 3} more\n`);
    } else {
      console.log('');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Audit complete. Found ${lines.length} uses of 'any' type.`);
  console.log(`\n💡 Fix pattern:`);
  console.log(`
  // Instead of:
  function process(data: any) { ... }
  
  // Create interface:
  interface DataType {
    field1: string;
    field2: number;
  }
  
  function process(data: DataType) { ... }
`);

} catch (error) {
  if (error instanceof Error && 'status' in error && error.status === 1) {
    console.log('✅ No `any` types found!');
  } else {
    console.error('Error running audit:', error);
  }
}


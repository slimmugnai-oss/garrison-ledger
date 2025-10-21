#!/usr/bin/env ts-node
/**
 * CONSOLE LOG CHECKER
 * 
 * Finds all console.log statements in production code
 * Excludes scripts and development-only usage
 * 
 * Usage:
 * npx ts-node scripts/check-console-logs.ts
 */

import { execSync } from 'child_process';

const TARGET_DIRS = ['app'];
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'scripts', // Scripts can use console.log
  '__tests__' // Tests can use console.log
];

console.log('🔍 Checking for console.log in production code...\n');

try {
  const output = execSync(
    `grep -rn "console\\.(log|warn|error)" ${TARGET_DIRS.join(' ')} --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "scripts/" | grep -v "__tests__" | grep -v "process.env.NODE_ENV === 'development'"`,
    { encoding: 'utf-8' }
  );

  const lines = output.split('\n').filter(Boolean);
  
  console.log(`⚠️  Found ${lines.length} console statements in production code:\n`);

  // Group by type
  const byType: Record<string, string[]> = {
    log: [],
    warn: [],
    error: []
  };

  for (const line of lines) {
    if (line.includes('console.log')) byType.log.push(line);
    else if (line.includes('console.warn')) byType.warn.push(line);
    else if (line.includes('console.error')) byType.error.push(line);
  }

  // Show breakdown
  console.log('📊 Breakdown:');
  console.log(`  console.log:   ${byType.log.length}`);
  console.log(`  console.warn:  ${byType.warn.length}`);
  console.log(`  console.error: ${byType.error.length}`);
  
  console.log('\n🔴 Sample occurrences:\n');
  
  // Show first 10
  for (const line of lines.slice(0, 10)) {
    const match = line.match(/^([^:]+):(\d+):(.+)$/);
    if (match) {
      const [, file, lineNum, content] = match;
      console.log(`  ${file.replace(process.cwd() + '/', '')}:${lineNum}`);
      console.log(`    ${content.trim().substring(0, 80)}...`);
      console.log('');
    }
  }

  if (lines.length > 10) {
    console.log(`  ... and ${lines.length - 10} more\n`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n💡 Fix with logger utility:`);
  console.log(`
  import { logger } from '@/lib/logger';
  
  // Development only
  logger.debug('Debug info', { data });
  
  // Production logs
  logger.warn('Warning message', { context });
  logger.error('Error occurred', error, { context });
`);

  process.exit(1); // Exit with error if console logs found

} catch (error) {
  if (error instanceof Error && 'status' in error && error.status === 1) {
    console.log('✅ No console logs found in production code!');
    process.exit(0);
  } else {
    console.error('Error running audit:', error);
    process.exit(1);
  }
}


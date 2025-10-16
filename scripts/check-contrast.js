#!/usr/bin/env node

/**
 * CONTRAST CHECKER SCRIPT
 * Finds hardcoded Tailwind colors that don't adapt to dark mode
 * 
 * Run: node scripts/check-contrast.js
 * Or: npm run check-contrast
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🎨 Checking for contrast issues in light/dark mode...\n');

// Problematic patterns to find
const problematicPatterns = [
  { pattern: /text-gray-\d00/g, issue: 'text-gray-X', fix: 'text-primary, text-body, or text-muted' },
  { pattern: /text-blue-\d00/g, issue: 'text-blue-X', fix: 'link or text-info' },
  { pattern: /bg-white(?![/-])/g, issue: 'bg-white', fix: 'bg-surface' },
  { pattern: /bg-gray-50/g, issue: 'bg-gray-50', fix: 'bg-page or bg-surface-hover' },
  { pattern: /bg-gray-100/g, issue: 'bg-gray-100', fix: 'bg-surface-hover' },
  { pattern: /border-gray-\d00/g, issue: 'border-gray-X', fix: 'border-default or border-subtle' },
  { pattern: /bg-blue-\d00(?![/-])/g, issue: 'bg-blue-X', fix: 'btn-primary or bg-info' },
  { pattern: /bg-green-\d00/g, issue: 'bg-green-X', fix: 'bg-success or bg-success-subtle' },
  { pattern: /bg-red-\d00/g, issue: 'bg-red-X', fix: 'bg-danger or bg-danger-subtle' },
  { pattern: /bg-yellow-\d00/g, issue: 'bg-yellow-X', fix: 'bg-warning or bg-warning-subtle' },
];

let totalIssues = 0;
const fileIssues = [];

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip these directories
    const skipDirs = ['.next', 'node_modules', '.git', 'out', 'build', 'docs', 'scripts'];
    if (skipDirs.includes(file)) return;
    
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Scan app directory
const appDir = path.join(projectRoot, 'app');
const files = scanDirectory(appDir);

console.log(`📂 Scanning ${files.length} React component files...\n`);

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(projectRoot, file);
  const issues = [];
  
  problematicPatterns.forEach(({ pattern, issue, fix }) => {
    const matches = content.match(pattern);
    if (matches) {
      const count = matches.length;
      issues.push({ issue, fix, count });
      totalIssues += count;
    }
  });
  
  if (issues.length > 0) {
    fileIssues.push({ file: relativePath, issues });
  }
});

// Report findings
if (fileIssues.length === 0) {
  console.log('✅ NO CONTRAST ISSUES FOUND!');
  console.log('   All components use semantic color classes.');
  console.log('   Safe for light and dark mode.\n');
  process.exit(0);
}

console.log(`❌ FOUND ${totalIssues} CONTRAST ISSUES IN ${fileIssues.length} FILES\n`);
console.log('These hardcoded colors may not adapt properly to dark mode:\n');

fileIssues.forEach(({ file, issues }) => {
  console.log(`\n📄 ${file}`);
  issues.forEach(({ issue, fix, count }) => {
    console.log(`   ❌ ${count}x ${issue} → Use: ${fix}`);
  });
});

console.log('\n' + '='.repeat(70));
console.log('\n📖 NEXT STEPS:\n');
console.log('1. Review: docs/COLOR_CONTRAST_GUIDE.md');
console.log('2. Replace hardcoded colors with semantic classes');
console.log('3. Test in both light and dark mode');
console.log('4. Run this script again to verify fixes\n');

console.log('💡 TIP: Focus on high-traffic pages first:');
console.log('   - Homepage (app/page.tsx)');
console.log('   - Dashboard (app/dashboard/page.tsx)');
console.log('   - Tool pages (app/dashboard/tools/*)');
console.log('   - Resource hubs (app/pcs-hub, app/career-hub, etc.)\n');

process.exit(1);


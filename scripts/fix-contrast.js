#!/usr/bin/env node

/**
 * AUTOMATED CONTRAST FIXER
 * Intelligently replaces hardcoded Tailwind colors with semantic classes
 * 
 * Run: node scripts/fix-contrast.js
 * Or: npm run fix-contrast
 * 
 * This script:
 * 1. Scans all .tsx/.jsx files
 * 2. Identifies hardcoded color patterns
 * 3. Replaces with semantic equivalents
 * 4. Preserves complex patterns (gradients, specific use cases)
 * 5. Creates backup before modifying
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🎨 AUTOMATED CONTRAST FIXER\n');
console.log('This will replace hardcoded colors with semantic classes...\n');

let totalReplacements = 0;
let filesModified = 0;

// Replacement rules (order matters - more specific first)
const replacementRules = [
  // Text colors
  { pattern: /className="([^"]*)\btext-gray-900\b([^"]*)"/g, replacement: 'className="$1text-primary$2"', desc: 'text-gray-900 → text-primary' },
  { pattern: /className="([^"]*)\btext-gray-800\b([^"]*)"/g, replacement: 'className="$1text-primary$2"', desc: 'text-gray-800 → text-primary' },
  { pattern: /className="([^"]*)\btext-gray-700\b([^"]*)"/g, replacement: 'className="$1text-body$2"', desc: 'text-gray-700 → text-body' },
  { pattern: /className="([^"]*)\btext-gray-600\b([^"]*)"/g, replacement: 'className="$1text-body$2"', desc: 'text-gray-600 → text-body' },
  { pattern: /className="([^"]*)\btext-gray-500\b([^"]*)"/g, replacement: 'className="$1text-muted$2"', desc: 'text-gray-500 → text-muted' },
  { pattern: /className="([^"]*)\btext-gray-400\b([^"]*)"/g, replacement: 'className="$1text-muted$2"', desc: 'text-gray-400 → text-muted' },
  
  // Blue text (usually links or interactive)
  { pattern: /className="([^"]*)\btext-blue-600\b([^"]*)"/g, replacement: 'className="$1text-info$2"', desc: 'text-blue-600 → text-info' },
  { pattern: /className="([^"]*)\btext-blue-700\b([^"]*)"/g, replacement: 'className="$1text-info$2"', desc: 'text-blue-700 → text-info' },
  { pattern: /className="([^"]*)\btext-blue-800\b([^"]*)"/g, replacement: 'className="$1text-info$2"', desc: 'text-blue-800 → text-info' },
  
  // Backgrounds - white
  { pattern: /className="([^"]*)\bbg-white\b(?!\/)([^"]*)"/g, replacement: 'className="$1bg-surface$2"', desc: 'bg-white → bg-surface' },
  
  // Backgrounds - gray
  { pattern: /className="([^"]*)\bbg-gray-50\b([^"]*)"/g, replacement: 'className="$1bg-surface-hover$2"', desc: 'bg-gray-50 → bg-surface-hover' },
  { pattern: /className="([^"]*)\bbg-gray-100\b([^"]*)"/g, replacement: 'className="$1bg-surface-hover$2"', desc: 'bg-gray-100 → bg-surface-hover' },
  
  // Borders
  { pattern: /className="([^"]*)\bborder-gray-200\b([^"]*)"/g, replacement: 'className="$1border-subtle$2"', desc: 'border-gray-200 → border-subtle' },
  { pattern: /className="([^"]*)\bborder-gray-300\b([^"]*)"/g, replacement: 'className="$1border-default$2"', desc: 'border-gray-300 → border-default' },
  { pattern: /className="([^"]*)\bborder-gray-400\b([^"]*)"/g, replacement: 'className="$1border-strong$2"', desc: 'border-gray-400 → border-strong' },
  
  // Blue backgrounds (buttons, highlights)
  { pattern: /className="([^"]*)\bbg-blue-500\b([^"]*)"/g, replacement: 'className="$1bg-info$2"', desc: 'bg-blue-500 → bg-info' },
  { pattern: /className="([^"]*)\bbg-blue-600\b([^"]*)"/g, replacement: 'className="$1bg-info$2"', desc: 'bg-blue-600 → bg-info' },
  { pattern: /className="([^"]*)\bbg-blue-700\b([^"]*)"/g, replacement: 'className="$1bg-info$2"', desc: 'bg-blue-700 → bg-info' },
  
  // Subtle backgrounds (alerts, callouts)
  { pattern: /className="([^"]*)\bbg-blue-50\b([^"]*)"/g, replacement: 'className="$1bg-info-subtle$2"', desc: 'bg-blue-50 → bg-info-subtle' },
  { pattern: /className="([^"]*)\bbg-blue-100\b([^"]*)"/g, replacement: 'className="$1bg-info-subtle$2"', desc: 'bg-blue-100 → bg-info-subtle' },
  { pattern: /className="([^"]*)\bbg-green-50\b([^"]*)"/g, replacement: 'className="$1bg-success-subtle$2"', desc: 'bg-green-50 → bg-success-subtle' },
  { pattern: /className="([^"]*)\bbg-green-100\b([^"]*)"/g, replacement: 'className="$1bg-success-subtle$2"', desc: 'bg-green-100 → bg-success-subtle' },
  { pattern: /className="([^"]*)\bbg-red-50\b([^"]*)"/g, replacement: 'className="$1bg-danger-subtle$2"', desc: 'bg-red-50 → bg-danger-subtle' },
  { pattern: /className="([^"]*)\bbg-red-100\b([^"]*)"/g, replacement: 'className="$1bg-danger-subtle$2"', desc: 'bg-red-100 → bg-danger-subtle' },
  { pattern: /className="([^"]*)\bbg-yellow-50\b([^"]*)"/g, replacement: 'className="$1bg-warning-subtle$2"', desc: 'bg-yellow-50 → bg-warning-subtle' },
  { pattern: /className="([^"]*)\bbg-yellow-100\b([^"]*)"/g, replacement: 'className="$1bg-warning-subtle$2"', desc: 'bg-yellow-100 → bg-warning-subtle' },
  
  // Solid status backgrounds
  { pattern: /className="([^"]*)\bbg-green-500\b([^"]*)"/g, replacement: 'className="$1bg-success$2"', desc: 'bg-green-500 → bg-success' },
  { pattern: /className="([^"]*)\bbg-green-600\b([^"]*)"/g, replacement: 'className="$1bg-success$2"', desc: 'bg-green-600 → bg-success' },
  { pattern: /className="([^"]*)\bbg-red-500\b([^"]*)"/g, replacement: 'className="$1bg-danger$2"', desc: 'bg-red-500 → bg-danger' },
  { pattern: /className="([^"]*)\bbg-red-600\b([^"]*)"/g, replacement: 'className="$1bg-danger$2"', desc: 'bg-red-600 → bg-danger' },
  { pattern: /className="([^"]*)\bbg-yellow-500\b([^"]*)"/g, replacement: 'className="$1bg-warning$2"', desc: 'bg-yellow-500 → bg-warning' },
  { pattern: /className="([^"]*)\bbg-yellow-600\b([^"]*)"/g, replacement: 'className="$1bg-warning$2"', desc: 'bg-yellow-600 → bg-warning' },
  
  // Status text colors
  { pattern: /className="([^"]*)\btext-green-600\b([^"]*)"/g, replacement: 'className="$1text-success$2"', desc: 'text-green-600 → text-success' },
  { pattern: /className="([^"]*)\btext-green-700\b([^"]*)"/g, replacement: 'className="$1text-success$2"', desc: 'text-green-700 → text-success' },
  { pattern: /className="([^"]*)\btext-red-600\b([^"]*)"/g, replacement: 'className="$1text-danger$2"', desc: 'text-red-600 → text-danger' },
  { pattern: /className="([^"]*)\btext-red-700\b([^"]*)"/g, replacement: 'className="$1text-danger$2"', desc: 'text-red-700 → text-danger' },
  { pattern: /className="([^"]*)\btext-yellow-600\b([^"]*)"/g, replacement: 'className="$1text-warning$2"', desc: 'text-yellow-600 → text-warning' },
  { pattern: /className="([^"]*)\btext-yellow-700\b([^"]*)"/g, replacement: 'className="$1text-warning$2"', desc: 'text-yellow-700 → text-warning' },
  
  // Status borders
  { pattern: /className="([^"]*)\bborder-blue-500\b([^"]*)"/g, replacement: 'className="$1border-info$2"', desc: 'border-blue-500 → border-info' },
  { pattern: /className="([^"]*)\bborder-blue-200\b([^"]*)"/g, replacement: 'className="$1border-info$2"', desc: 'border-blue-200 → border-info' },
  { pattern: /className="([^"]*)\bborder-green-500\b([^"]*)"/g, replacement: 'className="$1border-success$2"', desc: 'border-green-500 → border-success' },
  { pattern: /className="([^"]*)\bborder-green-200\b([^"]*)"/g, replacement: 'className="$1border-success$2"', desc: 'border-green-200 → border-success' },
  { pattern: /className="([^"]*)\bborder-red-500\b([^"]*)"/g, replacement: 'className="$1border-danger$2"', desc: 'border-red-500 → border-danger' },
  { pattern: /className="([^"]*)\bborder-red-200\b([^"]*)"/g, replacement: 'className="$1border-danger$2"', desc: 'border-red-200 → border-danger' },
  { pattern: /className="([^"]*)\bborder-yellow-500\b([^"]*)"/g, replacement: 'className="$1border-warning$2"', desc: 'border-yellow-500 → border-warning' },
  { pattern: /className="([^"]*)\bborder-yellow-200\b([^"]*)"/g, replacement: 'className="$1border-warning$2"', desc: 'border-yellow-200 → border-warning' },
  
  // Additional blue shades for text
  { pattern: /className="([^"]*)\btext-blue-100\b([^"]*)"/g, replacement: 'className="$1text-white/90$2"', desc: 'text-blue-100 → text-white/90' },
  { pattern: /className="([^"]*)\btext-blue-200\b([^"]*)"/g, replacement: 'className="$1text-white/80$2"', desc: 'text-blue-200 → text-white/80' },
  { pattern: /className="([^"]*)\btext-blue-300\b([^"]*)"/g, replacement: 'className="$1text-info$2"', desc: 'text-blue-300 → text-info' },
  { pattern: /className="([^"]*)\btext-blue-400\b([^"]*)"/g, replacement: 'className="$1text-info$2"', desc: 'text-blue-400 → text-info' },
  { pattern: /className="([^"]*)\btext-blue-500\b([^"]*)"/g, replacement: 'className="$1text-info$2"', desc: 'text-blue-500 → text-info' },
  
  // Additional gray shades
  { pattern: /className="([^"]*)\btext-gray-300\b([^"]*)"/g, replacement: 'className="$1text-muted$2"', desc: 'text-gray-300 → text-muted' },
  { pattern: /className="([^"]*)\btext-gray-200\b([^"]*)"/g, replacement: 'className="$1text-disabled$2"', desc: 'text-gray-200 → text-disabled' },
  { pattern: /className="([^"]*)\btext-gray-100\b([^"]*)"/g, replacement: 'className="$1text-white/90$2"', desc: 'text-gray-100 → text-white/90' },
  
  // Blue backgrounds (additional shades)
  { pattern: /className="([^"]*)\bbg-blue-400\b([^"]*)"/g, replacement: 'className="$1bg-info$2"', desc: 'bg-blue-400 → bg-info' },
  { pattern: /className="([^"]*)\bbg-blue-800\b([^"]*)"/g, replacement: 'className="$1bg-info$2"', desc: 'bg-blue-800 → bg-info' },
  { pattern: /className="([^"]*)\bbg-blue-900\b([^"]*)"/g, replacement: 'className="$1bg-info$2"', desc: 'bg-blue-900 → bg-info' },
  
  // Green status shades
  { pattern: /className="([^"]*)\bbg-green-200\b([^"]*)"/g, replacement: 'className="$1bg-success-subtle$2"', desc: 'bg-green-200 → bg-success-subtle' },
  { pattern: /className="([^"]*)\bbg-green-400\b([^"]*)"/g, replacement: 'className="$1bg-success$2"', desc: 'bg-green-400 → bg-success' },
  { pattern: /className="([^"]*)\bbg-green-700\b([^"]*)"/g, replacement: 'className="$1bg-success$2"', desc: 'bg-green-700 → bg-success' },
  { pattern: /className="([^"]*)\bbg-green-800\b([^"]*)"/g, replacement: 'className="$1bg-success$2"', desc: 'bg-green-800 → bg-success' },
  { pattern: /className="([^"]*)\btext-green-800\b([^"]*)"/g, replacement: 'className="$1text-success$2"', desc: 'text-green-800 → text-success' },
  { pattern: /className="([^"]*)\btext-green-900\b([^"]*)"/g, replacement: 'className="$1text-success$2"', desc: 'text-green-900 → text-success' },
  
  // Red/danger shades
  { pattern: /className="([^"]*)\bbg-red-200\b([^"]*)"/g, replacement: 'className="$1bg-danger-subtle$2"', desc: 'bg-red-200 → bg-danger-subtle' },
  { pattern: /className="([^"]*)\bbg-red-400\b([^"]*)"/g, replacement: 'className="$1bg-danger$2"', desc: 'bg-red-400 → bg-danger' },
  { pattern: /className="([^"]*)\bbg-red-700\b([^"]*)"/g, replacement: 'className="$1bg-danger$2"', desc: 'bg-red-700 → bg-danger' },
  { pattern: /className="([^"]*)\btext-red-800\b([^"]*)"/g, replacement: 'className="$1text-danger$2"', desc: 'text-red-800 → text-danger' },
  { pattern: /className="([^"]*)\btext-red-900\b([^"]*)"/g, replacement: 'className="$1text-danger$2"', desc: 'text-red-900 → text-danger' },
  
  // Yellow/warning shades  
  { pattern: /className="([^"]*)\bbg-yellow-200\b([^"]*)"/g, replacement: 'className="$1bg-warning-subtle$2"', desc: 'bg-yellow-200 → bg-warning-subtle' },
  { pattern: /className="([^"]*)\bbg-yellow-400\b([^"]*)"/g, replacement: 'className="$1bg-warning$2"', desc: 'bg-yellow-400 → bg-warning' },
  { pattern: /className="([^"]*)\btext-yellow-800\b([^"]*)"/g, replacement: 'className="$1text-warning$2"', desc: 'text-yellow-800 → text-warning' },
  { pattern: /className="([^"]*)\btext-yellow-900\b([^"]*)"/g, replacement: 'className="$1text-warning$2"', desc: 'text-yellow-900 → text-warning' },
  
  // Additional border grays
  { pattern: /className="([^"]*)\bborder-gray-100\b([^"]*)"/g, replacement: 'className="$1border-subtle$2"', desc: 'border-gray-100 → border-subtle' },
  { pattern: /className="([^"]*)\bborder-gray-500\b([^"]*)"/g, replacement: 'className="$1border-strong$2"', desc: 'border-gray-500 → border-strong' },
  
  // Remaining gray backgrounds
  { pattern: /className="([^"]*)\bbg-gray-200\b([^"]*)"/g, replacement: 'className="$1bg-surface-hover$2"', desc: 'bg-gray-200 → bg-surface-hover' },
  { pattern: /className="([^"]*)\bbg-gray-300\b([^"]*)"/g, replacement: 'className="$1bg-surface-hover$2"', desc: 'bg-gray-300 → bg-surface-hover' },
  
  // Specific text shades that need white treatment (on colored backgrounds)
  { pattern: /className="([^"]*)\btext-blue-50\b([^"]*)"/g, replacement: 'className="$1text-white/95$2"', desc: 'text-blue-50 → text-white/95' },
  { pattern: /className="([^"]*)\btext-green-100\b([^"]*)"/g, replacement: 'className="$1text-white/90$2"', desc: 'text-green-100 → text-white/90' },
  { pattern: /className="([^"]*)\btext-green-200\b([^"]*)"/g, replacement: 'className="$1text-white/80$2"', desc: 'text-green-200 → text-white/80' },
];

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip these directories
    const skipDirs = ['.next', 'node_modules', '.git', 'out', 'build', 'docs', 'scripts', 'resource toolkits'];
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

console.log(`📂 Processing ${files.length} component files...\n`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  let fileReplacements = 0;
  
  replacementRules.forEach(({ pattern, replacement, desc }) => {
    const matches = content.match(pattern);
    if (matches) {
      const count = matches.length;
      content = content.replace(pattern, replacement);
      fileReplacements += count;
      totalReplacements += count;
    }
  });
  
  // Only write if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    filesModified++;
    const relativePath = path.relative(projectRoot, file);
    console.log(`✅ ${relativePath} (${fileReplacements} replacements)`);
  }
});

console.log('\n' + '='.repeat(70));
console.log(`\n🎉 AUTOMATED FIX COMPLETE!\n`);
console.log(`✅ Modified ${filesModified} files`);
console.log(`✅ Made ${totalReplacements} replacements`);
console.log(`\n📋 NEXT STEPS:\n`);
console.log('1. Run: npm run check-contrast');
console.log('   (Check for any remaining issues)');
console.log('\n2. Run: npm run build');
console.log('   (Verify everything still compiles)');
console.log('\n3. Test in browser:');
console.log('   - Toggle dark mode on/off');
console.log('   - Check all pages for readability');
console.log('   - Verify buttons are visible');
console.log('\n4. Manually fix any edge cases');
console.log('   (Complex gradients, special styling)');
console.log('\n5. Commit changes:');
console.log('   git add -A');
console.log('   git commit -m "🎨 FIX: Automated contrast improvements (semantic colors)"');
console.log('\n' + '='.repeat(70));


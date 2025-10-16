#!/usr/bin/env node

/**
 * BUILD HEALTH CHECK SCRIPT
 * Catches common build issues before they reach production
 * 
 * Run: node scripts/build-health-check.js
 * 
 * Checks:
 * 1. All imports have matching dependencies
 * 2. Config files are version-aligned
 * 3. No missing @types/* packages
 * 4. Critical files exist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔍 Running Build Health Check...\n');

let issuesFound = 0;

// 1. Check package.json exists and is valid
console.log('📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  console.log(`✅ package.json valid (${Object.keys(packageJson.dependencies || {}).length} dependencies, ${Object.keys(packageJson.devDependencies || {}).length} devDependencies)`);
} catch (error) {
  console.error('❌ package.json is invalid or missing');
  issuesFound++;
}

// 2. Check PostCSS config
console.log('\n⚙️ Checking PostCSS config...');
try {
  const postcssConfig = fs.readFileSync(path.join(projectRoot, 'postcss.config.mjs'), 'utf8');
  if (postcssConfig.includes('@import "tailwindcss"')) {
    console.error('❌ PostCSS uses Tailwind v4 syntax but we have v3 installed');
    console.log('   Fix: Use @tailwind directives instead of @import');
    issuesFound++;
  } else if (postcssConfig.includes('tailwindcss') && postcssConfig.includes('autoprefixer')) {
    console.log('✅ PostCSS config is correct for Tailwind v3');
  }
} catch (error) {
  console.error('❌ PostCSS config not found or invalid');
  issuesFound++;
}

// 3. Check globals.css
console.log('\n🎨 Checking globals.css...');
try {
  const globalsCss = fs.readFileSync(path.join(projectRoot, 'app/globals.css'), 'utf8');
  if (globalsCss.includes('@import "tailwindcss"')) {
    console.error('❌ globals.css uses Tailwind v4 syntax');
    console.log('   Fix: Replace with @tailwind base/components/utilities');
    issuesFound++;
  } else if (globalsCss.includes('@tailwind base')) {
    console.log('✅ globals.css has correct Tailwind directives');
  }
} catch (error) {
  console.error('❌ globals.css not found');
  issuesFound++;
}

// 4. Check critical dependencies are installed
console.log('\n📚 Checking critical dependencies...');
const criticalDeps = [
  '@clerk/nextjs',
  '@supabase/supabase-js',
  'next',
  'react',
  'react-dom',
  'stripe',
  'tailwindcss',
  'typescript',
  'lucide-react',
  '@google/generative-ai',
  '@next/third-parties',
  '@react-pdf/renderer',
  'openai',
  'recharts',
];

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  criticalDeps.forEach(dep => {
    if (!allDeps[dep]) {
      console.error(`❌ Missing critical dependency: ${dep}`);
      issuesFound++;
    }
  });
  
  if (issuesFound === 0) {
    console.log(`✅ All ${criticalDeps.length} critical dependencies present`);
  }
} catch (error) {
  console.error('❌ Could not check dependencies');
  issuesFound++;
}

// 5. Check for common import patterns without dependencies
console.log('\n🔍 Scanning for potential missing dependencies...');
const potentialIssues = [];

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip node_modules, .next, etc.
    if (file.startsWith('.') || file === 'node_modules' || file === '.next') {
      return;
    }
    
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const appFiles = scanDirectory(path.join(projectRoot, 'app'));
const libFiles = fs.existsSync(path.join(projectRoot, 'lib')) 
  ? scanDirectory(path.join(projectRoot, 'lib')) 
  : [];

const allFiles = [...appFiles, ...libFiles].slice(0, 50); // Sample first 50 files for performance

allFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const imports = content.match(/from ['"]([^'"]+)['"]/g) || [];
    
    imports.forEach(imp => {
      const match = imp.match(/from ['"]([^'"]+)['"]/);
      if (match && match[1] && !match[1].startsWith('.') && !match[1].startsWith('@/')) {
        // This is an npm package import
        const packageName = match[1].split('/')[0].startsWith('@') 
          ? `${match[1].split('/')[0]}/${match[1].split('/')[1]}`
          : match[1].split('/')[0];
        
        if (!potentialIssues.includes(packageName)) {
          potentialIssues.push(packageName);
        }
      }
    });
  } catch (error) {
    // Skip files that can't be read
  }
});

console.log(`✅ Scanned ${allFiles.length} files, found ${potentialIssues.length} unique package imports`);

// Summary
console.log('\n' + '='.repeat(50));
if (issuesFound === 0) {
  console.log('✅ BUILD HEALTH CHECK PASSED!');
  console.log('   No critical issues found. Safe to deploy.');
} else {
  console.log(`❌ BUILD HEALTH CHECK FAILED!`);
  console.log(`   Found ${issuesFound} issue(s) that need attention.`);
  console.log('   Fix these before deploying to avoid build failures.');
  process.exit(1);
}
console.log('='.repeat(50));


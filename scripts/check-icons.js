#!/usr/bin/env node

/**
 * Icon Validation Script
 * 
 * This script checks for non-existent icons before deployment
 * Run with: node scripts/check-icons.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icons that don't exist in lucide-react
const INVALID_ICONS = [
  'Ship',
  'Anchor', 
  'FileText',
  'FileCheck',
  'Clock'
];

// Safe replacements
const ICON_REPLACEMENTS = {
  'Ship': 'Shield',
  'Anchor': 'Shield',
  'FileText': 'File',
  'FileCheck': 'CheckCircle',
  'Clock': 'Timer'
};

function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

function checkIcons() {
  console.log('🔍 Checking for invalid icons...\n');
  
  const appDir = path.join(__dirname, '..', 'app');
  const files = findFiles(appDir);
  
  let hasErrors = false;
  const errors = [];
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      INVALID_ICONS.forEach(icon => {
        const regex = new RegExp(`name=["']${icon}["']`, 'g');
        const matches = content.match(regex);
        
        if (matches) {
          hasErrors = true;
          const lines = content.split('\n');
          const errorLines = [];
          
          lines.forEach((line, index) => {
            if (line.includes(`name="${icon}"`) || line.includes(`name='${icon}'`)) {
              errorLines.push({
                line: index + 1,
                content: line.trim()
              });
            }
          });
          
          errors.push({
            file,
            icon,
            lines: errorLines,
            suggestion: ICON_REPLACEMENTS[icon]
          });
        }
      });
    } catch (err) {
      console.warn(`⚠️  Could not read file: ${file}`);
    }
  });
  
  if (hasErrors) {
    console.log('❌ Found invalid icons!\n');
    
    errors.forEach(error => {
      console.log(`📁 ${error.file}`);
      console.log(`   Icon: "${error.icon}" → Use "${error.suggestion}"`);
      console.log(`   Lines:`);
      
      error.lines.forEach(line => {
        console.log(`     ${line.line}: ${line.content}`);
      });
      
      console.log('');
    });
    
    console.log('🔧 Quick fixes:');
    errors.forEach(error => {
      console.log(`   Replace "${error.icon}" with "${error.suggestion}" in ${error.file}`);
    });
    
    console.log('\n💡 Run this command to auto-fix:');
    errors.forEach(error => {
      const icon = error.icon;
      const replacement = error.suggestion;
      console.log(`   find app/ -name "*.tsx" -exec sed -i 's/name="${icon}"/name="${replacement}"/g' {} \\;`);
    });
    
    process.exit(1);
  } else {
    console.log('✅ All icons are valid!');
    console.log('🚀 Safe to deploy!');
  }
}

// Run the check
checkIcons();

#!/usr/bin/env node

/**
 * Fix form labels accessibility issues
 * Adds htmlFor attributes to labels and id attributes to inputs
 */

const fs = require('fs');
const path = require('path');

// Files to fix (based on ESLint output)
const filesToFix = [
  'app/components/pcs/ManualEntryForm.tsx',
  'app/components/pcs/PCSDocumentUploader.tsx',
  'app/components/pcs/PCSManualEntry.tsx',
  'app/components/pcs/PCSMobileWizard.tsx',
  'app/components/pcs/PCSCopilotClient.tsx',
  'app/components/pcs/PCSClaimClient.tsx',
  'app/components/pcs/PCSCostComparisonClient.tsx',
  'app/dashboard/navigator/[base]/BaseNavigatorClient.tsx',
  'app/dashboard/admin/rag-analytics/RAGAnalyticsClient.tsx',
  'app/dashboard/profile/quick-start/page.tsx',
  'app/dashboard/settings/page.tsx',
  'app/dashboard/tdy-voucher/TdyVoucherClient.tsx'
];

function fixFormLabels(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: Fix labels without htmlFor
  const labelPattern = /<label\s+className="([^"]*)"\s*>\s*([^<]+)\s*<\/label>\s*<input/g;
  content = content.replace(labelPattern, (match, className, labelText) => {
    // Extract field name from label text or generate from context
    const fieldName = labelText.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/\*$/, '')
      .trim();
    
    modified = true;
    return `<label htmlFor="${fieldName}" className="${className}">${labelText}</label>\n                <input`;
  });

  // Pattern 2: Add id to inputs that don't have one
  const inputPattern = /<input\s+(?![^>]*\bid=)([^>]*?)>/g;
  content = content.replace(inputPattern, (match, attributes) => {
    // Try to extract name or other identifier
    const nameMatch = attributes.match(/name="([^"]*)"/);
    const valueMatch = attributes.match(/value=\{.*?formData\.([^}]+)/);
    
    let id = '';
    if (nameMatch) {
      id = nameMatch[1];
    } else if (valueMatch) {
      id = valueMatch[1];
    } else {
      // Generate a generic id
      id = 'input_' + Math.random().toString(36).substr(2, 9);
    }
    
    modified = true;
    return `<input id="${id}" ${attributes}>`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed form labels in: ${filePath}`);
  } else {
    console.log(`No changes needed in: ${filePath}`);
  }
}

// Fix all files
filesToFix.forEach(filePath => {
  fixFormLabels(filePath);
});

console.log('Form label fixes completed!');

#!/usr/bin/env node

/**
 * Comprehensive form label accessibility fix
 * Adds htmlFor attributes to labels and id attributes to inputs
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '.next/**', 'coverage/**', 'scripts/**']
});

function fixFormLabels(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: Fix labels without htmlFor that are followed by inputs
  const labelInputPattern = /<label\s+className="([^"]*)"\s*>\s*([^<]+?)\s*<\/label>\s*<input/g;
  content = content.replace(labelInputPattern, (match, className, labelText) => {
    // Extract field name from label text
    const fieldName = labelText.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/\*$/, '')
      .trim();
    
    modified = true;
    return `<label htmlFor="${fieldName}" className="${className}">${labelText}</label>\n                <input`;
  });

  // Pattern 2: Add id to inputs that don't have one but have a name or value prop
  const inputPattern = /<input\s+(?![^>]*\bid=)([^>]*?)>/g;
  content = content.replace(inputPattern, (match, attributes) => {
    // Skip if already has id
    if (attributes.includes('id=')) {
      return match;
    }
    
    // Try to extract name or other identifier
    const nameMatch = attributes.match(/name="([^"]*)"/);
    const valueMatch = attributes.match(/value=\{.*?formData\.([^}]+)/);
    const onChangeMatch = attributes.match(/onChange=\{.*?formData\.([^}]+)/);
    
    let id = '';
    if (nameMatch) {
      id = nameMatch[1];
    } else if (valueMatch) {
      id = valueMatch[1];
    } else if (onChangeMatch) {
      id = onChangeMatch[1];
    } else {
      // Skip if we can't determine a good id
      return match;
    }
    
    modified = true;
    return `<input id="${id}" ${attributes}>`;
  });

  // Pattern 3: Fix specific common patterns
  const commonPatterns = [
    // Claim name pattern
    {
      search: /<label\s+className="([^"]*)"\s*>\s*Claim Name\s*<\/label>\s*<input/g,
      replace: '<label htmlFor="claim_name" className="$1">Claim Name</label>\n                <input id="claim_name"'
    },
    // PCS orders date pattern
    {
      search: /<label\s+className="([^"]*)"\s*>\s*PCS Orders Date\s*<\/label>\s*<input/g,
      replace: '<label htmlFor="pcs_orders_date" className="$1">PCS Orders Date</label>\n                <input id="pcs_orders_date"'
    },
    // Departure date pattern
    {
      search: /<label\s+className="([^"]*)"\s*>\s*Departure Date\s*<\/label>\s*<input/g,
      replace: '<label htmlFor="departure_date" className="$1">Departure Date</label>\n                <input id="departure_date"'
    },
    // Arrival date pattern
    {
      search: /<label\s+className="([^"]*)"\s*>\s*Arrival Date\s*<\/label>\s*<input/g,
      replace: '<label htmlFor="arrival_date" className="$1">Arrival Date</label>\n                <input id="arrival_date"'
    },
    // Origin base pattern
    {
      search: /<label\s+className="([^"]*)"\s*>\s*Origin Base\s*<\/label>\s*<input/g,
      replace: '<label htmlFor="origin_base" className="$1">Origin Base</label>\n                <input id="origin_base"'
    },
    // Destination base pattern
    {
      search: /<label\s+className="([^"]*)"\s*>\s*Destination Base\s*<\/label>\s*<input/g,
      replace: '<label htmlFor="destination_base" className="$1">Destination Base</label>\n                <input id="destination_base"'
    },
    // Rank pattern
    {
      search: /<label\s+className="([^"]*)"\s*>\s*Rank\s*<\/label>\s*<input/g,
      replace: '<label htmlFor="rank" className="$1">Rank</label>\n                <input id="rank"'
    },
    // Branch pattern
    {
      search: /<label\s+className="([^"]*)"\s*>\s*Branch\s*<\/label>\s*<input/g,
      replace: '<label htmlFor="branch" className="$1">Branch</label>\n                <input id="branch"'
    }
  ];

  commonPatterns.forEach(pattern => {
    if (pattern.search.test(content)) {
      content = content.replace(pattern.search, pattern.replace);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed form labels in: ${filePath}`);
  }
}

// Fix all files
let fixedCount = 0;
files.forEach(filePath => {
  try {
    fixFormLabels(filePath);
    fixedCount++;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
});

console.log(`Form label fixes completed! Fixed ${fixedCount} files.`);

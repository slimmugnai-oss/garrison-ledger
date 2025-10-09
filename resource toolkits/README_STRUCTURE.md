# Shopping.html Structure Management

This directory contains tools and documentation to help maintain the structural integrity of `Shopping.html` through future changes.

## 📁 Files Overview

### Core Files
- **`Shopping.html`** - The main shopping guide file
- **`STRUCTURE_DOCUMENTATION.md`** - Complete structural documentation
- **`STRUCTURAL_WORKFLOW.md`** - Step-by-step workflow for safe changes

### Validation Tools
- **`structure_checklist.html`** - Interactive browser-based validation checklist
- **`validate_structure.js`** - Node.js validation script (requires Node.js)
- **`backup_structure.js`** - Node.js backup/restore script (requires Node.js)

### Configuration
- **`package.json`** - NPM scripts for easy tool usage (requires Node.js)

## 🚀 Quick Start

### For Immediate Use (No Node.js Required)
1. **Before making changes**: Open `structure_checklist.html` in your browser
2. **Work through the checklist** to validate current structure
3. **Make your changes** following the workflow guidelines
4. **Re-validate** using the checklist after changes

### For Advanced Users (With Node.js)
```bash
# Install dependencies (if needed)
npm install

# Create backup before changes
npm run backup "description of changes"

# Validate structure
npm run validate

# List available backups
npm run backup:list

# Restore from backup (if needed)
npm run backup:restore 1
```

## 🛡️ Key Principles

### Always Maintain
1. **Section Order**: Commissary → Exchange → Savings Hub → Pro-Tips → PCS Toolkit → OCONUS Guide → FAQ
2. **Navigation Consistency**: Nav links must match section IDs and order
3. **Interactive Elements**: Calculators, charts, and downloads must remain functional
4. **Sponsor Slot Positioning**: Maintain proper spacing and placement

### Critical Elements
- **Section IDs**: `commissary`, `exchange`, `savings`, `tips`, `base-hub`, `oconus`, `faq`
- **Interactive Elements**: `mwrChart`, `download-shopping-list`, calculator result elements
- **JavaScript Dependencies**: Chart.js, jsPDF, event listeners

## 📋 Common Tasks

### Moving Sections
1. Update navigation order in the nav menu
2. Ensure section IDs remain unchanged
3. Test all interactive elements
4. Validate with checklist

### Adding New Sections
1. Add to navigation menu
2. Update documentation
3. Test functionality
4. Update validation tools if needed

### Modifying Interactive Elements
1. Check JavaScript dependencies
2. Test calculator functionality
3. Verify chart rendering
4. Test PDF generation

## 🆘 Emergency Recovery

If the structure becomes broken:
1. **Locate backup files** (manually created or via backup script)
2. **Restore from backup** by copying backup over current file
3. **Test restored version** to ensure it works
4. **Make incremental changes** and validate each step

## 📚 Documentation

- **`STRUCTURE_DOCUMENTATION.md`** - Complete technical documentation
- **`STRUCTURAL_WORKFLOW.md`** - Detailed workflow and best practices
- **`structure_checklist.html`** - Interactive validation checklist

## 🔧 Troubleshooting

### Common Issues
- **Navigation links broken**: Check section IDs match nav links
- **Calculators not working**: Verify JavaScript elements are present
- **Charts not rendering**: Check Chart.js loading and canvas element
- **PDF download failing**: Verify jsPDF loading and button element

### Validation Failures
1. Check error messages in validation output
2. Compare with documentation
3. Restore from backup if needed
4. Make smaller, incremental changes

## 📞 Support

For questions about structure management:
1. Check the documentation files first
2. Use the interactive checklist for validation
3. Follow the workflow guidelines
4. Create backups before major changes

---

**Remember**: Always backup before making changes and validate after changes to maintain structural integrity!

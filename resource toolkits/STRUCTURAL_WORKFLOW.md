# Structural Integrity Workflow

## Before Making Changes

### 1. Create a Backup
- Manually copy Shopping.html to a backup file with timestamp
- Example: `Shopping_backup_2024-01-15_before_changes.html`

### 2. Validate Current Structure
- Open `structure_checklist.html` in your browser
- Work through the pre-change validation checklist
- Ensure all current structure elements are present and working

## During Changes

### Key Principles
1. **Maintain Section Order**: Keep sections in the documented order
2. **Preserve IDs**: Never change section IDs without updating navigation
3. **Update Navigation**: If moving sections, update the navigation menu order
4. **Test Interactivity**: Ensure calculators, charts, and downloads still work
5. **Check Sponsor Slots**: Maintain proper spacing around sponsor content

### Common Change Patterns

#### Moving Sections
1. Update navigation order in the nav menu
2. Ensure section IDs remain the same
3. Check that JavaScript selectors still work
4. Verify sponsor slot positioning

#### Adding New Sections
1. Add to navigation menu
2. Update STRUCTURE_DOCUMENTATION.md
3. Add to validation script if needed
4. Test all interactive elements

#### Modifying Interactive Elements
1. Check that JavaScript event listeners still work
2. Verify calculator functionality
3. Test PDF generation
4. Ensure chart rendering works

## After Making Changes

### 1. Validate Structure
- Open `structure_checklist.html` in your browser
- Work through the post-change validation checklist
- Check off each item as you verify it

### 2. Test Functionality
- [ ] Navigation links work correctly
- [ ] Calculators function properly
- [ ] PDF download works
- [ ] Chart renders correctly
- [ ] All interactive elements respond

### 3. Update Documentation
- Update STRUCTURE_DOCUMENTATION.md if structure changed
- Update validation script if new elements added

## Emergency Recovery

### If Structure is Broken
1. Locate your most recent backup file
2. Copy the backup file over the current Shopping.html
3. Test that the restored version works correctly

### If Validation Fails
1. Check the error messages carefully
2. Compare with STRUCTURE_DOCUMENTATION.md
3. Restore from backup if needed
4. Make incremental changes and re-validate

## Best Practices

### Do's
- ✅ Always backup before major changes
- ✅ Validate structure after changes
- ✅ Keep documentation updated
- ✅ Test interactive elements
- ✅ Maintain consistent spacing and styling

### Don'ts
- ❌ Change section IDs without updating navigation
- ❌ Move sections without updating nav order
- ❌ Remove interactive elements without checking JavaScript
- ❌ Ignore validation errors
- ❌ Make multiple structural changes without testing

## Quick Reference

### Current Section Order
1. Commissary
2. Exchange
3. Savings Hub
4. Pro-Tips
5. PCS Toolkit
6. OCONUS Guide
7. FAQ

### Critical Elements
- `mwrChart` - Chart.js canvas
- `download-shopping-list` - PDF download button
- `commissarySavingsResult` - Calculator result display
- `exchangeSavingsResult` - Calculator result display

### Sponsor Slot Positions
- Slot 1: After header (Family Media)
- Slot 2: After Savings Hub (Navy Federal)
- Slot 3: After FAQ (USAA)

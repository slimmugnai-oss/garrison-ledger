# Shopping.html Structure Documentation

## Current Document Structure

### 1. Document Head (Lines 1-189)
- DOCTYPE and HTML declaration
- Meta tags (SEO, Open Graph, Twitter Cards)
- JSON-LD structured data (WebPage, FAQPage)
- External dependencies (Tailwind CSS, jsPDF, Google Fonts)
- Custom CSS styles

### 2. Main Content Structure

#### Header Section (Lines 196-218)
- Hero header with gradient background
- Title: "On Base Shopping Guide"
- Subtitle and description

#### Sponsor Slot 1 (Lines 220-227)
- Family Media "Presented By" banner
- Logo and description

#### Navigation (Lines 229-242)
- Sticky navigation bar
- Section jump links in specific order:
  1. Commissary
  2. Exchange  
  3. Savings Hub
  4. Pro-Tips
  5. PCS Toolkit
  6. OCONUS Guide
  7. FAQ

#### Main Content Sections (in order):

1. **Commissary Section** (Lines 247-307)
   - ID: `commissary`
   - Content: How commissary works, 5% surcharge explanation
   - Interactive elements: Info cards for Family Magazine, Case Lot sales

2. **Exchange Section** (Lines 308-364)
   - ID: `exchange`
   - Content: Exchange benefits, MILITARY STAR Card, price matching
   - Interactive elements: Chart.js doughnut chart for MWR funding

3. **Savings Hub Section** (Lines 365-447)
   - ID: `savings`
   - Content: Interactive calculators for commissary and exchange savings
   - Interactive elements: Sliders, checkboxes, dynamic calculations

4. **Sponsor Slot 2** (Lines 448-458)
   - Navy Federal Credit Union banner
   - Logo, tagline, and call-to-action

5. **Pro-Tips Section** (Lines 459-499)
   - ID: `tips`
   - Content: Essential shopping tips and MWR/ITT information

6. **PCS Shopping Toolkit** (Lines 500-631)
   - ID: `base-hub`
   - Content: PCS shopping list, tips, official resources
   - Interactive elements: PDF download functionality

7. **Shopping Overseas** (Lines 632-701)
   - ID: `oconus`
   - Content: Country-specific shopping guides (Germany, Japan, Korea, Italy)
   - Interactive elements: Tabbed interface for country selection

8. **FAQ Section** (Lines 702-751)
   - ID: `faq`
   - Content: Frequently asked questions with expandable answers
   - Interactive elements: Accordion-style Q&A

9. **Sponsor Slot 3** (Lines 752-757)
   - USAA banner
   - Logo, tagline, and call-to-action

#### Footer (Lines 759-765)
- Copyright information
- Dynamic year insertion

#### JavaScript (Lines 766-1244)
- DOM event listeners
- Interactive functionality
- Calculator logic
- PDF generation
- Chart.js integration

## Critical Structural Dependencies

### Navigation Consistency
- Navigation links MUST match section IDs exactly
- Order in navigation MUST match document order
- All section IDs must be unique

### Interactive Elements
- Calculator sliders depend on specific HTML structure
- Chart.js requires canvas element with ID `mwrChart`
- PDF generation requires specific button ID `download-shopping-list`
- OCONUS tabs require specific data attributes and content structure

### Sponsor Slot Positioning
- Sponsor slots are strategically placed between content sections
- They should maintain consistent styling and spacing
- Moving them requires updating surrounding section margins

### JavaScript Dependencies
- All interactive elements have corresponding JavaScript event listeners
- Moving sections may break JavaScript selectors
- Calculator functionality depends on specific input IDs and structure

## Validation Checklist

Before making structural changes, verify:
- [ ] All section IDs are unique and match navigation links
- [ ] Navigation order matches document section order
- [ ] Interactive elements have corresponding JavaScript
- [ ] Sponsor slots maintain proper spacing
- [ ] No orphaned JavaScript references
- [ ] All external dependencies are loaded
- [ ] JSON-LD structured data is complete

# FamilyMedia Newsletter Structure Documentation

## Overview
This document outlines the complete structure of the FamilyMedia newsletter HTML template to ensure consistency and prevent breaking changes during future modifications.

## Document Structure

### 1. HTML Document Setup (Lines 1-41)
- **DOCTYPE**: HTML5 with XHTML namespace
- **Meta tags**: UTF-8 charset, viewport, IE compatibility, color scheme
- **Title**: Dynamic based on month/year (e.g., "FamilyMedia — September 2025 Newsletter")
- **CSS Styles**: 
  - Email client compatibility styles
  - Responsive design breakpoints (600px)
  - Color scheme definitions
  - Typography classes

### 2. Body Structure (Lines 42-450)

#### 2.1 Hidden Preview Text (Lines 43-45)
- Hidden div with newsletter preview text for email clients
- Should be updated monthly to reflect current content theme

#### 2.2 Main Container (Lines 47-448)
- **Outer table**: Full-width container with background color `#FDFBF5`
- **Inner table**: 600px max-width centered container
- **Background**: Consistent cream color `#FDFBF5`

### 3. Header Section (Lines 52-98)

#### 3.1 Logo and Social Media (Lines 52-85)
- **Left side**: FamilyMedia logo (180px width)
- **Right side**: Social media icons (Facebook, Instagram)
- **Responsive**: Stacks vertically on mobile, centers content

#### 3.2 Main Headlines (Lines 87-98)
- **Primary headline**: "Your [Month] Guide" (36px, italic, Georgia font)
- **Subtitle**: Monthly theme (22px, Georgia font)
- **Styling**: Centered, consistent color `#2F3A45`

### 4. Content Sections Pattern

Each content section follows this consistent structure:

#### 4.1 Section Separator (Lines 100-108, 128-136, etc.)
```html
<tr>
  <td style="padding:24px 24px 24px 24px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="height:2px; background-color:#2F3A45; line-height:2px; font-size:2px;">&nbsp;</td>
      </tr>
    </table>
  </td>
</tr>
```

#### 4.2 Content Block (Lines 110-126, 138-153, etc.)
- **Container**: White background with 2px solid border `#2F3A45`
- **Border radius**: 12px
- **Padding**: 24px on all sides
- **Content**: Varies by section type

### 5. Section Types

#### 5.1 Welcome Message (Lines 110-126)
- **Purpose**: Monthly greeting from FamilyMedia team
- **Structure**: Simple paragraph with team signature
- **Styling**: Georgia font, 17px, line-height 1.6

#### 5.2 Sponsor Sections (Lines 138-153, 290-306)
- **Purpose**: Featured sponsor content
- **Elements**:
  - "This Month's Newsletter is Presented By" or "Sponsored Content" label
  - Sponsor logo (200px width, responsive)
  - Description text
  - Call-to-action button
- **Button styling**: Background `#D71E28` or `#1A73E8`, white text, 6px border radius

#### 5.3 Article Previews (Lines 165-201, 258-278, 318-338)
- **Structure**:
  - Hero image (552px width, 100% responsive, 8px border radius)
  - Article headline (H2, 22px, Georgia font)
  - Author byline (13px)
  - Article description or bullet points
  - "Read Full Story" button
- **Button styling**: Blue background `#1A73E8`, white text

#### 5.4 Resource Lists (Lines 213-246)
- **Structure**:
  - H3 headline (18px, Georgia font)
  - Author byline
  - Bulleted list of resources
  - No call-to-action button (informational only)

#### 5.5 Giveaway Section (Lines 350-381)
- **Purpose**: Monthly community giveaway
- **Elements**:
  - "A Thank You To Our Community" headline
  - Prize description
  - Sponsor acknowledgment
  - Sponsor logo
  - Entry code in dark box with dashed border
  - Two action buttons: "Enter to Win!" and "Visit Sponsor"
- **Special styling**: Dark section with white text for code display

### 6. Footer Section (Lines 393-444)

#### 6.1 Contact Information (Lines 397-435)
- **Left side**: 
  - Author photo (60px, circular)
  - Author name and title
  - Social media icons (Facebook, Instagram, LinkedIn)
- **Right side**:
  - FamilyMedia logo (150px width)
  - Physical address

#### 6.2 Legal/Unsubscribe (Lines 436-441)
- **Content**: Subscription notice and unsubscribe link
- **Styling**: Centered, small text, consistent color scheme

## Key Design Elements

### Color Palette
- **Primary text**: `#2F3A45` (dark blue-gray)
- **Background**: `#FDFBF5` (cream)
- **White sections**: `#ffffff`
- **Dark sections**: `#222222`
- **Primary buttons**: `#1A73E8` (blue)
- **Secondary buttons**: `#D71E28` (red)

### Typography
- **Primary font**: Georgia, Times New Roman, serif
- **Button font**: Arial, Helvetica, sans-serif
- **Code font**: Courier New, Courier, monospace

### Spacing
- **Section padding**: 24px
- **Content padding**: 24px
- **Separator height**: 2px
- **Border radius**: 12px (sections), 8px (images), 6px (buttons)

### Responsive Breakpoints
- **Mobile**: 600px and below
- **Logo width**: 180px → 180px (mobile)
- **Sponsor logo**: 200px → 180px (mobile)
- **Headlines**: Scale down on mobile
- **Social icons**: Reduced padding on mobile

## Content Update Guidelines

### Monthly Updates Required
1. **Title**: Update month and year
2. **Preview text**: Reflect current theme
3. **Main headlines**: Update month and theme
4. **Welcome message**: Customize for current month
5. **Article content**: Update images, headlines, descriptions, and links
6. **Sponsor content**: Update logos, descriptions, and links
7. **Giveaway**: Update prize details and entry code

### Preserve These Elements
- **HTML structure**: Maintain table-based layout
- **CSS classes**: Keep all existing class names
- **Color scheme**: Maintain consistent color palette
- **Spacing**: Preserve padding and margin values
- **Responsive design**: Keep mobile breakpoints intact
- **Email client compatibility**: Maintain inline styles and table structure

### URL Structure
All links include consistent UTM parameters:
- `utm_source=brevo`
- `utm_medium=email`
- `utm_campaign=202509_Newsletter` (update year/month)
- `utm_id=33`

## File Organization
- **Main file**: `Newsletter.html`
- **Documentation**: `Newsletter_Structure_Documentation.md`
- **Backup**: Create monthly backups before major changes

## Testing Checklist
Before publishing any changes:
1. Test in multiple email clients (Gmail, Outlook, Apple Mail)
2. Verify responsive design on mobile devices
3. Check all links and images load correctly
4. Validate HTML structure
5. Test dark mode compatibility
6. Verify UTM tracking parameters

---

*Last updated: [Current Date]*
*Version: 1.0*

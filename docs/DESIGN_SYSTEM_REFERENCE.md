# 🎨 GARRISON LEDGER DESIGN SYSTEM REFERENCE

**Version:** 1.0.0  
**Date:** 2025-01-17  
**Purpose:** Complete reference guide for design system implementation  
**Critical:** Use this as the single source of truth for all design decisions

---

## 🏷️ **LABELING SYSTEM & CONVENTIONS**

### **Component Labeling Strategy:**

All components follow this naming convention:
```
[Category]-[Element]-[Variant]-[State]
```

**Examples:**
- `btn-primary` - Button, primary variant
- `card-elevated-hover` - Card, elevated variant, hover state
- `text-primary` - Text, primary color
- `badge-success-sm` - Badge, success variant, small size

---

## 🎨 **COLOR SYSTEM LABELS**

### **Primary Colors (Navy Authority Palette):**
```css
/* LABEL: navy-authority - Main headings, primary actions */
--navy-authority: #0F172A;
Usage: text-primary, btn-primary background
Context: Conveys military authority and professionalism

/* LABEL: navy-professional - Secondary elements, links */
--navy-professional: #1E40AF;
Usage: Links, secondary buttons, active states
Context: Professional military hierarchy

/* LABEL: navy-light - Hover states, accents */
--navy-light: #3B82F6;
Usage: Hover states, interactive accents
Context: Interactive feedback
```

### **Neutral Colors (Professional Hierarchy):**
```css
/* LABEL: text-primary - Primary text */
--text-primary: #0F172A;
Usage: Headings, important text, high emphasis
Context: Maximum readability and authority

/* LABEL: text-body - Body text */
--text-body: #374151;
Usage: Paragraph text, descriptions, standard content
Context: Comfortable long-form reading

/* LABEL: text-muted - Secondary text */
--text-muted: #6B7280;
Usage: Captions, metadata, less important info
Context: Visual hierarchy, de-emphasized content

/* LABEL: background - Page backgrounds */
--background: #F7F8FA;
Usage: Main page backgrounds, app canvas
Context: Professional, non-distracting base

/* LABEL: surface - Card backgrounds */
--surface: #FFFFFF;
Usage: Cards, modals, elevated content
Context: Content containers, focus areas

/* LABEL: border-default - Standard borders */
--border: #E5E7EB;
Usage: Card borders, dividers, separators
Context: Subtle visual separation

/* LABEL: border-strong - Emphasis borders */
--border-strong: #D1D5DB;
Usage: Form focus states, important divisions
Context: Draw attention, emphasis
```

### **Status Colors (Clear Communication):**
```css
/* LABEL: success - Positive actions */
--success: #059669;
Usage: Success messages, positive indicators, green buttons
Context: Confirmation, positive outcomes

/* LABEL: warning - Cautions, notices */
--warning: #D97706;
Usage: Warning messages, important notices, alerts
Context: Attention needed, caution advised

/* LABEL: danger - Errors, critical actions */
--danger: #DC2626;
Usage: Error messages, destructive actions, critical alerts
Context: Stop, review, critical attention

/* LABEL: info - Information, tips */
--info: #0284C7;
Usage: Informational messages, helpful tips, guidance
Context: Educational, informative, helpful
```

---

## 📝 **TYPOGRAPHY LABELS**

### **Font Family Labels:**
```css
/* LABEL: font-serif - Authority headings */
font-family: Lora, serif;
Usage: H1, H2, H3 - Page titles, section headers
Context: Military authority, tradition, readability

/* LABEL: font-sans - Body text */
font-family: Inter, sans-serif;
Usage: Body text, UI elements, buttons
Context: Modern, clean, highly readable
```

### **Type Scale Labels:**
```css
/* LABEL: text-h1 - Hero titles */
--text-h1: 3.5rem; /* 56px */
Usage: Main page titles, hero headlines
Context: Maximum impact, first impression

/* LABEL: text-h2 - Section headers */
--text-h2: 2.5rem; /* 40px */
Usage: Major section divisions
Context: Clear content organization

/* LABEL: text-h3 - Subsection headers */
--text-h3: 2rem; /* 32px */
Usage: Subsection titles, card headers
Context: Content hierarchy

/* LABEL: text-h4 - Card titles */
--text-h4: 1.5rem; /* 24px */
Usage: Card titles, widget headers
Context: Component-level hierarchy

/* LABEL: text-lg - Emphasis text */
--text-lg: 1.25rem; /* 20px */
Usage: Important descriptions, lead text
Context: Draw attention to key info

/* LABEL: text-base - Standard text */
--text-base: 1rem; /* 16px */
Usage: Body text, standard UI
Context: Comfortable reading size

/* LABEL: text-sm - Supporting text */
--text-sm: 0.875rem; /* 14px */
Usage: Captions, metadata, small UI elements
Context: Secondary information
```

---

## 🧩 **COMPONENT LABELS**

### **Button Labels:**
```css
/* LABEL: btn-primary - Main actions */
.btn-primary {
  background: var(--navy-authority);
  color: white;
  /* High emphasis, primary user actions */
}

/* LABEL: btn-secondary - Alternative actions */
.btn-secondary {
  background: #F3F4F6;
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
  /* Medium emphasis, secondary actions */
}

/* LABEL: btn-outline - Tertiary actions */
.btn-outline {
  background: transparent;
  color: var(--navy-authority);
  border: 2px solid var(--navy-professional);
  /* Low emphasis, optional actions */
}

/* LABEL: btn-ghost - Minimal actions */
.btn-ghost {
  background: transparent;
  color: var(--navy-professional);
  /* Minimal emphasis, inline actions */
}
```

### **Card Labels:**
```css
/* LABEL: card - Standard container */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  /* Standard content container */
}

/* LABEL: card-hover - Interactive card */
.card-hover {
  transition: all 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  /* Indicates interactivity */
}

/* LABEL: card-elevated - Prominent container */
.card-elevated {
  box-shadow: var(--shadow-lg);
  /* Draws extra attention */
}
```

### **Badge Labels:**
```css
/* LABEL: badge-primary - Primary status */
.badge-primary {
  background: #EFF6FF;
  color: var(--navy-professional);
  /* Primary information badge */
}

/* LABEL: badge-success - Success status */
.badge-success {
  background: var(--success-light);
  color: var(--success);
  /* Positive status indicator */
}

/* LABEL: badge-warning - Warning status */
.badge-warning {
  background: var(--warning-light);
  color: var(--warning);
  /* Caution status indicator */
}

/* LABEL: badge-danger - Error status */
.badge-danger {
  background: var(--danger-light);
  color: var(--danger);
  /* Error/critical status indicator */
}

/* LABEL: badge-neutral - Neutral status */
.badge-neutral {
  background: #F3F4F6;
  color: var(--text-muted);
  /* Neutral information badge */
}
```

### **Form Labels:**
```css
/* LABEL: input-field - Standard input */
.input-field {
  background: var(--surface);
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  /* Standard form input */
}

/* LABEL: input-field:focus - Active input */
.input-field:focus {
  border-color: var(--navy-professional);
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
  /* User is actively inputting */
}

/* LABEL: input-field-error - Error state */
.input-field-error {
  border-color: var(--danger);
  /* Validation error indicator */
}
```

---

## 📏 **SPACING LABELS**

### **Spacing Scale (Military Precision):**
```css
/* LABEL: space-1 - Minimal spacing */
--space-1: 0.25rem; /* 4px */
Usage: Icon gaps, tight spacing
Context: Very close relationship

/* LABEL: space-2 - Extra small */
--space-2: 0.5rem; /* 8px */
Usage: Badge padding, tight layouts
Context: Close relationship

/* LABEL: space-3 - Small */
--space-3: 0.75rem; /* 12px */
Usage: Button padding, form spacing
Context: Related elements

/* LABEL: space-4 - Base */
--space-4: 1rem; /* 16px */
Usage: Standard element spacing
Context: Default spacing unit

/* LABEL: space-6 - Medium */
--space-6: 1.5rem; /* 24px */
Usage: Card padding, component spacing
Context: Component-level separation

/* LABEL: space-8 - Large */
--space-8: 2rem; /* 32px */
Usage: Section spacing, layout gaps
Context: Major element separation

/* LABEL: space-12 - Extra large */
--space-12: 3rem; /* 48px */
Usage: Section padding, page spacing
Context: Major section divisions

/* LABEL: space-16 - Huge */
--space-16: 4rem; /* 64px */
Usage: Hero padding, page sections
Context: Major page-level spacing
```

---

## 🎭 **SEMANTIC CLASS LABELS**

### **Background Classes:**
```css
/* LABEL: bg-page - Main backgrounds */
.bg-page { background-color: var(--background); }
Context: App canvas, page backgrounds

/* LABEL: bg-surface - Content backgrounds */
.bg-surface { background-color: var(--surface); }
Context: Cards, modals, panels

/* LABEL: bg-surface-hover - Hover backgrounds */
.bg-surface-hover { background-color: #F9FAFB; }
Context: Interactive element hover states
```

### **Text Classes:**
```css
/* LABEL: text-primary - Primary text */
.text-primary { color: var(--text-primary); }
Context: Headings, important content

/* LABEL: text-body - Body text */
.text-body { color: var(--text-body); }
Context: Paragraph text, standard content

/* LABEL: text-muted - Secondary text */
.text-muted { color: var(--text-muted); }
Context: Captions, less important info
```

### **Border Classes:**
```css
/* LABEL: border-default - Standard borders */
.border-default { border-color: var(--border); }
Context: Card borders, dividers

/* LABEL: border-strong - Emphasis borders */
.border-strong { border-color: var(--border-strong); }
Context: Form focus, important divisions
```

---

## 🔄 **STATE LABELS**

### **Interactive States:**
```css
/* LABEL: hover - Mouse over */
:hover
Context: User is hovering, show interactivity

/* LABEL: focus - Keyboard focus */
:focus, :focus-visible
Context: User is navigating with keyboard

/* LABEL: active - Being clicked */
:active
Context: User is actively clicking

/* LABEL: disabled - Cannot interact */
:disabled, .disabled
Context: Action not currently available
```

---

## 📦 **COMPONENT USAGE GUIDE**

### **When to Use Each Component:**

**Button Labels:**
- `btn-primary` - Main call-to-action (e.g., "Get Started", "Submit")
- `btn-secondary` - Alternative actions (e.g., "Cancel", "Learn More")
- `btn-outline` - Tertiary actions (e.g., "View Details", "Edit")
- `btn-ghost` - Minimal actions (e.g., inline "View", "Close")

**Badge Labels:**
- `badge-primary` - Default information (e.g., "New Feature")
- `badge-success` - Positive status (e.g., "Active", "Completed")
- `badge-warning` - Needs attention (e.g., "Pending", "Review")
- `badge-danger` - Critical status (e.g., "Error", "Failed")
- `badge-neutral` - Neutral info (e.g., "Draft", "Inactive")

**Card Labels:**
- `card` - Standard content container
- `card + card-hover` - Interactive/clickable card
- `card-elevated` - Important/featured content

---

## 🎯 **MILITARY AUDIENCE SPECIFIC LABELS**

### **Military Context Classes:**
```css
/* LABEL: military-professional - Military-appropriate styling */
Context: Professional, no-nonsense, authoritative

/* LABEL: military-trust - Trust-building elements */
Context: Security badges, transparency indicators

/* LABEL: military-hierarchy - Clear visual hierarchy */
Context: Chain-of-command style organization

/* LABEL: military-efficiency - Mission-focused design */
Context: Fast, direct, clear paths to goals
```

---

## 🔍 **FINDING & UPDATING GUIDE**

### **Global Changes:**

**To update all primary buttons:**
```bash
# Find all btn-primary usage
grep -r "btn-primary" app/

# Update in globals.css
.btn-primary { /* modify here */ }
```

**To update all text colors:**
```bash
# Find all text-primary usage
grep -r "text-primary" app/

# Update in globals.css
.text-primary { /* modify here */ }
```

### **Component-Specific Changes:**

**To update specific component:**
```bash
# Find component usage
grep -r "ComponentName" app/

# Update component file
app/components/ui/ComponentName.tsx
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **For Every New Component:**
- [ ] Use semantic color variables (not hard-coded colors)
- [ ] Apply consistent spacing from spacing scale
- [ ] Use typography scale for text sizes
- [ ] Include hover/focus states for interactive elements
- [ ] Add appropriate ARIA labels for accessibility
- [ ] Document component in this reference guide
- [ ] Test with design system tokens

### **For Every New Page:**
- [ ] Use consistent layout patterns
- [ ] Apply bg-page for main background
- [ ] Use bg-surface for cards/panels
- [ ] Maintain visual hierarchy with typography
- [ ] Use semantic color classes
- [ ] Test mobile responsiveness
- [ ] Verify accessibility (WCAG AA)

---

## 🚀 **QUICK REFERENCE COMMANDS**

### **Find All Usage of a Class:**
```bash
# Find all uses of a specific class
grep -r "class-name" app/

# Find in specific directory
grep -r "class-name" app/components/

# Find in specific file type
grep -r "class-name" --include="*.tsx" app/
```

### **Update Global Design Token:**
```bash
# 1. Update in globals.css
vim app/globals.css

# 2. Find all affected files
grep -r "token-name" app/

# 3. Test changes
npm run dev

# 4. Commit with clear message
git commit -m "🎨 Updated [token-name] design token"
```

---

## 📝 **DOCUMENTATION STANDARDS**

### **When Adding New Component:**
1. Add to this reference guide with proper labeling
2. Document in component file with JSDoc comments
3. Update DESIGN_SYSTEM_IMPLEMENTATION_TRACKING.md
4. Add usage examples
5. Note any military-specific considerations

### **When Modifying Design Token:**
1. Update this reference guide
2. Document reason for change
3. Update SYSTEM_STATUS.md
4. Test all affected components
5. Communicate changes to team

---

**This labeling system ensures that Garrison Ledger maintains a world-class, consistent design system that is easy to maintain, scale, and understand by anyone working on the platform.**

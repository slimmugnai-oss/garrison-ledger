# 📊 CALCULATOR TOOLS STANDARDS

**Version:** 1.0.0  
**Last Updated:** 2025-01-16  
**Status:** All 6 calculators standardized

---

## 🎯 **OVERVIEW**

Garrison Ledger offers 6 free calculator tools, all designed to help military members make informed financial decisions. This document defines the standards for consistency, user experience, and technical implementation.

---

## 🧮 **THE 6 CALCULATOR TOOLS**

### **Financial Planning (3 Tools):**
1. **TSP Modeler** - Retirement allocation modeling (`/dashboard/tools/tsp-modeler`)
2. **SDP Strategist** - Deployment savings strategy (`/dashboard/tools/sdp-strategist`)
3. **House Hacking Calculator** - Real estate cash flow analysis (`/dashboard/tools/house-hacking`)

### **Logistics & Career (3 Tools):**
4. **PCS Financial Planner** - Move budget & PPM profit estimation (`/dashboard/tools/pcs-planner`)
5. **Annual Savings Command Center** - Commissary/Exchange savings (`/dashboard/tools/on-base-savings`)
6. **Career Opportunity Analyzer** - Total compensation comparison (`/dashboard/tools/salary-calculator`)

---

## 🎨 **DESIGN STANDARDS**

### **Page Layout Structure:**
```tsx
<>
  <Header />
  <div className="min-h-screen bg-background">
    {/* Hero Section */}
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <PageHeader
        title="[Calculator Name]"
        subtitle="[Brief description of what it does]"
        badge="Free Tool"
      />
      
      <SignedOut>
        {/* Sign-in CTA (NO pricing, NO premium messaging) */}
      </SignedOut>
      
      <SignedIn>
        {/* Calculator Component */}
        
        {/* Educational Content Section */}
        
        {/* Pro Tips Section */}
      </SignedIn>
    </div>
  </div>
  <Footer />
</>
```

### **Visual Design:**
- **Background:** Clean light background (`bg-background`)
- **Container:** Max width 5xl (7xl for complex layouts)
- **Spacing:** Consistent padding (px-4 sm:px-6, py-12)
- **Typography:** Lora for headings, Inter for body
- **Colors:** Semantic color system (btn-primary, text-primary, etc.)

### **Badge Standards:**
- ✅ **"Free Tool"** badge in green (not "Premium Tool")
- Format: `<Badge variant="success">Free Tool</Badge>`
- Position: Above the main title

---

## 🔐 **AUTH & ACCESS POLICY**

### **ALL CALCULATORS ARE FREE:**
- ✅ No paywall whatsoever
- ✅ No "Unlock for $9.99/mo" messaging
- ✅ No premium gates or blurred content
- ✅ No feature limitations for free users

### **Signed-Out Experience:**
```tsx
<SignedOut>
  <div className="bg-card rounded-xl p-8 border border-border text-center max-w-2xl mx-auto">
    <Icon name="Calculator" className="h-12 w-12 text-primary mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-primary mb-3">
      Ready to [Action]?
    </h2>
    <p className="text-body mb-6">
      Sign in to access this free calculator and [specific benefit].
    </p>
    <Link
      href="/sign-in"
      className="btn-primary inline-flex items-center px-6 py-3 rounded-lg font-semibold"
    >
      Sign In to Get Started
    </Link>
    <p className="text-sm text-muted mt-4">
      Free account • No credit card required
    </p>
  </div>
</SignedOut>
```

### **Signed-In Experience:**
- Show full calculator immediately
- No "preview mode" for calculations
- Include AI Explainer component (if applicable)
- Display educational content below calculator

---

## 🤖 **AI EXPLAINER INTEGRATION**

### **What It Does:**
- Provides personalized AI explanation of calculator results
- Uses GPT-4o-mini (~$0.01 per explanation)
- Shows 2-3 sentence preview for all users
- Full explanation unlocks with premium

### **Implementation:**
```tsx
import Explainer from '@/app/components/ai/Explainer';

// Inside calculator component, after results:
<Explainer
  tool="tsp" // or "sdp", "house-hacking", "pcs", "on-base-savings", "career"
  input={{
    // Calculator input values
    age: 30,
    balance: 50000,
    // ... other relevant inputs
  }}
  output={{
    // Calculator results
    endValue: 500000,
    difference: 50000,
    // ... other relevant outputs
  }}
/>
```

### **Explainer Display:**
- Position: Below main results, before educational content
- Style: Gradient card with AI icon
- Copy: "AI Analysis" or "Personalized Insights"

---

## 📚 **EDUCATIONAL CONTENT**

### **Every Calculator Should Include:**

1. **Related Resources Section:**
   - 2-3 cards with tips, links, or explanations
   - Use semantic colors (info-subtle, success-subtle)
   - External links to official resources (DFAS, Move.mil, etc.)

2. **Pro Tips Section:**
   - Practical advice specific to the tool
   - Bullet points for scannability
   - Military-specific considerations

3. **Footer Links:**
   - Related resource hub pages
   - Other relevant calculators
   - Assessment CTA if applicable

### **Content Guidelines:**
- **Military-Specific:** Use military terminology correctly
- **Actionable:** Provide clear next steps
- **Trustworthy:** Link to official .mil/.gov sources
- **Scannable:** Use bullets, headings, short paragraphs

---

## 💻 **COMPONENT STANDARDS**

### **Page Component (`page.tsx`):**
```tsx
import type { Metadata } from "next";
import { SignedIn, SignedOut } from '@clerk/nextjs';
import [CalculatorComponent] from '@/app/components/tools/[CalculatorComponent]';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import PageHeader from '@/app/components/ui/PageHeader';
import Badge from '@/app/components/ui/Badge';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "[Tool Name] - [Benefit]",
  description: "[SEO-optimized description with military keywords]",
  path: "/dashboard/tools/[slug]",
  keywords: ["keyword1", "keyword2", "..."]
});

export default function Page() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <Badge variant="success" className="mb-4">Free Tool</Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-3">
              [Calculator Name]
            </h1>
            <p className="text-xl text-body max-w-3xl mx-auto">
              [Brief description]
            </p>
          </div>

          <SignedOut>
            {/* Sign-in CTA */}
          </SignedOut>

          <SignedIn>
            <[CalculatorComponent] />
            
            {/* Educational sections */}
          </SignedIn>
        </div>
      </div>
      <Footer />
    </>
  );
}
```

### **Calculator Component:**
```tsx
'use client';

import { useState, useEffect } from 'react';
import { track } from '@/lib/track';
import Explainer from '@/app/components/ai/Explainer';
import Icon from '@/app/components/ui/Icon';

export default function [CalculatorName]() {
  // State management
  const [input1, setInput1] = useState(defaultValue);
  const [results, setResults] = useState(null);
  
  // Track page view on mount
  useEffect(() => {
    track('[tool]_view');
  }, []);
  
  // Calculation logic
  const calculate = async () => {
    track('[tool]_calculate');
    // ... calculation logic
  };
  
  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-bold text-primary mb-4">Your Information</h2>
        {/* Input fields */}
      </div>
      
      {/* Results Section */}
      {results && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold text-primary mb-4">Your Results</h2>
          {/* Results display */}
        </div>
      )}
      
      {/* AI Explainer */}
      {results && (
        <Explainer
          tool="[tool-slug]"
          input={{ ... }}
          output={{ ... }}
        />
      )}
    </div>
  );
}
```

---

## 🎯 **CONTRAST & ACCESSIBILITY**

### **Text Contrast (WCAG AA):**
- Primary headings: `text-primary` (4.5:1 minimum)
- Body text: `text-body` (4.5:1 minimum)
- Muted text: `text-muted` (4.5:1 minimum)
- Links: `text-link hover:text-link-hover` with underline

### **Button Contrast:**
- Primary CTA: `btn-primary` (auto-contrast)
- Secondary: `btn-secondary` (auto-contrast)
- Danger/Cancel: `btn-danger` (auto-contrast)

### **Input Fields:**
- Border: `border-input` with `focus:ring-2 focus:ring-primary`
- Background: `bg-white` (light mode)
- Labels: `text-primary font-medium`

### **Interactive Elements:**
- Minimum touch target: 44x44px
- Clear hover states: `hover:-translate-y-[1px] transition-all`
- Focus indicators: `focus:outline-none focus:ring-2`

---

## 📱 **MOBILE OPTIMIZATION**

### **Responsive Breakpoints:**
- Mobile first: Base styles for mobile
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)

### **Mobile-Specific Patterns:**
- Stack inputs vertically on mobile
- Full-width buttons on mobile
- Larger touch targets (min 44px)
- Simplified layouts (hide advanced options behind toggles)

### **Testing Checklist:**
- ✅ All text readable without zooming
- ✅ All buttons easily tappable
- ✅ No horizontal scrolling
- ✅ Charts/graphs responsive
- ✅ Forms submit correctly

---

## 🔍 **SEO & METADATA**

### **Title Format:**
`[Tool Name] - [Primary Benefit] | Garrison Ledger`

### **Description Format:**
`[Action verb] [specific benefit] [target audience]. [Key features]. [Military-specific angle].`

**Example:**  
"Calculate your TSP retirement projections with our military-focused allocation modeler. Compare fund mixes, project 30-year growth, and optimize your BRS contributions."

### **Keywords:**
- Primary: Tool name, main function
- Secondary: Military-specific terms (TSP, BRS, PCS, BAH)
- Long-tail: "military TSP calculator", "BRS retirement planning"

---

## 📊 **ANALYTICS TRACKING**

### **Required Events:**
```typescript
track('[tool]_view');          // Page view
track('[tool]_calculate');     // Calculation performed
track('[tool]_explainer_view'); // AI explainer viewed
track('[tool]_save');          // Model saved (if applicable)
```

### **Optional Events:**
```typescript
track('[tool]_advanced_toggle'); // Advanced options shown
track('[tool]_export');         // Results exported (PDF/CSV)
track('[tool]_share');          // Results shared
```

---

## ✅ **PRE-DEPLOYMENT CHECKLIST**

Before deploying any calculator changes:

- [ ] **Design:** Consistent badge, header, layout
- [ ] **Auth:** No premium messaging, clean sign-in CTA
- [ ] **Functionality:** All calculations work correctly
- [ ] **AI Explainer:** Integrated and tested
- [ ] **Educational:** Tips, resources, and links included
- [ ] **Contrast:** All text/buttons pass WCAG AA
- [ ] **Mobile:** Tested on mobile viewport
- [ ] **SEO:** Metadata complete and optimized
- [ ] **Analytics:** All tracking events fire correctly
- [ ] **Footer:** Present on all calculator pages
- [ ] **Build:** No TypeScript/ESLint errors

---

## 🚀 **DEPLOYMENT WORKFLOW**

1. **Update page component** with new standards
2. **Update calculator component** (if needed)
3. **Add educational content** (resources, tips)
4. **Test signed-in and signed-out flows**
5. **Check mobile responsiveness**
6. **Run contrast checker:** `npm run check-contrast`
7. **Build:** `npm run build`
8. **Deploy:** Push to GitHub → Vercel auto-deploys

---

## 📝 **MAINTENANCE**

### **Monthly Review:**
- Check all external links (DFAS, Move.mil, etc.)
- Update dollar amounts/rates if changed
- Review analytics for usage patterns
- Collect user feedback and iterate

### **When to Update:**
- Military pay tables change
- TSP contribution limits change
- Tax rates or COLA data updates
- New military benefits announced

---

**This document should be the single source of truth for all calculator tool development and maintenance.**


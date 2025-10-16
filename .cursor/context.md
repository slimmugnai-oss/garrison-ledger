# 🧠 CURSOR CONTEXT LAYER

**Purpose:** Ultra-fast context loading for maximum efficiency

## 🎯 **PROJECT SNAPSHOT**

**Garrison Ledger** - AI-powered military financial planning platform
- **Core Innovation:** AI Master Curator & Narrative Weaver (8-10 expert blocks + personalized plans)
- **Tech Stack:** Next.js 15, TypeScript, Supabase, Clerk, Vercel
- **Status:** Production Ready (100/100 health score)
- **Version:** 2.7.1 (Settings Widget Visibility Fixed)

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Core Systems:**
1. **AI Master Curator** - GPT-4o content selection (~$0.25/plan)
2. **AI Narrative Weaver** - GPT-4-mini personalized summaries
3. **Adaptive Assessment** - Dynamic question flow
4. **Content Intelligence** - 410 hand-curated blocks, vector search ready
5. **Freemium Model** - Free (2 blocks) vs Premium (8-10 blocks)
6. **Contact System** - Professional support with ticket tracking
7. **Binder System** - File management with 7 components
8. **Profile System** - 20 fields, mobile-optimized
9. **Intelligence Library** - 410+ articles, 5/day free limit
10. **Directory System** - Free provider directory
11. **Tool Suite** - 6 calculators (3 financial, 3 planning)
12. **Listening Post** - AI content curation system
13. **User Flow** - Onboarding tour, generating states

### **Database (17 tables):**
- `user_profiles` (20 fields), `assessments`, `user_plans`, `content_blocks` (410)
- `contact_submissions`, `binder_files`, `entitlements`, `referrals`
- `feed_items`, `events`, `providers`, `ratings`, `bookmarks`

### **API Routes (44 total):**
- Plan generation, assessment, content, library, binder, contact
- Stripe billing, referrals, admin, tools, tracking

## 🎨 **DESIGN SYSTEM**

### **Colors:**
- Primary: `#2563eb` (blue-600)
- Success: `#16a34a` (green-600) 
- Warning: `#ca8a04` (yellow-600)
- Danger: `#dc2626` (red-600)
- Text: `#111827` (gray-900), `#374151` (gray-700)

### **Typography:**
- Headings: `font-serif` (Lora)
- Body: `font-sans` (Inter)
- Sizes: `text-4xl` (h1), `text-2xl` (h2), `text-lg` (body)

### **Components:**
- `AnimatedCard` - Fade-in animations
- `Badge` - Status indicators  
- `PageHeader` - Consistent headers
- `Icon` - Type-safe icon system

## 🔧 **DEVELOPMENT PATTERNS**

### **File Structure:**
```
app/
├── api/ (44 routes)
├── components/ (66 components)
├── dashboard/ (16+ pages)
└── [feature]/page.tsx
```

### **Component Patterns:**
- Server Components by default
- Client Components with `'use client'`
- TypeScript strict mode
- Tailwind CSS classes
- Supabase RLS policies

### **API Patterns:**
```typescript
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  // Implementation
}
```

## 🚀 **PERFORMANCE TARGETS**

- **Page Load:** < 3 seconds
- **Core Web Vitals:** All green
- **Mobile:** 320px+ responsive
- **Accessibility:** WCAG AA compliant
- **SEO:** 100/100 score

## 🔒 **SECURITY STANDARDS**

- **RLS:** All user tables protected
- **Auth:** Clerk integration
- **API:** Rate limiting, validation
- **Data:** No sensitive info in logs

## 📊 **CURRENT METRICS**

- **Health Score:** 100/100
- **API Routes:** 44
- **Components:** 66
- **Database Tables:** 17
- **Content Blocks:** 410
- **Systems:** 13

## 🎯 **RECENT CHANGES**

- **v2.7.1:** Settings widget visibility fix
- **v2.7.0:** Contact system (95/100)
- **v2.6.0:** Binder system overhaul (98/100)
- **v2.5.1:** User flow enhancements (95/100)

## 🔄 **WORKFLOW INTEGRATION**

- **Magic Phrase:** "Check SYSTEM_STATUS.md first, Follow .cursorrules, Use DEVELOPMENT_WORKFLOW.md, Update docs when done"
- **Auto Actions:** Context loading, TODO creation, documentation updates
- **Quality Gates:** TypeScript strict, ESLint, build success, testing

---

**This context layer enables instant project understanding for maximum development efficiency.**

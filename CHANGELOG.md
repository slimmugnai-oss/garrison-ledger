# 📋 CHANGELOG

All notable changes to Garrison Ledger will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.2.0] - 2025-01-19 - LES & Paycheck Auditor (Beta)

### 🚀 Added
- **LES & Paycheck Auditor** (Beta)
  - Upload and parse Leave & Earnings Statement (LES) PDFs
  - Automated pay discrepancy detection (BAH, BAS, COLA)
  - Actionable BLUF messaging with concrete next steps
  - DFAS reference links for each flag
  - Tier gating: Free (1 upload/month), Premium (unlimited)
  - Maximum 5MB PDF file size
  - Server-side only parsing (security & privacy)
  
- **Database Schema** (`20251019_les_auditor.sql`)
  - `les_uploads` - Upload metadata
  - `les_lines` - Parsed line items
  - `expected_pay_snapshot` - Computed expected pay
  - `pay_flags` - Audit discrepancies
  - `les_raw` storage bucket (private)
  - `les_uploads_summary` admin view
  
- **Business Logic** (`lib/les/`)
  - `codes.ts` - LES code mappings (BAH, BAS, COLA, SDAP, HFP, etc.)
  - `parse.ts` - PDF parser with pattern matching
  - `expected.ts` - Expected pay calculator (factual-only)
  - `compare.ts` - Comparison engine with flag generation
  
- **API Routes**
  - `POST /api/les/upload` - Upload & parse PDF
  - `POST /api/les/audit` - Run audit comparison
  - `GET /api/les/history` - List past uploads
  
- **Type System** (`app/types/les.ts`)
  - Complete TypeScript definitions (400+ lines)
  - Helper functions for formatting and validation
  - Flag code constants
  
- **SSOT Integration**
  - Added `features.lesAuditor` configuration
  - Added `militaryPay.basMonthlyCents` (Officer/Enlisted)
  - Added `militaryPay.comparisonThresholds` ($5 BAH, $1 BAS, $5 COLA)

### 🔒 Security
- **RLS:** All tables have row-level security
- **Server-only:** PDF parsing never client-side
- **Private storage:** `les_raw` bucket requires signed URLs
- **User ownership:** APIs verify `user_id === clerkUserId`
- **No secrets:** No API keys exposed

### 📊 Data Integrity
- **Factual-only policy:** No synthetic or estimated data
- **Omit vs guess:** If BAH/COLA unavailable, omit rather than fabricate
- **Provenance ready:** Snapshots store `computed_at` timestamp
- **Official sources:** All flags link to DFAS/DefenseTravel

### 🎯 Flag Types Implemented
- **Red (Critical):** `BAH_MISMATCH`, `BAS_MISSING`, `COLA_STOPPED`, `SPECIAL_PAY_MISSING`
- **Yellow (Warning):** `COLA_UNEXPECTED`, `MINOR_VARIANCE`, `VERIFICATION_NEEDED`
- **Green (OK):** `BAH_CORRECT`, `BAS_CORRECT`, `ALL_VERIFIED`

### 📝 Documentation
- `docs/active/LES_AUDITOR_IMPLEMENTATION_SUMMARY.md` - Complete implementation guide
- Deployment checklist and testing procedures
- Future roadmap (v1.1: special pays, v2: OCR/images, v2.1: tax calculations)

### 🚧 Pending (UI Development Required)
- Dashboard page (`/dashboard/paycheck-audit`)
- UI components (LesUpload, LesFlags, LesSummary, LesHistory)
- Navigation entry with "Beta" badge
- Analytics event integration
- Premium gating UI (Free tier: max 2 flags visible)
- Copy-to-clipboard email templates

### 📦 Dependencies Required
```bash
npm install pdf-parse @types/pdf-parse
```
Real parser is commented out pending dependency installation.

### ⚠️ Breaking Changes
None - New feature addition only.

---

## [2.1.0] - 2025-01-15 - Freemium Model Launch

### 🚀 Added
- **Freemium Tier System**
  - Free tier: 2-block plan preview, 1 assessment/week
  - Premium tier: Full 8-10 blocks, 3 assessments/day
  - Assessment rate limiting with database functions
  - Rate limit check endpoint `/api/assessment/can-take`
  - Rate limit UI with upgrade path
- **Plan Preview Experience**
  - Free users see 2 curated blocks + truncated executive summary
  - Prominent upgrade CTA showing locked blocks count
  - "Unlock X more curated blocks" messaging
- **Assessment Tracking**
  - `assessment_count_today`, `assessment_date` columns on user_profiles
  - `can_take_assessment()` SQL function
  - `record_assessment_taken()` SQL function

### 🔧 Changed
- **Removed print button** - Retention strategy (users must log in to view plan)
- **Comparison table updated** - Accurate free vs premium features
- **Executive summary** - Truncated to 2 paragraphs for free users
- **Plan display** - Shows "X of Y articles" for free users
- **Premium pricing** - Positioned at $9.99/month (impulse pricing)

### ⚡ Performance
- **Switched to GPT-4o-mini** - Both Curator and Weaver phases
- **Generation time:** 60s → 15-20 seconds (3-4x faster)
- **AI cost:** $0.25 → $0.02 per plan (92% reduction!)
- **Token usage:** 57k → 11.5k tokens (fits free-tier limits)
- **Content filtering:** 410 → 190 top-rated blocks (quality focus)

### 🐛 Fixed
- **Assessment completion** - Fixed database upsert conflict
- **504 timeouts** - Resolved with faster gpt-4o-mini
- **429 token limit** - Reduced token usage by 80%
- **Better error messages** - Shows specific failure details
- **Icon imports** - Fixed PlanClient import path
- **TypeScript errors** - Removed all 'any' types, proper interfaces

### 💰 Business Model
- **Free tier:** $0.08/user/month (sustainable)
- **Premium tier:** 82% margin ($8.19 profit per user)
- **Conversion strategy:** 2-block preview proves AI intelligence
- **Retention:** No print, must log in to access plan

---

## [2.0.1] - 2025-01-15 - System Cleanup & Full Consistency

### 🧹 Cleanup
- **Deprecated Old Plan Endpoints**
  - Marked `/api/strategic-plan`, `/api/plan/ai-score`, `/api/plan/generate-roadmap` as deprecated
  - Added deprecation warnings with 30-day removal timeline (2025-02-15)
  - Created new `/api/plan/regenerate-ai` for AI Master Curator system
  - Marked `/api/plan` (rule-based) as legacy for backward compatibility
- **Complete Terminology Consistency**
  - Changed ALL instances of "Strategic Plan" → "AI-Curated Plan"
  - Changed ALL instances of "Military Life Roadmap" → "Personalized Plan"  
  - Changed "Strategic Assessment" → "AI-Powered Assessment"
  - Updated "379 blocks" → "410+ blocks" (correct number)
  - Updated "6-section assessment" → "~6 adaptive questions"
  - Updated "3-5 resources" → "8-10 expert content blocks"
- **Organized Documentation**
  - Moved 30+ docs from root to `docs/` directory
  - Created `docs/active/`, `docs/archive/`, `docs/guides/`, `docs/planning/`
  - Root now has only 5 essential files

### 📝 Updated Files (12 files)
- `app/page.tsx` - Homepage messaging
- `app/dashboard/page.tsx` - Dashboard terminology
- `app/dashboard/assessment/page.tsx` - Added metadata
- `app/dashboard/assessment/AssessmentClient.tsx` - Badge and subtitle
- `app/dashboard/upgrade/page.tsx` - Feature descriptions
- `app/components/ui/ComparisonTable.tsx` - Feature names
- `app/components/DownloadGuideButton.tsx` - Button text and filenames
- `app/api/generate-guide/route.ts` - PDF filename
- `public/og-image-template.html` - Feature label
- `lib/seo-config.ts` - Tagline, description, keywords, features

### 📚 Documentation
- Created `START_HERE.md` - Personal quick reference
- Created `docs/AUTOMATION_SUMMARY.md` - What AI does vs you
- Created `docs/DEVELOPMENT_WORKFLOW.md` - Standard process
- Created `docs/ORGANIZATION_SUMMARY.md` - Organization guide
- Created `docs/active/SYSTEM_CLEANUP_COMPLETE.md` - Cleanup audit
- Created `docs/active/FINAL_AUDIT_COMPLETE.md` - Comprehensive verification
- Set up git commit template with doc reminders

### ✅ Verification
- Audited all 16 dashboard pages
- Checked all API routes (52 files)
- Reviewed all components (50 files)
- Verified all metadata and SEO
- Checked all resource hub HTML files
- Zero inconsistencies found
- 100% AI-first messaging

---

## [2.0.0] - 2025-01-15 - AI Master Curator Launch

### 🚀 Added
- **AI Master Curator System** - GPT-4o powered content curation
  - Phase 1: AI analyzes 410 content blocks and selects 8-10 most relevant
  - Phase 2: AI generates personalized narrative, intros, and action items
  - Cost: ~$0.25 per plan, ~30 seconds generation time
- **Personalized Plan Display** (`/dashboard/plan`)
  - Executive summary with urgency levels
  - AI-generated relevance scores and explanations
  - Expandable content blocks
  - Recommended calculator tools
  - Action plan checklist
- **New API Endpoints**
  - `POST /api/assessment/complete` - Save assessment responses
  - `POST /api/plan/generate` - Two-phase AI plan generation
- **New Database Tables**
  - `user_assessments` - Adaptive assessment responses
  - `user_plans` - AI-generated personalized plans
- **Navigation Enhancement**
  - "Your AI Plan" link in Command Center dropdown
  - Available in both desktop and mobile navigation

### 🔧 Changed
- **Homepage Messaging** - Emphasizes AI-powered planning
  - Subtitle: "AI-powered financial planning for military life"
  - "How It Works" updated to show 3-step AI flow
  - SEO metadata updated with AI keywords
- **Dashboard Integration**
  - Added "Your Personalized Plan" widget when plan exists
  - Prominent AI-curated badge
  - Dynamic card animations
- **Assessment Flow**
  - Now triggers AI plan generation upon completion
  - Shows "Generating your personalized plan..." loading state
  - Redirects to plan page when complete

### 📊 Improved
- **Content Block Data Quality**
  - Fixed 260 blocks (63%) missing tags → Now 100% coverage
  - Fixed 260 blocks (63%) missing topics → Now 100% coverage
  - All 410 blocks now have complete metadata
  - Vector search infrastructure prepared

### 📚 Documentation
- Created `AI_MASTER_CURATOR_IMPLEMENTATION.md` - Full technical documentation
- Created `DEEP_DIVE_AUDIT_COMPLETE.md` - Comprehensive site audit
- Created `SYSTEM_STATUS.md` - Living system state document
- Created `.cursorrules` - AI agent guidelines
- Organized all documentation into `docs/` directory

---

## [1.5.0] - 2025-01-10 - Intelligence Library Enhancement

### 🚀 Added
- **AI-Powered Intelligence Library**
  - Personalized "For You" recommendations
  - Trending content section
  - Semantic search functionality
  - Difficulty level filters
  - Audience filters (rank, family status)
  - Related content suggestions
- **Bookmarking System**
  - Save favorite content blocks
  - Bookmark management
  - Quick access from dashboard
- **Content Rating System**
  - Users can rate content quality (1-5 stars)
  - Average ratings displayed
  - AI learns from ratings for better curation
- **Share Links**
  - Generate shareable URLs for content blocks
  - Public content viewing at `/content/[id]`
- **Dashboard Widgets**
  - Intelligence Widget for premium users
  - Personalized content recommendations

### 🔧 Changed
- Intelligence Library redesigned with tabs (For You, Trending, Saved)
- Enhanced content block display with ratings and bookmarks
- Improved mobile navigation

### 📊 Database
- Added `user_bookmarks` table
- Added `user_content_ratings` table
- Added `user_content_interactions` table for tracking
- Added `user_content_preferences` table

---

## [1.0.0] - 2024-12-15 - MVP Launch

### 🚀 Added
- **6 Financial Calculator Tools**
  1. TSP Modeler
  2. SDP Strategist
  3. House Hacking Calculator
  4. PCS Planner
  5. Salary Calculator
  6. On-Base Savings Calculator
- **Binder Document Management**
  - File upload to Supabase Storage
  - Expiration tracking and reminders
  - File sharing with tokens
  - Organize by categories
- **Premium Subscription**
  - Stripe integration
  - Monthly/annual plans
  - Premium-only features
- **5 Resource Hub Pages**
  - Base Guides Hub
  - Career Hub
  - Deployment Hub
  - PCS Hub
  - On-Base Shopping Hub
- **User Authentication**
  - Clerk integration
  - Protected dashboard routes
  - User profile management
- **Content Library**
  - 410 hand-curated content blocks
  - Organized by domain (Finance, PCS, Career, Deployment, Lifestyle)
  - Search and filter functionality

### 🔧 Infrastructure
- Next.js 14 App Router
- Supabase (Database + Storage)
- Clerk (Authentication)
- Stripe (Payments)
- Vercel (Hosting)
- Tailwind CSS
- TypeScript

---

## [0.1.0] - 2024-11-01 - Initial Development

### 🚀 Added
- Project initialization
- Basic Next.js setup
- Supabase integration
- Clerk authentication
- Initial UI components

---

## Change Categories

### 🚀 Added
New features

### 🔧 Changed
Changes to existing functionality

### 🗑️ Deprecated
Soon-to-be removed features

### ❌ Removed
Removed features

### 🐛 Fixed
Bug fixes

### 🔒 Security
Security improvements

### 📊 Improved
Performance or quality improvements

### 📚 Documentation
Documentation changes

---

## Versioning Guide

### Major (X.0.0)
- Breaking changes
- Major new features
- Architecture changes

### Minor (0.X.0)
- New features
- Non-breaking changes
- Enhancements

### Patch (0.0.X)
- Bug fixes
- Minor improvements
- Documentation updates

---

**Note:** This changelog started with v2.0.0 (AI Master Curator). Previous versions are summarized for context.


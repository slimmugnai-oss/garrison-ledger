# 📋 CHANGELOG

All notable changes to Garrison Ledger will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.1] - 2025-01-15 - System Cleanup & Consistency

### 🧹 Cleanup
- **Deprecated Old Plan Endpoints**
  - Marked `/api/strategic-plan`, `/api/plan/ai-score`, `/api/plan/generate-roadmap` as deprecated
  - Added deprecation warnings with 30-day removal timeline
  - Created new `/api/plan/regenerate-ai` for AI Master Curator system
- **Updated User-Facing Text**
  - Changed "Strategic Plan" → "AI-Curated Plan" 
  - Changed "roadmap" → "personalized plan"
  - Updated all dashboard terminology for consistency
- **Organized Documentation**
  - Moved 30+ docs from root to `docs/` directory
  - Created `docs/active/`, `docs/archive/`, `docs/guides/`, `docs/planning/`
  - Root now has only 4 essential files

### 📚 Documentation
- Created `START_HERE.md` - Personal quick reference
- Created `docs/AUTOMATION_SUMMARY.md` - What AI does vs you
- Created `docs/DEVELOPMENT_WORKFLOW.md` - Standard process
- Created `docs/ORGANIZATION_SUMMARY.md` - Organization guide
- Created `docs/active/SYSTEM_CLEANUP_COMPLETE.md` - Cleanup audit
- Set up git commit template with doc reminders

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


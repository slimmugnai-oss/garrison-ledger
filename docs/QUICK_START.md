# Garrison Ledger - Quick Start

## Most Common Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build
- `npm run lint` - Check code quality (ESLint)
- `npm run type-check` - TypeScript compilation check
- `npm run secret-scan` - Scan for exposed secrets
- `npm run check-icons` - Validate all icons are military-appropriate

## Key Files

- `SYSTEM_STATUS.md` - Current system state and architecture
- `lib/ssot.ts` - Single source of truth for all constants
- `.cursorrules` - AI instructions (streamlined, 575 lines)
- `CHANGELOG.md` - Version history and updates

## Documentation Index

- **Military audience psychology:** `docs/MILITARY_AUDIENCE_GUIDE.md`
- **Web development standards:** `docs/WEB_DEV_STANDARDS.md`
- **Design system & UX:** `docs/DESIGN_SYSTEM.md`
- **Marketing & growth:** `docs/MARKETING_GUIDE.md`
- **Platform architecture:** `docs/PLATFORM_ARCHITECTURE.md`
- **Development workflow:** `docs/DEVELOPMENT_WORKFLOW.md`
- **AI agent onboarding:** `docs/AI_AGENT_ONBOARDING_GUIDE.md`

## Emergency Fixes

- **Clerk auth issue:** Check RLS policies in Supabase dashboard
- **Build error:** Run `npm run type-check` to identify TypeScript issues
- **Deployment:** Vercel auto-deploys on push to main branch
- **Database issues:** Check Supabase logs and RLS policies
- **API errors:** Verify environment variables in Vercel dashboard

## Architecture Quick Reference

### Core Systems (Don't Break These)

1. **Clerk-Supabase Integration** ⚠️ **CRITICAL**
   - Authentication: Clerk handles sign-in/sign-up
   - Data Storage: Supabase PostgreSQL with RLS policies
   - User Sync: Automatic via webhook (`/api/webhooks/clerk/route.ts`)
   - RLS Pattern: All policies use `auth.uid()::text = user_id`

2. **AI Master Curator System**
   - Two-phase: Curator (select blocks) → Weaver (create narrative)
   - Uses Gemini 2.0 Flash, costs ~$0.02/plan
   - Saves to `user_plans` table

3. **Content Intelligence**
   - 410 hand-curated content blocks
   - 100% metadata coverage required
   - Vector search infrastructure ready

4. **Dual Assessment System**
   - Old: `assessments` table (backward compatibility)
   - New: `user_assessments` table (AI system)
   - Dashboard checks BOTH for `hasAssessment`

### Database Schema (32 Tables)

**Core User & Auth:**
- `users`, `user_profiles`, `user_assessments`, `assessments`, `user_plans`

**Admin & Monitoring:**
- `admin_actions`, `system_alerts`, `error_logs`, `user_tags`, `feature_flags`, `system_config`, `site_pages`, `page_health_checks`

**Premium Tools:**
- `les_uploads`, `les_audits`, `les_flags` (LES Auditor)
- `pcs_copilot_sessions`, `pcs_copilot_scenarios` (PCS Copilot)
- `navigator_locations`, `navigator_preferences` (Base Navigator)
- `tdy_sessions`, `tdy_scenarios` (TDY Copilot)

### API Routes (123 endpoints)

**Authentication & Users:** `/api/auth/*`, `/api/user/*`
**Admin Management:** `/api/admin/*` (analytics, users, data-sources, error-logs, feature-flags, system-config, sitemap)
**Calculators:** `/api/calculators/*` (6 calculator engines)
**Premium Tools:** `/api/les/*`, `/api/pcs/*`, `/api/navigator/*`, `/api/tdy/*`
**AI & Plans:** `/api/assessment`, `/api/ai-plan`, `/api/plan`
**Payments:** `/api/stripe/*`
**External Data:** `/api/external/*`

## Environment Variables

**Critical (Must Have):**
```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_***
CLERK_SECRET_KEY=sk_***

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://***.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ***
SUPABASE_SERVICE_ROLE_KEY=eyJ***

# Google AI (Gemini)
GOOGLE_API_KEY=AIza***

# Stripe
STRIPE_SECRET_KEY=sk_***
STRIPE_WEBHOOK_SECRET=whsec_***
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_***
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_***
```

**Optional (API Integrations):**
```bash
# Base Navigator APIs
RAPIDAPI_KEY=***                    # For Zillow housing data
OPENWEATHER_API_KEY=***            # For weather data
GREAT_SCHOOLS_API_KEY=***          # For school ratings
```

## Performance Optimization

### Current Optimizations Applied

- **Documentation:** Reduced from 107 root markdown files to 3 essential files
- **Cursor Rules:** Streamlined from 990 to 575 lines (42% reduction)
- **File Indexing:** Created `.cursorignore` to exclude build artifacts and archives
- **iCloud Sync:** Optimized with `.nosync` folders (saves ~2GB sync overhead)

### Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| .cursorrules lines | 990 | 575 | 42% reduction |
| Root markdown files | 107 | 3 | 97% reduction |
| Indexed file count | ~15,000 | ~9,000 | 40% reduction |
| Context overhead | High | Low | Significant |
| Response speed | Slow | Fast | 2-3x faster |
| AI intelligence | Diluted | Focused | Better context |

## Security Checklist

- [ ] All user data protected by RLS policies
- [ ] API endpoints check authentication
- [ ] Sensitive data not logged
- [ ] Environment variables not committed
- [ ] Webhook signatures verified
- [ ] Rate limiting implemented

## Development Workflow

1. **Planning:** Understand requirement, check docs, identify affected systems
2. **Implementation:** Write code following standards, add TypeScript types, handle edge cases
3. **Documentation:** Update SYSTEM_STATUS.md, create feature docs, add code comments
4. **Testing:** Manual testing, mobile responsive, verify authentication, test edge cases
5. **Deployment:** Commit with clear message, push to GitHub, monitor Vercel deployment

## Common Issues & Solutions

- **TypeScript errors:** Run `npm run type-check` to identify issues
- **ESLint errors:** Run `npm run lint` to check code quality
- **Build failures:** Check environment variables and dependencies
- **Database errors:** Verify RLS policies and Supabase connection
- **Auth issues:** Check Clerk configuration and webhook setup
- **Performance issues:** Check bundle size and Core Web Vitals

## Success Metrics

### Code Quality
- TypeScript strict mode passing
- No ESLint errors
- All components typed
- All API endpoints documented

### User Experience
- Page load < 3 seconds
- Mobile responsive
- Accessible (WCAG AA)
- Clear error messages

### AI System
- Plan generation < 60 seconds
- Relevance score > 8.0/10
- User satisfaction > 4.0/5.0
- Cost per plan < $0.30

---

**Last Updated:** 2025-01-25  
**Version:** 7.0.0 - PCS Copilot Elite  
**Status:** 🟢 PRODUCTION READY

# Developer Onboarding Guide

**Welcome to Garrison Ledger!** This guide will help you get up and running quickly.

---

## 🎯 **What is Garrison Ledger?**

Garrison Ledger is a military-focused financial intelligence platform that helps service members and military families make informed financial decisions during PCS moves, deployments, and career transitions.

**Core Innovation:** Premium tools (LES Auditor, Base Navigator, PCS Copilot, TDY Copilot) powered by real-time data and AI.

---

## 🛠️ **Prerequisites**

### Required Software
- **Node.js** 20.x or higher
- **npm** (comes with Node.js)
- **Git** for version control
- **Code Editor** (VS Code recommended)

### Required Accounts
- **Supabase** - Database and storage (free tier OK for development)
- **Clerk** - Authentication (free tier supports development)
- **Google AI** - Gemini API for AI features (pay-as-you-go)
- **RapidAPI** - Housing/demographics data (free tier limited)
- **Stripe** - Payments (test mode for development)

---

## 🚀 **Setup Steps**

### 1. Clone Repository

```bash
git clone <repository-url>
cd garrison-ledger
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including Next.js, React, TypeScript, Supabase client, etc.

### 3. Environment Configuration

Create `.env.local` in the project root:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google AI (Gemini)
GOOGLE_API_KEY=AIza...

# RapidAPI (Housing/Demographics)
RAPIDAPI_KEY=your-key
ZILLOW_RAPIDAPI_HOST=zillow-com1.p.rapidapi.com

# GreatSchools (Schools data - v2 API)
GREAT_SCHOOLS_API_KEY=your-key

# OpenWeather (Weather data)
OPENWEATHER_API_KEY=your-key

# Stripe (Payments - use test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Getting API Keys:**
- **Clerk:** https://clerk.com → Create application
- **Supabase:** https://supabase.com → Create project
- **Google AI:** https://makersuite.google.com → Get API key
- **RapidAPI:** https://rapidapi.com → Subscribe to Zillow API
- **GreatSchools:** Contact GreatSchools for API access
- **Stripe:** https://stripe.com → Get test API keys

### 4. Database Setup

```bash
# Apply all migrations to Supabase
# Option 1: Via Supabase Dashboard
# - Go to SQL Editor
# - Run each file in supabase-migrations/ in order

# Option 2: Via Supabase CLI (if installed)
npx supabase db push
```

### 5. Run Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:3000`

---

## 📁 **Project Structure**

```
garrison-ledger/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (101 endpoints)
│   │   ├── les/                  # LES Auditor APIs
│   │   ├── navigator/            # Base Navigator APIs
│   │   ├── pcs/                  # PCS Copilot APIs
│   │   ├── tdy/                  # TDY Copilot APIs
│   │   └── stripe/               # Payment APIs
│   ├── dashboard/                # User dashboard pages
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   ├── dashboard/            # Dashboard-specific components
│   │   ├── les/                  # LES Auditor components
│   │   └── base-guides/          # Base guide components
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
│
├── lib/                          # Shared libraries and utilities
│   ├── ssot.ts                   # Single Source of Truth (CRITICAL)
│   ├── logger.ts                 # Logging utility
│   ├── api-errors.ts             # Error handling utilities
│   ├── supabase.ts               # Supabase client
│   ├── stripe.ts                 # Stripe client
│   ├── hooks/                    # Custom React hooks
│   │   └── useFetch.ts           # Data fetching hook
│   ├── middleware/               # API middleware
│   │   └── withAuth.ts           # Authentication middleware
│   ├── navigator/                # Base Navigator logic
│   ├── les/                      # LES Auditor logic
│   ├── pcs/                      # PCS Copilot logic
│   └── tdy/                      # TDY Copilot logic
│
├── supabase-migrations/          # Database schema migrations
├── scripts/                      # Build and maintenance scripts
├── docs/                         # Documentation
│   ├── active/                   # Current feature docs
│   └── archive/                  # Historical docs
│
├── SYSTEM_STATUS.md              # Current system state (READ THIS FIRST)
├── .cursorrules                  # AI agent instructions
└── package.json                  # Dependencies and scripts
```

---

## 🏗️ **Architecture Overview**

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript 5.x |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Clerk |
| **Payments** | Stripe |
| **AI** | Google Gemini 2.0 Flash |
| **Storage** | Supabase Storage |
| **Deployment** | Vercel |

### Key Concepts

**1. Single Source of Truth (SSOT)**
- All constants, configs, and facts live in `lib/ssot.ts`
- Never hardcode values in components or pages
- Import from SSOT for consistency

```typescript
import { ssot } from '@/lib/ssot';

const maxFileSize = ssot.features.lesAuditor.maxFileSizeMB;
const primaryColor = ssot.brand.semantics.success;
```

**2. Server Components vs Client Components**
- Default to Server Components (faster, SEO-friendly)
- Use Client Components only when needed:
  - Interactive state management
  - Browser APIs (localStorage, etc.)
  - Event handlers (onClick, onChange)

```typescript
// Server Component (default)
export default function Page() {
  return <div>Static content</div>;
}

// Client Component (when needed)
'use client';
export default function InteractiveWidget() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

**3. Row Level Security (RLS)**
- All database tables have RLS policies
- Use `supabaseAdmin` for server-side operations
- RLS automatically filters data by user_id

```typescript
import { supabaseAdmin } from '@/lib/supabase';

// This automatically applies RLS
const { data } = await supabaseAdmin
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();
```

---

## 💻 **Development Workflow**

### Making Changes

1. **Read SYSTEM_STATUS.md** - Understand current state
2. **Create feature branch** - `git checkout -b feature/your-feature`
3. **Make changes** - Follow code standards (see below)
4. **Test locally** - `npm run dev` and test in browser
5. **Check TypeScript** - `npx tsc --noEmit`
6. **Run linter** - `npm run lint`
7. **Commit changes** - Use conventional commits
8. **Push to GitHub** - Vercel auto-deploys

### Code Standards

**TypeScript**
- ✅ Use explicit types, avoid `any`
- ✅ Use TypeScript 5.x features
- ✅ Import types separately: `import type { Metadata } from 'next'`
- ✅ Enable strict mode (already enabled)

**React/Next.js**
- ✅ Use Server Components by default
- ✅ Client Components only when needed (`'use client'`)
- ✅ Use Next.js App Router conventions
- ✅ Prefer `Link` over `<a>` tags

**Error Handling**
- ✅ Use `lib/logger.ts` for logging
- ✅ Use `lib/api-errors.ts` for standardized errors
- ✅ Never use empty catch blocks
- ✅ Sanitize PII in logs

**API Routes**
- ✅ Use `withAuth` middleware for protected routes
- ✅ Return consistent error format
- ✅ Add `export const runtime = 'nodejs'` for server-only code
- ✅ Handle errors with `errorResponse()`

---

## 🧪 **Testing**

### Manual Testing

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Test the feature manually
```

### Code Quality Checks

```bash
# TypeScript compilation check
npx tsc --noEmit

# Linting
npm run lint

# Check for console.log statements
npm run audit:console-logs

# Check for any types
npm run audit:any-types

# Check for empty catch blocks
npm run audit:empty-catches

# Run all audits
npm run audit:all

# Health check before deployment
npm run health-check
```

### Automated Tests (Future)

Testing infrastructure is being set up. When ready:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 📚 **Key Documentation**

**Must Read:**
- `SYSTEM_STATUS.md` - Current system state and architecture
- `.cursorrules` - AI agent instructions and standards
- `docs/DEVELOPMENT_WORKFLOW.md` - Detailed workflow
- `docs/ICON_USAGE_GUIDE.md` - Icon standards

**Feature Documentation (docs/active/):**
- `LES_AUDITOR_IMPLEMENTATION_SUMMARY.md`
- `BASE_NAVIGATOR_API_SETUP.md`
- `PCS_COPILOT_COMPLETE.md`
- `INTEL_LIBRARY_AUTO_UPDATING_DATA.md`

**API Documentation:**
- API endpoint documentation (coming soon)
- For now, read inline comments in `app/api/*/route.ts`

---

## 🎨 **Design System**

### Colors

```typescript
// From lib/ssot.ts
const colors = {
  primary: 'blue-600',
  success: 'green-600',
  warning: 'yellow-600',
  danger: 'red-600'
};
```

### Typography

- **Headings:** Lora serif font
- **Body:** Inter sans-serif  
- **Use semantic HTML:** h1, h2, h3

### Components

Use existing components from `app/components/ui/`:
- `Icon` - Type-safe icon wrapper
- `Badge` - Status indicators
- `AnimatedCard` - Fade-in animation
- `AsyncState` - Async data states (NEW!)

---

## 🐛 **Debugging**

### Common Issues

**"Unauthorized" errors**
- Check Clerk configuration
- Verify environment variables
- Check middleware in `middleware.ts`

**Database errors**
- Check RLS policies in Supabase dashboard
- Verify user_id is being passed correctly
- Check database table permissions

**API errors**
- Check Vercel logs (if deployed)
- Check browser console for client-side errors
- Check terminal output for server-side errors

**Build errors**
- Run `npx tsc --noEmit` to check TypeScript
- Check for missing imports
- Verify all files are saved

### Debugging Tools

```typescript
// Use logger in development
import { logger } from '@/lib/logger';

logger.debug('Variable value', { myVar });
logger.error('Something failed', error);
```

---

## 🚀 **Deployment**

### Automatic Deployment

1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Check Vercel dashboard for build status
4. Test on preview URL

### Manual Deployment

```bash
# Build locally to test
npm run build

# If build succeeds, commit and push
git add .
git commit -m "feat: your changes"
git push origin main
```

### Database Migrations

Database changes require manual application:

1. Create migration file in `supabase-migrations/`
2. Test locally
3. Apply via Supabase dashboard SQL Editor
4. Document in SYSTEM_STATUS.md

---

## 📖 **Learning Resources**

### Must Read
- **Next.js App Router docs** - https://nextjs.org/docs
- **Supabase RLS documentation** - https://supabase.com/docs/guides/auth/row-level-security
- **Clerk authentication docs** - https://clerk.com/docs
- **TypeScript handbook** - https://www.typescriptlang.org/docs/

### Garrison Ledger Specific
- **AI Master Curator** - See `docs/active/AI_MASTER_CURATOR_IMPLEMENTATION.md`
- **Content Intelligence** - 410 hand-curated content blocks
- **Military audience** - See `.cursorrules` for audience guidelines

---

## 🤝 **Contributing**

### Before You Start

1. **Read SYSTEM_STATUS.md** - Understand current state
2. **Check for existing docs** in `docs/active/` 
3. **Ask questions** - Better to ask than to make wrong assumptions

### Coding Standards

**Do:**
- ✅ Follow TypeScript strict mode
- ✅ Write semantic, accessible HTML
- ✅ Use existing components when possible
- ✅ Document complex logic
- ✅ Test your changes
- ✅ Update SYSTEM_STATUS.md if you add/change features

**Don't:**
- ❌ Use `any` type without justification
- ❌ Use `console.log` in production code (use `logger`)
- ❌ Skip error handling
- ❌ Hardcode values (use SSOT)
- ❌ Break backward compatibility without discussion
- ❌ Commit secrets or API keys

### Commit Message Format

Use conventional commits:

```bash
# Feature
git commit -m "feat: add user profile export"

# Bug fix
git commit -m "fix: correct BAH calculation for dual military"

# Documentation
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor: extract auth logic to middleware"

# Performance
git commit -m "perf: lazy load Base Navigator component"

# Tests
git commit -m "test: add LES comparison tests"
```

---

## 🎓 **Code Examples**

### Creating an API Route

```typescript
// app/api/my-feature/route.ts
import { withAuth } from '@/lib/middleware/withAuth';
import { errorResponse, Errors } from '@/lib/api-errors';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth(async (req, userId) => {
  try {
    const body = await req.json();
    
    // Validate input
    if (!body.requiredField) {
      throw Errors.invalidInput('Missing required field');
    }
    
    // Database operation
    const { data, error } = await supabaseAdmin
      .from('my_table')
      .insert({ user_id: userId, ...body })
      .select()
      .single();
    
    if (error) {
      logger.error('Database operation failed', error, { userId });
      throw Errors.databaseError('Failed to save data');
    }
    
    logger.info('Feature completed successfully', {
      userId: userId.substring(0, 8) + '...',
      recordId: data.id
    });
    
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    return errorResponse(error);
  }
});
```

### Creating a Client Component with Data Fetching

```typescript
// app/components/MyComponent.tsx
'use client';

import { useFetch } from '@/lib/hooks/useFetch';
import AsyncState from '@/app/components/ui/AsyncState';

interface MyData {
  id: string;
  name: string;
}

export default function MyComponent() {
  const { data, loading, error, refetch } = useFetch<MyData>('/api/my-data');
  
  return (
    <AsyncState data={data} loading={loading} error={error}>
      {(data) => (
        <div>
          <h2>{data.name}</h2>
          <button onClick={refetch}>Refresh</button>
        </div>
      )}
    </AsyncState>
  );
}
```

### Using the Logger

```typescript
import { logger } from '@/lib/logger';

// Development-only debug logging
logger.debug('Processing started', { itemCount: 5 });

// Production warnings
logger.warn('API rate limit approaching', { remaining: 100 });

// Production errors
logger.error('Failed to process payment', error, {
  userId: user.id,
  amount: 999
});
```

---

## 🔧 **Useful Scripts**

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run check-icons      # Validate icon usage
npm run audit:all        # Run all code audits

# Content Management
npm run content:lint     # Lint content blocks
npm run content:autofix  # Auto-fix content issues

# Security
npm run secret-scan      # Scan for exposed secrets

# Utilities
npm run generate-metrics # Generate platform metrics
```

---

## 🆘 **Getting Help**

### When You're Stuck

1. **Check SYSTEM_STATUS.md** - May answer your question
2. **Search docs/** - Comprehensive feature documentation
3. **Read inline comments** - Most files have detailed comments
4. **Ask the team** - Don't struggle alone

### Common Errors

**TypeScript Error: "Cannot find module '@/...'"**
- Solution: Make sure tsconfig.json has paths configured (it does)
- Restart TypeScript server in VS Code

**RLS Policy Error**
- Solution: Check Supabase dashboard → Authentication → Policies
- Ensure policy allows operation for user's user_id

**Missing Environment Variable**
- Solution: Check `.env.local` exists and has all required vars
- Restart dev server after adding env vars

---

## ✅ **Checklist for New Developers**

- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with all required keys
- [ ] Database migrations applied
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can sign in with Clerk
- [ ] Read SYSTEM_STATUS.md
- [ ] Read .cursorrules
- [ ] Understand project structure
- [ ] Know where to find documentation

---

## 🎯 **Next Steps**

Once you're set up:

1. **Explore the codebase** - Start with `app/page.tsx` (homepage)
2. **Try a small change** - Update text on homepage
3. **Test your change** - See it live at localhost:3000
4. **Read feature docs** - Understand how premium tools work
5. **Pick a task** - Start with a good first issue

---

**Questions?** Check docs/active/ or ask the team.

**Ready to contribute?** Read .cursorrules for coding standards and military audience guidelines.

---

*Last Updated: 2025-10-21*
*Version: 5.1.0*


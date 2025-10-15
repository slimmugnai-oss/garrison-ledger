# 🔧 DEVELOPMENT WORKFLOW

This document outlines the standard workflow for developing features and fixes for Garrison Ledger.

---

## 📋 BEFORE YOU START

### 1. **Read Current State**
```bash
# Always start by reading these files
cat SYSTEM_STATUS.md          # Current system state
cat .cursorrules               # AI agent guidelines
cat CHANGELOG.md               # Recent changes
```

### 2. **Understand the Context**
- What problem are you solving?
- What systems are affected?
- Are there any dependencies?
- What's the expected outcome?

### 3. **Check Existing Documentation**
```bash
ls docs/active/                # Current feature docs
ls docs/guides/                # How-to guides
ls docs/archive/               # Historical context
```

---

## 🎯 FEATURE DEVELOPMENT WORKFLOW

### Phase 1: Planning (15-30 min)

1. **Create TODO List**
   ```typescript
   todo_write({
     merge: false,
     todos: [
       { id: "1", content: "Task 1", status: "in_progress" },
       { id: "2", content: "Task 2", status: "pending" },
       // ...
     ]
   });
   ```

2. **Identify Affected Systems**
   - Database schema changes?
   - API endpoints needed?
   - UI components affected?
   - Authentication/authorization?
   - Third-party integrations?

3. **Design Approach**
   - Sketch data flow
   - Identify reusable components
   - Plan database migrations
   - Consider edge cases

4. **Estimate Complexity**
   - Simple: < 2 hours
   - Medium: 2-8 hours
   - Complex: 8+ hours

---

### Phase 2: Implementation (varies)

#### **A. Database Changes**

1. **Create Migration File**
   ```bash
   # Name format: YYYYMMDDHHMMSS_description.sql
   touch supabase-migrations/$(date +%Y%m%d%H%M%S)_add_feature.sql
   ```

2. **Write Migration**
   ```sql
   -- Add new table
   CREATE TABLE IF NOT EXISTS feature_data (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id TEXT NOT NULL,
     data JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Add RLS policies
   ALTER TABLE feature_data ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users manage own data" ON feature_data
     FOR ALL
     USING (auth.uid()::text = user_id)
     WITH CHECK (auth.uid()::text = user_id);
   
   -- Add indexes
   CREATE INDEX IF NOT EXISTS idx_feature_data_user_id ON feature_data(user_id);
   
   -- Add comments
   COMMENT ON TABLE feature_data IS 'Description of what this table does';
   ```

3. **Test Migration**
   ```bash
   # Apply to local Supabase (if running)
   supabase db push
   
   # Or apply via Supabase dashboard
   # Copy SQL and run in SQL Editor
   ```

4. **Document Schema Changes**
   Update `SYSTEM_STATUS.md` database section

---

#### **B. API Endpoints**

1. **Create Route File**
   ```bash
   mkdir -p app/api/feature
   touch app/api/feature/route.ts
   ```

2. **Implement Endpoint**
   ```typescript
   import { NextRequest, NextResponse } from "next/server";
   import { auth } from "@clerk/nextjs/server";
   import { supabaseAdmin } from '@/lib/supabase';
   
   export const runtime = "nodejs";
   
   export async function GET(req: NextRequest) {
     // 1. Authenticate
     const { userId } = await auth();
     if (!userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }
     
     // 2. Parse request
     const { searchParams } = new URL(req.url);
     const param = searchParams.get('param');
     
     // 3. Validate input
     if (!param) {
       return NextResponse.json({ error: "Missing param" }, { status: 400 });
     }
     
     // 4. Query database
     const { data, error } = await supabaseAdmin
       .from('feature_data')
       .select('*')
       .eq('user_id', userId)
       .maybeSingle();
     
     if (error) {
       console.error('[Feature] Error:', error);
       return NextResponse.json({ error: "Database error" }, { status: 500 });
     }
     
     // 5. Return response
     return NextResponse.json({ data });
   }
   
   export async function POST(req: NextRequest) {
     const { userId } = await auth();
     if (!userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }
     
     try {
       const body = await req.json();
       
       // Validate and process...
       
       return NextResponse.json({ success: true });
     } catch (error) {
       console.error('[Feature] Error:', error);
       return NextResponse.json({ error: "Failed" }, { status: 500 });
     }
   }
   ```

3. **Test Endpoint**
   ```bash
   # Use curl or Postman
   curl -X GET http://localhost:3000/api/feature?param=test
   ```

---

#### **C. UI Components**

1. **Server vs Client Components**
   ```typescript
   // Server Component (default) - for data fetching
   export default async function FeaturePage() {
     const { userId } = await auth();
     const data = await loadData(userId);
     
     return <FeatureClient initialData={data} />;
   }
   
   // Client Component - for interactivity
   'use client';
   export default function FeatureClient({ initialData }) {
     const [data, setData] = useState(initialData);
     // ... interactive logic
   }
   ```

2. **Use Existing Components**
   ```typescript
   import Header from '@/app/components/Header';
   import Footer from '@/app/components/Footer';
   import AnimatedCard from '@/app/components/ui/AnimatedCard';
   import Badge from '@/app/components/ui/Badge';
   import { Icon } from '@/app/components/ui/icon-registry';
   ```

3. **Follow Design System**
   ```typescript
   // Colors
   className="bg-blue-600 text-white"        // Primary
   className="bg-green-600 text-white"       // Success
   className="text-gray-900"                 // Heading
   className="text-gray-700"                 // Body
   
   // Typography
   className="font-serif text-4xl font-bold" // Heading
   className="text-lg text-gray-700"         // Body
   
   // Spacing
   className="px-4 py-2"                     // Button
   className="space-y-4"                     // Stack
   className="gap-4"                         // Grid
   ```

---

### Phase 3: Testing (30-60 min)

#### **Manual Testing Checklist**

- [ ] **Functionality**
  - Feature works as expected
  - Edge cases handled
  - Error states display correctly
  - Loading states show

- [ ] **Authentication**
  - Protected routes work
  - Unauthorized access blocked
  - User-specific data isolated

- [ ] **Responsive Design**
  - Mobile (320px+)
  - Tablet (768px+)
  - Desktop (1024px+)

- [ ] **Performance**
  - Page load < 3 seconds
  - No console errors
  - No console warnings (in production mode)

- [ ] **Accessibility**
  - Keyboard navigation works
  - Screen reader friendly
  - Color contrast sufficient

---

### Phase 4: Documentation (15-30 min)

1. **Update SYSTEM_STATUS.md**
   ```markdown
   ### **Feature Name** ⭐ NEW
   **Purpose:** What it does
   
   **Components:**
   - API endpoints
   - Database tables
   - UI pages
   
   **Status:** ✅ Live, Working
   ```

2. **Create Feature Documentation**
   ```bash
   touch docs/active/FEATURE_NAME.md
   ```
   
   Use template:
   ```markdown
   # Feature Name
   
   ## Purpose
   Why this exists
   
   ## Implementation
   How it works
   
   ## Usage
   How to use it
   
   ## API Endpoints
   - `GET /api/feature` - Description
   - `POST /api/feature` - Description
   
   ## Database Schema
   ```sql
   -- Tables and relationships
   ```
   
   ## UI Components
   - `/dashboard/feature` - Page description
   
   ## Testing
   How to verify it works
   ```

3. **Update CHANGELOG.md**
   ```markdown
   ## [X.Y.Z] - YYYY-MM-DD
   
   ### 🚀 Added
   - **Feature Name** - Description
     - Detail 1
     - Detail 2
   ```

4. **Add Code Comments**
   ```typescript
   /**
    * Feature Name
    * 
    * Purpose: What this does
    * 
    * @param userId - User identifier
    * @returns Promise with result
    * 
    * @example
    * const result = await featureFunction(userId);
    */
   ```

---

### Phase 5: Deployment (15-30 min)

1. **Run Linter**
   ```bash
   npm run lint
   ```
   
   Fix any errors before committing.

2. **Commit Changes**
   ```bash
   git add -A
   git commit -m "✨ Add Feature Name
   
   🚀 Added:
   - Feature component 1
   - Feature component 2
   
   🔧 Changed:
   - Updated X to support Y
   
   📚 Documentation:
   - Created FEATURE_NAME.md
   - Updated SYSTEM_STATUS.md
   - Updated CHANGELOG.md"
   ```

3. **Push to GitHub**
   ```bash
   git push origin main
   ```

4. **Monitor Deployment**
   - Check Vercel dashboard
   - Verify build succeeds
   - Test in production

5. **Apply Database Migration** (if needed)
   - Go to Supabase dashboard
   - SQL Editor
   - Run migration SQL
   - Verify success

6. **Update TODO List**
   ```typescript
   todo_write({
     merge: true,
     todos: [
       { id: "1", status: "completed" },
       // ...
     ]
   });
   ```

---

## 🐛 BUG FIX WORKFLOW

### 1. **Reproduce Bug**
- Get exact steps to reproduce
- Identify affected users
- Determine severity

### 2. **Diagnose**
- Check Vercel logs
- Check Supabase logs
- Check browser console
- Review recent changes

### 3. **Fix**
- Create minimal fix
- Test thoroughly
- Add regression test if possible

### 4. **Deploy**
```bash
git commit -m "🐛 Fix: Description of bug

- Root cause
- Solution
- Testing performed"
```

### 5. **Verify**
- Test in production
- Confirm with affected users
- Update documentation if needed

---

## 🔄 REFACTORING WORKFLOW

### 1. **Plan Refactor**
- Identify code smell
- Plan new structure
- Ensure no breaking changes

### 2. **Implement**
- Refactor incrementally
- Test after each change
- Keep commits small

### 3. **Deploy**
```bash
git commit -m "♻️ Refactor: Component/feature name

- Improved readability
- Better performance
- Reduced duplication"
```

---

## 📊 PERFORMANCE OPTIMIZATION

### 1. **Measure**
- Use Lighthouse
- Check Vercel Analytics
- Monitor database query times

### 2. **Optimize**
- Database indexes
- Query optimization
- Image optimization
- Code splitting
- Caching

### 3. **Verify**
- Measure again
- Ensure no regression
- Document improvements

---

## 🔒 SECURITY REVIEW

### Before Every Deploy

- [ ] RLS policies on all user tables
- [ ] API endpoints check authentication
- [ ] No sensitive data in logs
- [ ] Environment variables not committed
- [ ] Webhook signatures verified
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints

---

## 🎯 QUALITY CHECKLIST

### Code Quality
- [ ] TypeScript types are explicit
- [ ] No `any` types without good reason
- [ ] ESLint passes with no errors
- [ ] Code is DRY (Don't Repeat Yourself)
- [ ] Functions are small and focused
- [ ] Variables have descriptive names

### Documentation
- [ ] SYSTEM_STATUS.md updated
- [ ] Feature documentation created
- [ ] CHANGELOG.md updated
- [ ] Code comments added
- [ ] API endpoints documented

### Testing
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] Mobile responsive
- [ ] Authentication works
- [ ] Error states display

### Deployment
- [ ] Linter passes
- [ ] Build succeeds
- [ ] Production tested
- [ ] Database migration applied
- [ ] TODO list updated

---

## 🚨 EMERGENCY HOTFIX

### When Production is Broken

1. **Assess Impact**
   - How many users affected?
   - Is data at risk?
   - Can it wait?

2. **Quick Fix**
   - Make minimal change
   - Test locally
   - Push immediately

3. **Monitor**
   - Watch error rates
   - Check user reports
   - Verify fix works

4. **Follow Up**
   - Proper fix if needed
   - Add tests
   - Document incident

---

## 📞 GETTING HELP

### When Stuck

1. **Check Documentation**
   - `SYSTEM_STATUS.md`
   - `docs/active/`
   - `.cursorrules`

2. **Check Logs**
   - Vercel dashboard
   - Supabase logs
   - Browser console

3. **Search Issues**
   - Next.js docs
   - Supabase docs
   - Stack Overflow

4. **Ask User**
   - Business logic questions
   - Feature priorities
   - Breaking changes

---

## 🎓 BEST PRACTICES

### Do
- ✅ Read SYSTEM_STATUS.md first
- ✅ Create TODO lists for complex tasks
- ✅ Test thoroughly before deploying
- ✅ Document all changes
- ✅ Use TypeScript types
- ✅ Follow design system
- ✅ Keep commits atomic
- ✅ Update CHANGELOG.md

### Don't
- ❌ Skip testing
- ❌ Commit without linting
- ❌ Break backward compatibility
- ❌ Ignore TypeScript errors
- ❌ Forget to update documentation
- ❌ Deploy without verification
- ❌ Use `any` types unnecessarily
- ❌ Create duplicate files

---

**Remember:** This workflow evolves. Suggest improvements as you find better ways to work.


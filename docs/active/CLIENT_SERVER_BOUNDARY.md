# Client-Server Boundary Rules (CRITICAL)

**Created:** October 27, 2025  
**After:** Production incident - PCS Copilot page breakage  
**Commit:** `c0bc939` (fix) / `deca908` (bug introduced)

---

## 🚨 THE INCIDENT

**Symptom:** "supabaseKey is required" error, PCS Copilot page showing "Something went wrong"

**Root Cause:** Client component directly imported server-side function using `supabaseAdmin`

**Impact:** Production breakage, PCS Copilot completely broken for all users

---

## ❌ WHAT WENT WRONG

**File:** `app/components/pcs/PCSUnifiedWizard.tsx` (client component with `"use client"`)

**Bad Code:**
```typescript
import {
  calculatePPMWithholding,  // ❌ WRONG! This uses supabaseAdmin
  type PPMWithholdingResult,
} from "@/lib/pcs/ppm-withholding-calculator";

// Later in component:
const result = await calculatePPMWithholding({ ... }); // ❌ Breaks on client!
```

**Why it broke:**
1. `calculatePPMWithholding()` uses `supabaseAdmin` internally
2. `supabaseAdmin` requires `SUPABASE_SERVICE_ROLE_KEY` (server env var)
3. Client components run in browser (no access to server env vars)
4. Result: "supabaseKey is required" error

---

## ✅ THE FIX

### Step 1: Create Server-Side API Route

**File:** `app/api/pcs/calculate-ppm-withholding/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  calculatePPMWithholding,
  type PPMWithholdingInput,
} from "@/lib/pcs/ppm-withholding-calculator";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: PPMWithholdingInput = await req.json();
  
  // ✅ Runs server-side, has access to SUPABASE_SERVICE_ROLE_KEY
  const result = await calculatePPMWithholding(body);
  
  return NextResponse.json(result);
}
```

### Step 2: Update Client to Use Type-Only Import

**File:** `app/components/pcs/PCSUnifiedWizard.tsx`

```typescript
// ✅ Type-only import (no runtime code bundled)
import type { PPMWithholdingResult } from "@/lib/pcs/ppm-withholding-calculator";

// ✅ Call API instead of direct function
const response = await fetch("/api/pcs/calculate-ppm-withholding", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    gccAmount: 8500,
    mode: "official",
    allowedExpenses: { ... },
    destinationState: "NC",
  }),
});

const result: PPMWithholdingResult = await response.json();
```

---

## 📋 THE RULES

### Rule 1: Know Your Component Type

**Server Component (default):**
```typescript
// No "use client" directive
export default async function MyPage() {
  // ✅ Can use supabaseAdmin, auth(), etc.
  const { userId } = await auth();
  const data = await supabaseAdmin.from(...).select();
  return <div>{data}</div>;
}
```

**Client Component:**
```typescript
"use client"; // ⚠️ Runs in browser

export default function MyComponent() {
  // ❌ CANNOT use supabaseAdmin, auth()
  // ✅ CAN use useState, useEffect, onClick, etc.
  // ✅ CAN call API routes via fetch
}
```

### Rule 2: Server-Only Code Must Stay Server-Side

**Server-Only Code Includes:**
- `supabaseAdmin` (from `@/lib/supabase/admin`)
- `auth()` from Clerk (server-side auth)
- Direct database queries
- API keys/secrets
- File system operations

**Solution:** Put server-only code in:
- Server Components (no `"use client"`)
- API routes (`app/api/**/route.ts`)
- Server Actions (`"use server"`)

### Rule 3: Use Type-Only Imports in Client Components

**Wrong:**
```typescript
"use client";
import { serverFunction } from "@/lib/server-code"; // ❌ Bundles entire module!
```

**Right:**
```typescript
"use client";
import type { ResultType } from "@/lib/server-code"; // ✅ Types only, no runtime code
```

### Rule 4: Client Components Call APIs, Not Server Functions

**Wrong:**
```typescript
"use client";
const result = await serverFunction({ ... }); // ❌ Will fail!
```

**Right:**
```typescript
"use client";
const response = await fetch("/api/my-endpoint", {
  method: "POST",
  body: JSON.stringify({ ... }),
});
const result = await response.json(); // ✅ Works!
```

---

## 🔍 HOW TO DETECT THIS ISSUE

### Build-Time Detection

**Warning Signs:**
- "Module not found" errors for server-only packages
- "Cannot use ... in client component" errors
- Environment variable undefined errors

**Prevention:**
```bash
npm run type-check  # Should catch some issues
npm run build       # Will catch client/server boundary violations
```

### Runtime Detection

**Symptoms:**
- "supabaseKey is required" error
- "auth() is not a function" error
- Environment variables showing as `undefined`
- Network requests failing with 401/500

**Fix Immediately:**
1. Identify the client component causing the issue
2. Move server-only code to API route
3. Update client to call API
4. Deploy fix

---

## ✅ CHECKLIST: Before Using Server Code

Before using ANY function in a client component, ask:

- [ ] Does it use `supabaseAdmin`?
- [ ] Does it use `auth()` from Clerk?
- [ ] Does it access environment variables?
- [ ] Does it make direct database queries?
- [ ] Does it use Node.js APIs (fs, path, etc.)?

**If ANY answer is YES:** Create an API route, don't call it directly from client!

---

## 📚 EXAMPLES

### Example 1: Database Query

**Wrong:**
```typescript
"use client";
import { supabaseAdmin } from "@/lib/supabase/admin";

function MyComponent() {
  const fetchData = async () => {
    const { data } = await supabaseAdmin.from("users").select(); // ❌ BREAKS!
    return data;
  };
}
```

**Right:**
```typescript
// app/api/users/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data } = await supabaseAdmin.from("users").select(); // ✅ Server-side
  return NextResponse.json(data);
}

// app/components/MyComponent.tsx
"use client";
function MyComponent() {
  const fetchData = async () => {
    const response = await fetch("/api/users"); // ✅ Client calls API
    return response.json();
  };
}
```

### Example 2: Authentication

**Wrong:**
```typescript
"use client";
import { auth } from "@clerk/nextjs/server";

function MyComponent() {
  const { userId } = await auth(); // ❌ BREAKS! auth() is server-only
}
```

**Right:**
```typescript
// app/api/me/route.ts
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth(); // ✅ Server-side
  return NextResponse.json({ userId });
}

// app/components/MyComponent.tsx
"use client";
import { useUser } from "@clerk/nextjs"; // ✅ Client-side hook

function MyComponent() {
  const { user } = useUser(); // ✅ Works on client
}
```

### Example 3: Our PPM Withholding Fix

**Before (Broken):**
```typescript
"use client";
import { calculatePPMWithholding } from "@/lib/pcs/ppm-withholding-calculator";

const result = await calculatePPMWithholding({ ... }); // ❌ PRODUCTION BREAKAGE!
```

**After (Fixed):**
```typescript
"use client";
import type { PPMWithholdingResult } from "@/lib/pcs/ppm-withholding-calculator";

const response = await fetch("/api/pcs/calculate-ppm-withholding", {
  method: "POST",
  body: JSON.stringify({ gccAmount: 8500, ... }),
});
const result: PPMWithholdingResult = await response.json(); // ✅ Works!
```

---

## 🎯 QUICK REFERENCE

| Code Type | Server Component | Client Component | API Route |
|-----------|------------------|------------------|-----------|
| `supabaseAdmin` | ✅ | ❌ | ✅ |
| `auth()` (Clerk) | ✅ | ❌ | ✅ |
| `useState` | ❌ | ✅ | ❌ |
| `useEffect` | ❌ | ✅ | ❌ |
| `onClick` | ❌ | ✅ | ❌ |
| `fetch()` | ✅ | ✅ | ✅ |
| Env vars (server) | ✅ | ❌ | ✅ |
| Env vars (public) | ✅ | ✅ | ✅ |

---

## 🚀 DEPLOYMENT SAFETY

### Pre-Deployment Checklist

Before deploying code with new client components:

- [ ] Run `npm run type-check` (0 errors)
- [ ] Run `npm run build` locally (succeeds)
- [ ] Test the page in development
- [ ] Check browser console for errors
- [ ] Verify no "supabaseKey" or "auth()" errors

### Post-Deployment Monitoring

- [ ] Check Vercel build logs for errors
- [ ] Test the live page immediately
- [ ] Monitor error logs for 5 minutes
- [ ] Have rollback plan ready (previous commit)

---

## 📖 FURTHER READING

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Clerk Auth in Next.js](https://clerk.com/docs/references/nextjs/overview)
- [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

**Remember: When in doubt, create an API route. It's safer than debugging production breakage at midnight.** 🎖️

**Last Updated:** October 27, 2025  
**Incident Fix:** Commit `c0bc939`


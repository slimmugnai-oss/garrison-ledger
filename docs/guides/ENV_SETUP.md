# 🔐 ENVIRONMENT VARIABLES - COMPLETE GUIDE

**All environment variables required for Garrison Ledger**

---

## ✅ **REQUIRED - Application Won't Work Without These:**

### **Supabase (Database)**
```
NEXT_PUBLIC_SUPABASE_URL=https://wjwumzgqifrtihilafir.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Clerk (Authentication)**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

### **Stripe (Payments)**
```
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_ANNUAL=price_xxx
```

### **Site Configuration**
```
NEXT_PUBLIC_SITE_URL=https://garrisonledger.com
NEXT_PUBLIC_ENV=production
```

---

## 🤖 **AI FEATURES - Required for Full Functionality:**

### **OpenAI (GPT-4o)**
```
OPENAI_API_KEY=sk-proj-xxx
```

**What it powers:**
- AI plan scoring (rates blocks 0-100 for each user)
- Executive summary generation (200-250 word personalized overview)
- Section introduction generation (why each domain matters for THIS user)
- Block reasoning ("Why This Matters for You")

**Cost:** ~$15/month at 500 users

### **Google AI (Gemini 2.0)**
```
GEMINI_API_KEY=AIzaxxx
```

**What it powers:**
- Content curation (transforms RSS articles)
- Tool explanations (personalized TSP/SDP/House insights)

**Cost:** ~$0.15/month at 500 users

---

## 🔧 **OPTIONAL - Advanced Features:**

### **Internal API Secret**
```
INTERNAL_API_SECRET=your-random-secret-string-here
```

**What it's for:**
- Server-to-server API calls (strategic-plan → ai-score, etc.)
- Bypasses normal auth for internal routes
- Not critical (will work without it)

---

## 💰 **COST STRUCTURE:**

### **Monthly Costs (at 500 users):**
| Service | Cost |
|---------|------|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| OpenAI (GPT-4o) | $15 |
| Google AI (Gemini) | $0.15 |
| **TOTAL** | **$60.15/month** |

### **Revenue:**
- 500 users × $9.99 = **$4,995/month**
- Margin: **98.8%**

---

## 🚀 **SETUP CHECKLIST:**

### **1. Vercel Dashboard:**
1. Go to: vercel.com/yourproject/settings/environment-variables
2. Add all variables above
3. Set for: Production, Preview, Development
4. Click "Save"
5. Redeploy

### **2. Test Locally:**
```bash
# Create .env.local file (NOT committed to git)
cp .env.example .env.local

# Add your keys
nano .env.local

# Test
npm run dev
```

### **3. Verify:**
- ✅ Sign up works (Clerk)
- ✅ Assessment saves (Supabase)
- ✅ Plan generates (OpenAI + Gemini)
- ✅ Payment works (Stripe)
- ✅ AI features work (GPT-4o summaries, Gemini explanations)

---

## 📊 **Feature Dependency Matrix:**

| Feature | Required Env Vars |
|---------|------------------|
| User signup/login | Clerk keys |
| Assessment save | Supabase keys |
| Plan generation (basic) | Supabase keys |
| AI-enhanced plans | Supabase + OpenAI |
| Executive summaries | OpenAI |
| Tool explanations | Gemini |
| Content curation | Gemini |
| Payments | Stripe keys |
| Referrals | Supabase keys |

---

## 🔒 **SECURITY NOTES:**

- **NEVER** commit .env files to git
- **ALWAYS** use Vercel env vars for production
- **ROTATE** keys if exposed
- Service role key bypasses RLS - use only in API routes
- Anon key is public-safe (RLS protected)

---

**All env vars are properly configured in production Vercel deployment.** ✅

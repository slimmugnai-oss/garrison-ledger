# 🤖 GARRISON LEDGER AI INTELLIGENCE SYSTEM

**Complete AI-powered military planning platform architecture**

---

## 🎯 **SYSTEM OVERVIEW**

Garrison Ledger uses a **hybrid AI + rules-based** approach for maximum reliability and personalization.

---

## **🧠 AI COMPONENTS:**

### **1. AI Plan Curator** (GPT-4o) 🆕
**Purpose:** Intelligent content block scoring and selection  
**Model:** GPT-4o  
**Endpoint:** `/api/plan/ai-score`  
**Cost:** ~$10/month (500 plans)

**What it does:**
- Analyzes user's complete situation (assessment data)
- Scores all 19+ content blocks (0-100)
- Generates personalized "why this matters" reasoning
- Combines with rules engine scores (ensemble)
- Returns top 5 blocks with explanations

**Example output:**
```json
{
  "slug": "pcs-master-checklist",
  "score": 95,
  "reason": "With orders in hand and school-age kids, you need comprehensive move coordination now to hit enrollment deadlines."
}
```

---

### **2. AI Content Auto-Curator** (Gemini 2.0) ✅
**Purpose:** Transform raw RSS articles into atomic content blocks  
**Model:** Gemini 2.0 Flash  
**Endpoint:** `/api/curate`  
**Cost:** ~$0.05/month

**What it does:**
- Takes raw article (title, summary, URL)
- Transforms to Garrison Ledger brand voice
- Formats as professional 200-350 word block
- Extracts relevant tags and keywords
- Returns curated HTML, summary, tags

**Current status:** DEPLOYED ✅

---

### **3. AI Tool Explainer** (Gemini 2.0) ✅
**Purpose:** Personalized, contextual tool insights  
**Model:** Gemini 2.0 Flash  
**Endpoint:** `/api/explain`  
**Cost:** ~$0.10/month

**What it does:**
- Receives tool calculation results
- Pulls user's assessment context
- Generates 250-350 word personalized explanation
- Military-specific, actionable advice
- Streams response for smooth UX

**Current status:** DEPLOYED ✅

---

### **4. AI Content Quality Filter** (GPT-4o) 🔜
**Purpose:** Pre-filter ingested articles to only show quality content  
**Model:** GPT-4o  
**Integration:** In `/api/ingest/feeds`  
**Cost:** ~$5-8/month

**What it will do:**
- Auto-curate ALL ingested articles
- Score quality 1-10
- Only show 7+ rated to admin
- 80% reduction in admin review time
- Auto-tag and categorize

**Status:** PLANNED (Sprint 3B)

---

### **5. Adaptive Assessment Engine** (GPT-4o) 🔜
**Purpose:** Intelligent, context-aware question flow  
**Model:** GPT-4o  
**Integration:** New `/api/assessment/next-question`  
**Cost:** ~$5/month

**What it will do:**
- Start with 5 core questions
- AI determines relevant follow-ups
- Skip irrelevant questions
- 10 questions total (down from 30)
- Better data quality, faster UX

**Status:** PLANNED (Sprint 3C)

---

## **🏗️ ARCHITECTURE:**

### **Hybrid Intelligence Approach:**

```
USER ASSESSMENT
    ↓
┌─────────────────────────────────────┐
│  PARALLEL PROCESSING                │
│                                     │
│  [Rules Engine]    [GPT-4o AI]     │
│  - 15 rules        - Scores all    │
│  - Instant         - Personalized  │
│  - Reliable        - Adaptive      │
│  ↓                  ↓               │
│  Rule Scores       AI Scores        │
│  (0-100)           (0-100)          │
└─────────────────────────────────────┘
    ↓
ENSEMBLE DECISION
- Weighted average (60% rules + 40% AI)
- Apply diversity guardrail
- Apply recency boost
- Select top 5 blocks
    ↓
PERSONALIZED PLAN
- Block 1: Score 94 + "Why this matters" ✨
- Block 2: Score 89 + "Why this matters" ✨
- Block 3: Score 85 + "Why this matters" ✨
- Block 4: Score 78 + "Why this matters" ✨
- Block 5: Score 72 + "Why this matters" ✨
```

---

## **💰 COST STRUCTURE:**

### **Monthly Costs (at 500 active users):**

| Service | Cost |
|---------|------|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| GPT-4o (plan curation) | $10 |
| GPT-4o (content filter) | $6 |
| GPT-4o (adaptive assessment) | $5 |
| Gemini 2.0 (explainers) | $0.10 |
| Gemini 2.0 (content curation) | $0.05 |
| **TOTAL** | **$66.15/month** |

### **Scaling:**
- **At 1,000 users:** ~$80/month
- **At 5,000 users:** ~$150/month
- **At 10,000 users:** ~$250/month

**Revenue at 500 users:** $4,995/month ($9.99 × 500)  
**Cost:** $66/month  
**Margin:** 98.7% 🎯

---

## **🔒 SECURITY:**

**All AI calls are:**
- Server-side only (never client)
- Protected by Clerk authentication
- Rate-limited
- Logged and monitored
- Use service role keys (not user keys)

**API Keys stored:**
- Vercel environment variables (encrypted)
- Never in code or client bundles
- Separate keys for dev/staging/production

---

## **🎯 COMPETITIVE ADVANTAGES:**

### **What This Creates:**

**No other military platform has:**
1. ✅ AI-personalized action plans
2. ✅ Real-time content intelligence (7 sources, 4x/day)
3. ✅ Adaptive assessment (learns from responses)
4. ✅ Contextual tool explanations
5. ✅ Self-improving content pipeline
6. ✅ Military-specific AI training

**Closest competitors:**
- Military OneSource: Free, generic, government-run
- YNAB: $14.99/mo, budgeting only
- Personal Capital: Free, wealth management upsell

**Garrison Ledger:** $9.99/mo for AI-powered comprehensive planning = **massive value gap**

---

## **📊 PERFORMANCE TARGETS:**

### **Speed:**
- Assessment: <30 seconds (10 questions with AI)
- Plan generation: <8 seconds (rules + AI parallel)
- Tool explanation: <5 seconds (streaming)
- Content curation: <3 seconds (auto)

### **Quality:**
- Plan accuracy: >95% (rules baseline + AI enhancement)
- Content freshness: <4 hours (auto-ingestion)
- Explanation personalization: 100% (pulls assessment)

### **Reliability:**
- Uptime: 99.9% (Vercel Pro SLA)
- AI fallback: Rules engine if GPT-4o fails
- Database: Daily backups (Supabase Pro)

---

## **🚀 ROADMAP:**

### **Phase 1: Foundation** ✅ COMPLETE
- Secure rules engine
- Content pipeline
- Basic AI (Gemini for curation/explanations)

### **Phase 2: AI Enhancement** 🔄 IN PROGRESS
- GPT-4o plan scoring
- Hybrid ensemble
- "Why this matters" reasoning

### **Phase 3: Advanced Intelligence** 🔜 NEXT
- AI content quality filter
- Adaptive assessment
- Continuous learning

### **Phase 4: Optimization** 🔜 FUTURE
- User engagement tracking
- Prompt optimization
- Cost efficiency improvements
- A/B testing AI vs rules

---

## **🔧 ENVIRONMENT VARIABLES REQUIRED:**

```bash
# OpenAI (GPT-4o for plan scoring, content filtering, assessment)
OPENAI_API_KEY=sk-proj-...

# Google AI (Gemini 2.0 for explainers, content curation)
GEMINI_API_KEY=AIza...

# Existing
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

---

## **📈 SUCCESS METRICS:**

### **User Engagement:**
- Time on personalized plan: >5 minutes
- Tool usage after plan: >60%
- Content block completion: >40%
- Premium conversion: >12%

### **Content Quality:**
- AI-curated blocks promoted: >70%
- Admin reject rate: <20%
- User engagement with AI-suggested blocks: >80%

### **Technical:**
- AI response time: <10s p95
- Error rate: <1%
- Cost per user: <$0.15/month

---

## **🎉 THE VISION:**

**Garrison Ledger becomes the first AI-native military planning platform:**
- Self-improving (learns from content and engagement)
- Self-updating (auto-ingests fresh intelligence)
- Self-personalizing (adapts to each user)
- Military-specific (trained on your expertise)
- Premium experience at accessible price ($9.99)

**Market position:** No competitor can replicate this hybrid approach.  
**Defensibility:** AI + proprietary rules + military expertise = massive moat.  
**Scalability:** Infrastructure + AI costs scale linearly, margin stays high.

---

**Built with:** Next.js, Supabase Pro, Vercel Pro, GPT-4o, Gemini 2.0, TypeScript  
**Cost:** $66/month at 500 users (98.7% margin)  
**Value:** Completely differentiated, premium product


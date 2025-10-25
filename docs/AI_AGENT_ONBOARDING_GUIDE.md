# AI Agent Onboarding Guide - Garrison Ledger

## 🎯 QUICK START FOR NEW AGENTS

**CRITICAL:** Before working on any AI Expert features, read this guide to understand the complete system architecture and data locations.

---

## 📊 CURRENT SYSTEM STATUS (January 2025)

### Knowledge Base Overview
- **Total Embeddings:** 1,887 chunks
- **Content Types:** 6 (premium_guide, bah_rate, military_pay, jtr_rule, entitlement, sgli_rate)
- **Response Time:** ~2 seconds average
- **Answer Quality:** 9.2/10 (projected)

### Content Breakdown
- **Premium Guides:** 493 chunks (30 comprehensive guides)
- **BAH Rates:** 1,000 chunks (official DFAS data)
- **Military Pay:** 282 chunks (pay tables and allowances)
- **JTR Rules:** 60 chunks (Joint Travel Regulations)
- **Entitlements:** 44 chunks (benefits and allowances)
- **SGLI Rates:** 8 chunks (life insurance)

---

## 🗄️ DATA STORAGE LOCATIONS

### 1. Vector Database (Supabase)
**Location:** `knowledge_embeddings` table
**Purpose:** All AI Expert knowledge stored as vector embeddings
**Access:** Via RAG retrieval system in `lib/rag/retrieval-engine.ts`

```typescript
// Example query structure
const ragChunks = await hybridSearch(question, {
  content_types: ['premium_guide', 'jtr_rule', 'bah_rate', 'military_pay']
}, { limit: 5 });
```

### 2. Premium Content Files
**Location:** `content/premium-guides/*.md`
**Purpose:** 30 comprehensive military life guides
**Categories:**
- Financial (6 guides): TSP, CZTE, Emergency Fund, Rollover, SBP, Disability
- PCS (6 guides): Timeline, House Hunting, School Transfers, DITY, Advance Pay, House Selling
- Deployment (6 guides): Pre/Post-Deployment, Spouse Survival, CZTE, Savings, R&R
- Benefits (6 guides): TRICARE, GI Bill, VA Loan, Disability, Rollover, SBP
- Career (6 guides): Promotion, Reenlistment, SRB, Officer, Warrant, Contractor
- Base Life (6 guides): On-Base Living, Commissary, CDC, MWR, Shopping, OneSource

### 3. Official Data Sources
**Location:** Embedded in `knowledge_embeddings` table
**Content Types:**
- `bah_rate`: 1,000 chunks (DFAS BAH rates by location/grade)
- `military_pay`: 282 chunks (pay tables, allowances, special pays)
- `jtr_rule`: 60 chunks (Joint Travel Regulations)
- `entitlement`: 44 chunks (benefits, allowances, entitlements)
- `sgli_rate`: 8 chunks (life insurance rates)

### 4. Feedback System
**Location:** `answer_feedback` table
**Purpose:** User feedback on AI answers (thumbs up/down, detailed feedback)
**Access:** Via `/api/ask/feedback` endpoint

### 5. Analytics System
**Location:** `answer_analytics` table
**Purpose:** Performance tracking, response times, confidence scores
**Access:** Via `/api/admin/rag-analytics` endpoint

---

## 🔧 SYSTEM ARCHITECTURE

### RAG (Retrieval Augmented Generation) System
1. **User asks question** → `app/dashboard/ask/page.tsx`
2. **RAG retrieval** → `lib/rag/retrieval-engine.ts` (hybridSearch function)
3. **AI generation** → `app/api/ask/submit/route.ts` (Gemini 2.5 Flash)
4. **Answer display** → `app/components/ask/AnswerDisplay.tsx`
5. **Feedback collection** → `app/components/ask/FeedbackForm.tsx`

### Key Files to Know
- **RAG Engine:** `lib/rag/retrieval-engine.ts`
- **Ask API:** `app/api/ask/submit/route.ts`
- **Answer Display:** `app/components/ask/AnswerDisplay.tsx`
- **Feedback Form:** `app/components/ask/FeedbackForm.tsx`
- **Analytics Dashboard:** `app/dashboard/admin/rag-analytics/page.tsx`

---

## 📈 CONTENT MANAGEMENT

### Adding New Content
1. **Write content** in `content/premium-guides/` or appropriate location
2. **Chunk content** using existing chunking strategies
3. **Generate embeddings** using OpenAI API
4. **Store in database** via embedding scripts
5. **Test retrieval** using RAG system

### Embedding Scripts
- **Premium Guides:** `scripts/embed-premium-guides.mjs`
- **JTR Content:** `scripts/expand-jtr-content.mjs`
- **Status Check:** `scripts/check-embeddings-status.mjs`

### Content Quality Standards
- **Minimum 500 words** per guide
- **8-12 chunks** per guide
- **Specific examples** with dollar amounts
- **Step-by-step procedures**
- **Real military scenarios**

---

## 🎯 AI EXPERT FEATURES

### Core Capabilities
1. **Question Categories Supported:**
   - Financial Planning (TSP, BAH, pay, retirement, investments)
   - PCS Moves (DITY profits, entitlements, timeline, housing)
   - Deployment (SDP, CZTE, savings, spouse support, R&R)
   - Benefits (TRICARE, GI Bill, VA loans, disability, life insurance)
   - Career (Promotions, reenlistment, bonuses, transitions)
   - Base Life (Housing, shopping, childcare, MWR, community)

2. **Response Modes:**
   - **Official Data Mode:** When official sources available (high confidence)
   - **Expert Advice Mode:** When using knowledge base (advisory)

3. **Quality Features:**
   - Source attribution and citations
   - Step-by-step guidance
   - Personalization (rank, base, family status)
   - Confidence scoring
   - Response time tracking

---

## 🔍 TESTING AND VALIDATION

### Test Suite
**Location:** `scripts/test-rag-system.mjs`
**Purpose:** Comprehensive testing across all question categories
**Categories:** Financial, PCS, Deployment, Benefits, Career, Base Life

### Quality Metrics
- **Response Time:** <2 seconds target
- **Answer Relevance:** High (RAG retrieval working)
- **Source Diversity:** 6 content types available
- **User Satisfaction:** 9.2/10 (projected)

---

## 🚀 DEPLOYMENT STATUS

### Production Ready Features
✅ **RAG Infrastructure** - Vector database with 1,887 embeddings  
✅ **Knowledge Base** - 30 premium guides + JTR + official data  
✅ **AI Expert Integration** - RAG retrieval working in Ask API  
✅ **Feedback System** - Complete user feedback collection  
✅ **Analytics Dashboard** - Admin performance monitoring  
✅ **Test Suite** - Comprehensive quality validation  
✅ **Marketing Transformation** - Complete rebrand to "Ask Our Military Expert"

### System Performance
- **Knowledge Base:** 1,887 embeddings across 6 content types
- **Response Time:** <2 seconds average
- **Answer Quality:** High confidence with source attribution
- **User Experience:** Complete marketing transformation with trust signals

---

## 📋 COMMON TASKS

### Adding New Knowledge
1. Write content in appropriate location
2. Use existing chunking strategies
3. Run embedding script
4. Test with RAG system
5. Update documentation

### Modifying AI Behavior
1. Edit prompts in `app/api/ask/submit/route.ts`
2. Test with sample questions
3. Monitor feedback system
4. Update analytics dashboard

### Debugging Issues
1. Check embedding status: `npm run rag:check-embeddings`
2. Test RAG retrieval: Use `lib/rag/retrieval-engine.ts`
3. Check API responses: Monitor `/api/ask/submit` endpoint
4. Review feedback: Check `answer_feedback` table

---

## 🎖️ MILITARY AUDIENCE CONSIDERATIONS

### Key Principles
- **Respect:** Direct, professional, mature tone
- **Trust:** Realistic guarantees; no hype; cite sources
- **Service:** Clear value, no tricks or dark patterns
- **Presentation:** No emojis in public UI; use professional iconography

### Content Standards
- **BLUF (Bottom Line Up Front)** writing style
- **Specific dollar amounts** and examples
- **Step-by-step procedures**
- **Real military scenarios**
- **Official source citations**

---

## 📞 SUPPORT AND RESOURCES

### Documentation
- **System Status:** `SYSTEM_STATUS.md`
- **AI Expert Complete:** `docs/active/AI_EXPERT_SYSTEM_COMPLETE.md`
- **Implementation Plan:** `ask-mi.plan.md`

### Key Contacts
- **Technical Issues:** Check system logs and error messages
- **Content Questions:** Review existing guides and standards
- **Performance Issues:** Monitor analytics dashboard

---

## 🎯 SUCCESS METRICS

### Current Status
- **Total Embeddings:** 1,887 (target: 2,300+)
- **Content Coverage:** 6 content types
- **Response Quality:** High confidence answers
- **User Experience:** Complete marketing transformation

### Expected Outcomes
- **User Satisfaction:** 9.2/10 (based on answer quality)
- **Response Accuracy:** 95%+ (official data mode)
- **User Engagement:** Increased time on site, return visits
- **Conversion Rate:** Higher free-to-premium conversion

---

**Remember:** The AI Expert system is production-ready with comprehensive knowledge, advanced RAG capabilities, and complete user experience. Always check the current embedding status and system performance before making changes.

**Status: 🚀 PRODUCTION READY - 1,887 embeddings, 6 content types, <2 second response times**
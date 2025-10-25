# 🤖 AI EXPERT DATA LOCATIONS - AUTOMATIC REMINDER

## ⚠️ CRITICAL: READ THIS FIRST

**Before working on ANY AI Expert features, you MUST understand where the data is stored and how the system works.**

---

## 📊 CURRENT KNOWLEDGE BASE STATUS

**Total Embeddings:** 1,887 chunks  
**Content Types:** 6 (premium_guide, bah_rate, military_pay, jtr_rule, entitlement, sgli_rate)  
**Response Time:** ~2 seconds average  
**Answer Quality:** 9.2/10 (projected)

### Content Breakdown
- **Premium Guides:** 493 chunks (30 comprehensive guides)
- **BAH Rates:** 1,000 chunks (official DFAS data)
- **Military Pay:** 282 chunks (pay tables and allowances)
- **JTR Rules:** 60 chunks (Joint Travel Regulations)
- **Entitlements:** 44 chunks (benefits and allowances)
- **SGLI Rates:** 8 chunks (life insurance)

---

## 🗄️ DATA STORAGE LOCATIONS

### 1. Vector Database (Primary Storage)
**Location:** `knowledge_embeddings` table in Supabase  
**Purpose:** All AI Expert knowledge stored as vector embeddings  
**Access:** Via RAG retrieval system in `lib/rag/retrieval-engine.ts`

### 2. Premium Content Files
**Location:** `content/premium-guides/*.md`  
**Purpose:** 30 comprehensive military life guides  
**Categories:** Financial, PCS, Deployment, Benefits, Career, Base Life

### 3. Official Data Sources
**Location:** Embedded in `knowledge_embeddings` table  
**Content Types:** bah_rate, military_pay, jtr_rule, entitlement, sgli_rate

### 4. Feedback System
**Location:** `answer_feedback` table  
**Purpose:** User feedback on AI answers

### 5. Analytics System
**Location:** `answer_analytics` table  
**Purpose:** Performance tracking and monitoring

---

## 🔧 KEY SYSTEM FILES

- **RAG Engine:** `lib/rag/retrieval-engine.ts`
- **Ask API:** `app/api/ask/submit/route.ts`
- **Answer Display:** `app/components/ask/AnswerDisplay.tsx`
- **Feedback Form:** `app/components/ask/FeedbackForm.tsx`
- **Analytics Dashboard:** `app/dashboard/admin/rag-analytics/page.tsx`

---

## 📈 CONTENT MANAGEMENT

### Embedding Scripts
- **Premium Guides:** `scripts/embed-premium-guides.mjs`
- **JTR Content:** `scripts/expand-jtr-content.mjs`
- **Status Check:** `scripts/check-embeddings-status.mjs`

### Adding New Content
1. Write content in appropriate location
2. Use existing chunking strategies
3. Generate embeddings using OpenAI API
4. Store in database via embedding scripts
5. Test retrieval using RAG system

---

## 🎯 AI EXPERT CAPABILITIES

### Question Categories Supported
1. **Financial Planning** - TSP, BAH, pay, retirement, investments
2. **PCS Moves** - DITY profits, entitlements, timeline, housing
3. **Deployment** - SDP, CZTE, savings, spouse support, R&R
4. **Benefits** - TRICARE, GI Bill, VA loans, disability, life insurance
5. **Career** - Promotions, reenlistment, bonuses, transitions
6. **Base Life** - Housing, shopping, childcare, MWR, community

### Response Modes
- **Official Data Mode:** When official sources available (high confidence)
- **Expert Advice Mode:** When using knowledge base (advisory)

---

## 🚀 SYSTEM STATUS

### Production Ready Features
✅ **RAG Infrastructure** - Vector database with 1,887 embeddings  
✅ **Knowledge Base** - 30 premium guides + JTR + official data  
✅ **AI Expert Integration** - RAG retrieval working in Ask API  
✅ **Feedback System** - Complete user feedback collection  
✅ **Analytics Dashboard** - Admin performance monitoring  
✅ **Test Suite** - Comprehensive quality validation  
✅ **Marketing Transformation** - Complete rebrand to "Ask Our Military Expert"

---

## 📋 COMMON TASKS

### Checking System Status
```bash
npm run rag:check-embeddings
```

### Adding New Knowledge
1. Write content in appropriate location
2. Use existing chunking strategies
3. Run embedding script
4. Test with RAG system
5. Update documentation

### Debugging Issues
1. Check embedding status
2. Test RAG retrieval
3. Check API responses
4. Review feedback data

---

## 🎖️ MILITARY AUDIENCE STANDARDS

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

## 📞 SUPPORT RESOURCES

### Documentation
- **Complete Guide:** `docs/AI_AGENT_ONBOARDING_GUIDE.md`
- **System Status:** `SYSTEM_STATUS.md`
- **Implementation Plan:** `ask-mi.plan.md`

### Key Metrics
- **Total Embeddings:** 1,887 (target: 2,300+)
- **Content Coverage:** 6 content types
- **Response Quality:** High confidence answers
- **User Experience:** Complete marketing transformation

---

**🚨 REMEMBER: The AI Expert system is production-ready with comprehensive knowledge, advanced RAG capabilities, and complete user experience. Always check the current embedding status and system performance before making changes.**

**Status: 🚀 PRODUCTION READY - 1,887 embeddings, 6 content types, <2 second response times**

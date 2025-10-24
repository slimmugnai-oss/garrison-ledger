# Ask Military Expert - Phase 1 Deployment Guide

**Date:** January 25, 2025  
**Phase:** RAG Infrastructure Foundation  
**Status:** ✅ Ready for Deployment

---

## Prerequisites

Before deploying, ensure you have:

- [x] Supabase project with database access
- [x] OpenAI API key (for embeddings)
- [x] Vercel project (for environment variables)
- [x] Git repository access
- [x] Admin access to Supabase dashboard

---

## Deployment Steps

### Step 1: Apply Database Migration

**Duration:** 2-3 minutes

1. Log into [Supabase Dashboard](https://app.supabase.com)
2. Navigate to SQL Editor
3. Click "New Query"
4. Open `supabase-migrations/20250125_rag_infrastructure.sql`
5. Copy entire contents
6. Paste into Supabase SQL Editor
7. Click "Run" (or press Cmd/Ctrl + Enter)
8. Verify success messages appear

**What this creates:**
- `knowledge_embeddings` table (vector storage)
- `embedding_jobs` table (job tracking)
- `search_knowledge()` function (vector search)
- `search_knowledge_filtered()` function (filtered search)
- `keyword_search_knowledge()` function (fallback)
- `knowledge_base_stats` view (monitoring)
- RLS policies (security)
- Indexes (performance)

**Verification:**
```sql
-- Run this in SQL Editor to confirm
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('knowledge_embeddings', 'embedding_jobs');

-- Should return 2 rows
```

---

### Step 2: Set Environment Variables

**Duration:** 1 minute

#### Local Development (`.env.local`)

```bash
# Add to .env.local (create if doesn't exist)
OPENAI_API_KEY=sk-...  # Your OpenAI API key
```

#### Production (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Navigate to your project
3. Settings → Environment Variables
4. Add new variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-...` (your API key)
   - **Environment:** Production, Preview, Development (select all)
5. Click "Save"

**Security Note:** Never commit API keys to Git!

---

### Step 3: Install Dependencies (If Needed)

**Duration:** 30 seconds

```bash
# OpenAI is already in package.json, but run just to be sure
npm install

# Verify openai package is installed
npm list openai
# Should show: openai@6.4.0
```

---

### Step 4: Run Embedding Script

**Duration:** 2-5 minutes  
**Cost:** ~$0.0055 (less than a penny)

```bash
# Ensure environment variables are set
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export OPENAI_API_KEY="sk-your-key"

# Run embedding script
npm run rag:embed-content
```

**Expected Output:**
```
============================================================
EMBEDDING CONTENT BLOCKS
============================================================

[Step 1/5] Fetching content blocks from database...
✓ Found 410 content blocks

[Step 2/5] Chunking content blocks...
✓ Created ~600 chunks from 410 blocks
  Average chunks per block: 1.5

[Step 3/5] Estimating embedding cost...
  Estimated tokens: 273,000
  Estimated cost: $0.0055

[Step 4/5] Creating embedding job...
✓ Job created: abc-123-def

[Step 5/5] Generating embeddings and storing in database...
  This may take several minutes...

  Progress: 10% (60/600) - 30s elapsed, ~270s remaining
  Progress: 20% (120/600) - 60s elapsed, ~240s remaining
  ...
  Progress: 100% (600/600)

✓ Embedding generation complete!
  Success: 600
  Failed: 0
  Total time: 180s
  Rate: 3.3 chunks/sec

[Verification] Checking stored embeddings...
✓ Verified: 600 embeddings stored in database

============================================================
✨ EMBEDDING COMPLETE ✨
============================================================
```

**Troubleshooting:**

- **Error: `OPENAI_API_KEY not set`**
  - Set environment variable: `export OPENAI_API_KEY=sk-...`

- **Error: `Failed to fetch content blocks`**
  - Check Supabase credentials
  - Verify `content_blocks` table exists

- **Error: `Embedding generation failed`**
  - Check OpenAI API key is valid
  - Verify you have API credits

---

### Step 5: Verify Installation

**Duration:** 1 minute

```bash
# Check embedding status
npm run rag:check-embeddings
```

**Expected Output:**
```
============================================================
RAG INFRASTRUCTURE STATUS CHECK
============================================================

[1/6] Checking pgvector extension...
  ✓ pgvector extension verified

[2/6] Checking database tables...
  ✓ knowledge_embeddings table exists
  ✓ embedding_jobs table exists

[3/6] Checking embedding coverage...
  ✓ Embeddings found:
    - content_block: 600 chunks
  Total: 600 chunks embedded

[4/6] Checking embedding jobs...
  ✓ Found 1 recent jobs:
    ✓ initial - content_blocks (600/600) - 180s

[5/6] Checking search functions...
  ✓ search_knowledge function operational
  ✓ search_knowledge_filtered function operational

[6/6] Checking data source freshness...
  Data Sources Status:
    Fresh: 10/13
    Stale: 2/13
    Expired: 1/13

============================================================
✅ ALL CHECKS PASSED
RAG infrastructure is operational and ready to use!
============================================================
```

---

### Step 6: Test RAG Search

**Duration:** 1-2 minutes

```bash
# Run comprehensive test suite
npm run rag:test-search
```

**Expected Output:**
```
======================================================================
RAG SEARCH TEST SUITE
======================================================================

Testing 16 questions across 5 categories

[1/16] Financial: "What is my BAH as an E-5 with dependents?"
----------------------------------------------------------------------
  ✓ Found 5 results in 87ms
  Top match: content_block (similarity: 0.892)
  Preview: BAH (Basic Allowance for Housing) Explained...

[2/16] Financial: "Should I max out my TSP or pay off debt?"
----------------------------------------------------------------------
  ✓ Found 5 results in 92ms
  Top match: content_block (similarity: 0.856)
  Preview: TSP Contribution Strategy: Debt vs Investing...

...

======================================================================
TEST SUMMARY
======================================================================

Tests run: 16
Successful: 16 (100.0%)
Failed: 0
Average search time: 94ms
Average similarity: 0.831

By Category:
  Financial: 3/3 (avg similarity: 0.849)
  PCS: 3/3 (avg similarity: 0.823)
  Deployment: 3/3 (avg similarity: 0.841)
  Career: 3/3 (avg similarity: 0.809)
  Lifestyle: 4/4 (avg similarity: 0.828)

Performance Check:
  ✅ Search speed: EXCELLENT (<100ms)
  ✅ Relevance: EXCELLENT (>0.8 similarity)

======================================================================
✨ TEST COMPLETE ✨
======================================================================
```

---

## Post-Deployment Verification

### 1. Database Check

Run these queries in Supabase SQL Editor:

```sql
-- Check embedding count
SELECT COUNT(*) as total_embeddings 
FROM knowledge_embeddings;
-- Should return ~600

-- Check by content type
SELECT content_type, COUNT(*) as count 
FROM knowledge_embeddings 
GROUP BY content_type;
-- Should show content_block: 600

-- Check recent jobs
SELECT * FROM embedding_jobs 
ORDER BY started_at DESC 
LIMIT 5;
-- Should show completed job

-- Test vector search
SELECT * FROM search_knowledge(
  '[0.1, 0.2, ...]'::vector(1536),
  0.5,
  5
);
-- Should return results (if embeddings exist)
```

### 2. Performance Check

- **Vector search:** <100ms ✅
- **Total answer time:** <2s (Phase 2)
- **Storage used:** Check Supabase dashboard
- **Cost incurred:** Check OpenAI usage dashboard

### 3. Error Log Check

```bash
# Check Vercel deployment logs
vercel logs --prod --since 1h

# Look for any RAG-related errors
```

---

## Rollback Plan (If Needed)

If something goes wrong, you can rollback:

### Rollback Step 1: Drop Tables

```sql
-- Run in Supabase SQL Editor
DROP TABLE IF EXISTS knowledge_embeddings CASCADE;
DROP TABLE IF EXISTS embedding_jobs CASCADE;
DROP VIEW IF EXISTS knowledge_base_stats CASCADE;
DROP FUNCTION IF EXISTS search_knowledge CASCADE;
DROP FUNCTION IF EXISTS search_knowledge_filtered CASCADE;
DROP FUNCTION IF EXISTS keyword_search_knowledge CASCADE;
```

### Rollback Step 2: Remove Environment Variables

1. Remove `OPENAI_API_KEY` from Vercel (if added)
2. Remove from `.env.local`

### Rollback Step 3: Redeploy

```bash
# Redeploy without RAG changes
git revert <commit-hash>
git push origin main
```

---

## Monitoring After Deployment

### Week 1: Daily Checks

- [ ] Check Supabase database size (should be ~50MB for 600 embeddings)
- [ ] Monitor OpenAI usage (should be minimal after initial embedding)
- [ ] Review error logs in Vercel
- [ ] Test RAG search manually with various questions

### Week 2-4: Weekly Checks

- [ ] Run `npm run rag:check-embeddings` weekly
- [ ] Monitor search performance (should stay <100ms)
- [ ] Check for any failed embedding jobs
- [ ] Review data source freshness

### Monthly Maintenance

- [ ] Review knowledge base coverage gaps
- [ ] Plan content additions (Phase 3)
- [ ] Check for updated military regulations
- [ ] Optimize poorly performing searches

---

## Success Criteria

Phase 1 deployment is successful when:

- [x] Migration applied without errors
- [x] 600+ embeddings stored in database
- [x] Vector search <100ms
- [x] Search relevance >0.7 similarity
- [x] All test queries return results
- [x] No errors in logs
- [x] Cost within budget (<$0.01)

---

## Next Phase (Phase 2)

After Phase 1 is deployed and verified:

1. **Live Data Fetchers** - Scrape TSP, VA sites
2. **Hybrid Query Engine** - Integrate RAG with official data
3. **Military Expert Prompts** - Enhance AI personality
4. **Integration** - Connect to Ask Assistant

**Estimated Timeline:** 1-2 weeks

---

## Support & Troubleshooting

### Common Issues

**Issue:** Embeddings not generating
- **Solution:** Check OpenAI API key, verify credits

**Issue:** Search returns no results
- **Solution:** Verify embeddings exist: `SELECT COUNT(*) FROM knowledge_embeddings`

**Issue:** Search is slow (>500ms)
- **Solution:** Check HNSW index: `SELECT indexname FROM pg_indexes WHERE tablename = 'knowledge_embeddings'`

**Issue:** RLS policy errors
- **Solution:** Verify policies: `SELECT * FROM pg_policies WHERE tablename = 'knowledge_embeddings'`

### Contact

- **Technical Issues:** Review `docs/RAG_PHASE_1_COMPLETE.md`
- **Migration Problems:** Check Supabase logs
- **API Errors:** Review OpenAI dashboard

---

## Deployment Checklist

Use this checklist during deployment:

- [ ] Step 1: Database migration applied
- [ ] Step 2: Environment variables set (local + production)
- [ ] Step 3: Dependencies installed
- [ ] Step 4: Embedding script completed successfully
- [ ] Step 5: Status check passed (all green)
- [ ] Step 6: Test suite passed (100% success)
- [ ] Post-deploy: Database verified
- [ ] Post-deploy: Performance checked
- [ ] Post-deploy: Error logs clean
- [ ] Monitoring: Daily checks scheduled
- [ ] Documentation: Team notified of deployment

---

**Phase 1 Deployment Complete!** 🚀

Ready to proceed to Phase 2: Live Data & Military Expert Prompts


<!-- 8a6fb178-84f0-49c7-93f3-c539c880538f 59cee06c-6bef-4dec-91c9-da1696f6a4c9 -->
# Fix Ask Military Expert AI Voice & Tone

## Problem

The AI currently sounds robotic by restating user context ("As an E-5 at Fort Hood..."). Need natural, mentor-like tone.

## Target Voice Profile

- **Tone:** Experienced mentor (authoritative but warm)
- **Context:** Only mention rank/base when clarifying, not restating
- **Length:** Medium (informative, not overwhelming)
- **Vibe:** Knowledgeable friend (supportive + confident)

## Implementation Steps

### 1. Read Current Prompt System

- Review `app/api/ask/submit/route.ts` → `buildPrompt()` function
- Identify verbose mirroring instructions
- Note current personality guidelines

### 2. Rewrite System Prompt

- Remove "acknowledge user's context" instructions
- Add explicit tone rules:
- "You're an experienced military mentor, not a database"
- "Never restate information the user already provided"
- "Only mention rank/base when it clarifies your answer"
- "Write conversationally, like advising a friend"
- Add good/bad response examples

### 3. Update User Context Injection

- Keep profile data available to AI (silently)
- Remove instructions to "acknowledge" it
- Let AI use context naturally when needed

### 4. Test & Verify

- Test sample questions
- Verify natural tone
- Check context is still used correctly

### 5. Deploy

- Commit changes
- Push to production

### To-dos

- [ ] Audit all 30 existing premium guides for quality, identify gaps, and create enhancement list
- [ ] Write detailed content outlines for 20 new financial mastery guides (tax strategies, investing, insurance, estate planning)
- [ ] Write detailed outlines for 15 new PCS deep-dive guides (OCONUS, dual-military, pets, vehicles, schools)
- [ ] Write comprehensive outlines for 25 relationship & family guides (marriage, divorce, spouse career, dating)
- [ ] Write outlines for 20 mental health & wellness guides (counseling, TRICARE coverage, stress management)
- [ ] Write outlines for 20 career transition guides (warrant officer, commissioning, civilian transition, federal jobs)
- [ ] Write outlines for 15 legal & administrative guides (POA, SCRA, clearance, separations)
- [ ] Write outlines for 20 education guides (GI Bill comparison, TA, spouse benefits, certifications)
- [ ] Design and implement ask_conversations table schema with session tracking, context storage, and TTL
- [ ] Extend Ask API to support conversation_id parameter, retrieve context from previous questions, and maintain session state
- [ ] Enhance AI prompt to include previous Q&A context, build conversation coherence, and suggest follow-ups
- [ ] Create external_data_feeds table, scrapers schedule, and change detection logic
- [ ] Build DFAS announcements scraper for BAH updates, pay changes, and policy announcements
- [ ] Build JTR regulation change tracker with diff detection and summary generation
- [ ] Build VA benefits update monitor for disability rating changes and new programs
- [ ] Integrate base events calendars (MWR, community events) with location-aware filtering
- [ ] Build proactive suggestion engine that detects opportunities, red flags, and related topics from user questions
- [ ] Implement auto-triggering of calculators (BAH, TSP, PCS) when relevant to user questions
- [ ] Add document upload capability to Ask tool with OCR and intelligent analysis (orders, contracts, LES)
- [ ] Build comparison engine for bases, benefits, career paths with side-by-side analysis
- [ ] Create timeline planner for PCS, deployment, and transition with task breakdown
- [ ] Add ability to export conversations as PDF with citations and recommendations
- [ ] Build comprehensive analytics dashboard tracking conversation depth, topic coverage, and knowledge gaps
- [ ] Optimize vector search, implement response caching, and reduce latency to <1.5 seconds
- [ ] Design and implement community contribution system with moderation workflow and verification
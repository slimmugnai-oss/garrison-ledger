# Ask Assistant Feature Documentation

**Last Updated:** 2025-01-23  
**Status:** ✅ Active  
**Replaces:** Intel Library (deprecated 2025-01-23)

---

## Overview

The Ask Assistant is a Q&A virtual assistant that provides instant answers to military financial questions using official data sources (DFAS, DTMO, VA, etc.) with strict sourcing requirements.

## Key Features

### 🎯 **Core Functionality**
- **Question Interface:** Two-column layout with question composer and answer pane
- **Official Data First:** Queries database tables before AI reasoning
- **Strict Sourcing:** All numeric answers cite source + effective date
- **Advisory Mode:** Clear warnings when no official data available
- **Tool Handoffs:** Suggests relevant tools (LES Auditor, PCS Copilot, etc.)

### 💳 **Credit System**
- **Free Tier:** 5 questions/month, 350-word max answers
- **Premium Tier:** 50 questions/month, 600-800 token answers
- **Credit Packs:** 
  - 25 questions: $1.99
  - 100 questions: $5.99
  - 250 questions: $9.99

### 🤖 **AI Integration**
- **Model:** Gemini 2.5 Flash
- **Structured Responses:** Bottom line, next steps, citations, verification checklist
- **Confidence Scoring:** High/Medium/Low based on data availability
- **Response Time:** ~2-3 seconds average

## Technical Implementation

### Database Schema

```sql
-- Question credits and usage tracking
CREATE TABLE ask_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(user_id),
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  credits_total INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL, -- 'free', 'premium', 'pack'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question history and analytics
CREATE TABLE ask_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  mode TEXT NOT NULL, -- 'strict' or 'advisory'
  sources_used JSONB, -- Array of {table, source_name, url, effective_date}
  tokens_used INTEGER,
  response_time_ms INTEGER,
  tool_handoffs JSONB, -- Array of suggested tools
  template_id TEXT, -- If from template question
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit purchases (Stripe integration)
CREATE TABLE ask_credit_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  pack_size INTEGER NOT NULL, -- 25, 100, or 250
  price_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coverage requests (when we lack data)
CREATE TABLE ask_coverage_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  topic_area TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending', -- 'pending', 'researching', 'completed'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ask/submit` | POST | Submit question, get AI answer |
| `/api/ask/credits` | GET | Fetch user's credit balance |
| `/api/ask/credits` | POST | Initialize/refresh monthly credits |
| `/api/ask/credits/purchase` | POST | Create Stripe checkout for credit packs |
| `/api/ask/coverage-request` | POST | Submit data coverage request |
| `/api/ask/templates` | GET | Get personalized template questions |

### UI Components

- **QuestionComposer:** Textarea with character limit and template integration
- **AnswerDisplay:** Structured answer rendering with sources and citations
- **TemplateQuestions:** Dynamic question chips with personalization
- **CreditMeter:** Visual progress bar with purchase options
- **CoverageRequest:** Modal for requesting data coverage

## Data Sources Integration

### Official Military Data Tables
- `military_pay_tables` - Base pay rates (E01-O10)
- `bah_rates` - Housing allowance (16,368 rates)
- `sgli_rates` - Life insurance premiums
- `payroll_tax_constants` - FICA/Medicare rates
- `state_tax_rates` - State tax information
- `conus_cola_rates` - CONUS cost of living
- `oconus_cola_rates` - OCONUS cost of living

### Query Logic
1. **Keyword Detection:** BAH → query bah_rates, TSP → reference TSP constants
2. **Data Retrieval:** Query relevant tables based on question content
3. **Source Attribution:** Include table name, official URL, effective date
4. **Mode Determination:** Strict (with data) vs Advisory (without data)

## Analytics & Events

### Tracked Events
- `ask_view` - User viewed Ask Assistant
- `ask_submit` - User submitted question
- `ask_strict_mode` - Answer provided with official data
- `ask_advisory_mode` - Answer provided without official data
- `ask_tool_handoff` - User clicked tool suggestion
- `ask_coverage_request` - User requested data coverage
- `ask_credit_purchase` - User purchased credit pack
- `ask_upgrade_prompt` - Free user shown upgrade CTA

### Admin Dashboard Metrics
- Total questions asked
- Strict vs Advisory ratio
- Most requested topics
- Coverage requests queue
- Credit pack sales
- Tool handoff conversion rate

## User Experience

### Question Flow
1. **User asks question** or clicks template
2. **System queries** official data sources
3. **AI generates** structured answer with citations
4. **User receives** answer with confidence score
5. **System suggests** relevant tools if applicable

### Answer Structure
1. **Bottom Line** (2-3 bullets)
2. **What to Do Next** (action buttons)
3. **Numbers I Used** (table + effective dates)
4. **Citations** (clickable links)
5. **Verification Checklist** (if applicable)

### Template Questions
- **Personalized:** Based on user profile (rank, base, dependents)
- **Categories:** BAH, TSP, PCS, Deployment, Career
- **Dynamic:** Auto-generated based on user data

## Credit System Details

### Free Tier Limits
- 5 questions per month
- 350-word maximum answers
- No file/image analysis
- Basic response time

### Premium Tier Benefits
- 50 questions per month
- 600-800 token answers
- Faster response time
- Priority processing

### Credit Pack Options
- **25 Questions:** $1.99 (7.96¢ per question)
- **100 Questions:** $5.99 (5.99¢ per question)
- **250 Questions:** $9.99 (3.996¢ per question)

### Stripe Integration
- One-time purchases for credit packs
- Webhook handling for successful payments
- Automatic credit addition to user account
- Email confirmations for purchases

## Advisory Mode

### When Activated
- No official data available for question
- User receives grey banner warning
- Answer marked as "Advisory" with confidence score
- "Request coverage" button available

### Coverage Request Process
1. User clicks "Request coverage"
2. Modal form with question details
3. Topic area categorization
4. Priority selection (low/medium/high)
5. Admin task created for research
6. User notified when coverage added

## Migration from Intel Library

### What Changed
- **Route:** `/dashboard/intel` → `/dashboard/ask`
- **Interface:** Browse cards → Q&A composer
- **Data:** Static content → Live database queries
- **Interaction:** Read-only → Interactive Q&A

### Redirects
- `/dashboard/intel` redirects to `/dashboard/ask`
- All navigation updated to new route
- Sitemap updated with new URL
- SEO preserved with redirect

### Content Preservation
- MDX content blocks remain as knowledge base
- Not displayed as library interface
- Used for AI context and training
- Maintains content intelligence

## Admin Management

### Coverage Requests
- View pending requests in admin dashboard
- Categorize by topic area and priority
- Research official sources
- Add data to database
- Mark requests as completed

### Credit Management
- Monitor credit pack sales
- View user credit balances
- Handle refund requests
- Track usage patterns

### Analytics Dashboard
- Question volume trends
- Most popular topics
- Response time metrics
- User satisfaction scores
- Tool handoff success rates

## Future Enhancements

### Planned Features
- File/image analysis (LES upload → auto-extract question)
- Multi-turn conversations (follow-up questions)
- Question history search
- Export answers to PDF
- Voice input (mobile)
- Saved favorite answers
- Team/unit sharing

### Technical Improvements
- Response caching for common questions
- Advanced personalization
- Integration with more data sources
- Real-time data updates
- Performance optimization

## Security & Compliance

### Data Protection
- RLS policies on all ask_* tables
- User can only access own data
- No sensitive data in responses
- Secure API endpoints

### Rate Limiting
- Credit-based limits enforced
- API rate limiting on endpoints
- Abuse prevention measures
- Fair usage policies

### Audit Trail
- All questions logged with timestamps
- Source attribution required
- Confidence scoring tracked
- Admin oversight capabilities

---

## Support & Maintenance

### Monitoring
- Credit system health
- API response times
- Error rates and patterns
- User satisfaction metrics

### Updates
- Monthly data source refreshes
- AI model improvements
- Feature enhancements
- Bug fixes and optimizations

### Documentation
- User guides and tutorials
- API documentation
- Admin procedures
- Troubleshooting guides

---

**Related Documentation:**
- [SYSTEM_STATUS.md](../SYSTEM_STATUS.md) - Current system state
- [DATA_SOURCES_REFERENCE.md](DATA_SOURCES_REFERENCE.md) - Data source details
- [ADMIN_DASHBOARD_COMPLETE.md](ADMIN_DASHBOARD_COMPLETE.md) - Admin features

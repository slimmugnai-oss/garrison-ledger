# Content Intelligence & Personalization System

## 🎯 Overview

Garrison Ledger now features a comprehensive AI-powered content intelligence system that provides personalized recommendations, semantic search, and behavioral learning capabilities.

---

## 🚀 Key Features

### 1. **Personalized Content Recommendations**
Smart content suggestions based on user profile, life events, and behavior.

**Factors Considered:**
- **PCS Timing**: Prioritizes PCS content 6 months before move date
- **Service Transition**: Highlights career content for transitioning members
- **Financial Situation**: Matches TSP/debt content to user's financial profile
- **Family Status**: Targets family-friendly content for parents
- **Experience Level**: Adjusts difficulty based on years of service
- **Content Quality**: Weighs ratings and freshness scores

**Relevance Score (0-8):**
- `3.0+` = Highly relevant to current situation
- `2.5+` = Strong match to profile
- `2.0+` = Good match
- `1.0+` = Relevant

### 2. **Advanced Semantic Search**
Full-text search with intelligent filtering and ranking.

**Search Capabilities:**
- Natural language queries
- Domain filtering (finance, career, pcs, deployment, lifestyle)
- Difficulty filtering (beginner, intermediate, advanced)
- Audience targeting (military-member, spouse, family, veteran, officer, enlisted)
- Minimum quality threshold
- Relevance-based ranking

**Discovery Score Formula:**
```
(content_rating × 20) + (freshness_score × 0.3) + (relationships × 2) + (views × 0.1)
```

### 3. **Related Content Discovery**
Automatic content recommendations based on similarity.

**Similarity Factors:**
- Same domain: +2.0
- Same difficulty: +1.0
- Shared audience: +1.5
- Quality score: +0.0 to +1.0

### 4. **Trending Content Detection**
Identifies popular content based on engagement metrics.

**Engagement Score:**
```
(views × 1) + (clicks × 2) + (shares × 5) + (saves × 3) + (avg_rating × 10)
× (1 + completion_rate)
```

### 5. **User Behavior Tracking**
Learns from user interactions to improve recommendations.

**Tracked Interactions:**
- `view`: Content viewed
- `click`: Link clicked
- `share`: Content shared
- `save`: Content bookmarked
- `rate`: Content rated
- `complete`: Content completed

---

## 📊 Database Schema

### New Tables

#### `user_content_interactions`
Tracks all user interactions with content.

```sql
- id: UUID (primary key)
- user_id: TEXT
- content_block_id: UUID (foreign key)
- interaction_type: TEXT (view, click, share, save, rate, complete)
- interaction_value: INTEGER
- interaction_context: JSONB
- created_at: TIMESTAMPTZ
```

#### `user_content_preferences`
Learned user preferences from behavior.

```sql
- id: UUID (primary key)
- user_id: TEXT (unique)
- preferred_domains: TEXT[]
- preferred_difficulty: TEXT
- preferred_content_types: TEXT[]
- favorite_topics: TEXT[]
- excluded_topics: TEXT[]
- preference_confidence: DECIMAL(3,2)
- last_updated: TIMESTAMPTZ
```

#### `content_recommendations`
AI-generated recommendation queue.

```sql
- id: UUID (primary key)
- user_id: TEXT
- content_block_id: UUID
- recommendation_score: DECIMAL(5,2)
- recommendation_reason: TEXT
- recommendation_type: TEXT (profile_match, behavioral, trending, related, seasonal)
- is_viewed: BOOLEAN
- is_actioned: BOOLEAN
- expires_at: TIMESTAMPTZ
```

#### `content_performance_metrics`
Daily performance tracking.

```sql
- id: UUID (primary key)
- content_block_id: UUID
- metric_date: DATE
- view_count: INTEGER
- click_count: INTEGER
- share_count: INTEGER
- save_count: INTEGER
- completion_rate: DECIMAL(5,2)
- avg_rating: DECIMAL(3,2)
- engagement_score: DECIMAL(5,2)
```

### Enhanced Content Blocks

**New Columns:**
```sql
- embedding: vector(1536) -- For semantic search
- search_tokens: tsvector -- For full-text search
- view_count: INTEGER
- recommendation_score: DECIMAL(5,2)
```

---

## 🔌 API Endpoints

### 1. Track Interaction
**POST** `/api/content/track`

Track user interactions with content.

**Request Body:**
```json
{
  "contentId": "uuid",
  "interactionType": "view|click|share|save|rate|complete",
  "interactionValue": 1
}
```

**Response:**
```json
{
  "success": true,
  "interactionId": "uuid",
  "message": "Interaction tracked successfully"
}
```

### 2. Get Personalized Content
**GET** `/api/content/personalized?limit=10`

Get personalized content recommendations.

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "content_id": "uuid",
      "title": "string",
      "domain": "string",
      "difficulty_level": "string",
      "content_rating": 4.5,
      "relevance_score": 6.2
    }
  ],
  "count": 10
}
```

### 3. Search Content
**GET** `/api/content/search?q=query&domain=finance&difficulty=intermediate&audience=military-member&minRating=3.0&limit=20`

Advanced semantic search with filters.

**Query Parameters:**
- `q`: Search query (required)
- `domain`: Filter by domain (optional)
- `difficulty`: Filter by difficulty level (optional)
- `audience`: Filter by target audience (optional)
- `minRating`: Minimum content rating (optional, default: 0)
- `limit`: Results limit (optional, default: 20)

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "content_id": "uuid",
      "title": "string",
      "domain": "string",
      "difficulty_level": "string",
      "content_rating": 4.0,
      "relevance_score": 0.85
    }
  ],
  "count": 20,
  "query": "retirement planning",
  "filters": {
    "domain": "finance",
    "difficulty": "intermediate",
    "audience": "military-member",
    "minRating": 3.0
  }
}
```

### 4. Get Related Content
**GET** `/api/content/related?id=uuid&limit=5`

Find similar content based on domain, difficulty, and audience.

**Response:**
```json
{
  "success": true,
  "related": [
    {
      "content_id": "uuid",
      "title": "string",
      "content_domain": "string",
      "similarity_score": 5.3
    }
  ],
  "count": 5
}
```

### 5. Get Trending Content
**GET** `/api/content/trending?days=7&limit=10`

Get trending content by engagement.

**Response:**
```json
{
  "success": true,
  "trending": [
    {
      "content_id": "uuid",
      "title": "string",
      "domain": "string",
      "total_views": 150,
      "total_engagement": 420,
      "trend_score": 85.5
    }
  ],
  "count": 10,
  "timeframe": "7 days"
}
```

---

## 💡 Usage Examples

### Frontend Integration

#### Track Page View
```typescript
const trackView = async (contentId: string) => {
  await fetch('/api/content/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentId,
      interactionType: 'view'
    })
  });
};
```

#### Get Personalized Recommendations
```typescript
const getRecommendations = async () => {
  const response = await fetch('/api/content/personalized?limit=10');
  const data = await response.json();
  return data.recommendations;
};
```

#### Search Content
```typescript
const searchContent = async (query: string, filters?: {
  domain?: string;
  difficulty?: string;
  audience?: string;
  minRating?: number;
}) => {
  const params = new URLSearchParams({
    q: query,
    ...filters
  });
  
  const response = await fetch(`/api/content/search?${params}`);
  const data = await response.json();
  return data.results;
};
```

#### Get Related Content
```typescript
const getRelated = async (contentId: string) => {
  const response = await fetch(`/api/content/related?id=${contentId}&limit=5`);
  const data = await response.json();
  return data.related;
};
```

---

## 🔍 Database Functions

### Core Functions

#### `get_personalized_content(user_id, limit)`
Returns personalized content based on user profile.

**Usage:**
```sql
SELECT * FROM get_personalized_content('user_123', 10);
```

#### `search_content(query, domain, difficulty, audience, min_rating, limit)`
Advanced search with filtering.

**Usage:**
```sql
SELECT * FROM search_content(
  'retirement planning',
  'finance',
  'intermediate',
  'military-member',
  3.0,
  20
);
```

#### `get_related_content(content_id, limit)`
Find similar content.

**Usage:**
```sql
SELECT * FROM get_related_content('uuid', 5);
```

#### `get_trending_content(days, limit)`
Get trending content.

**Usage:**
```sql
SELECT * FROM get_trending_content(7, 10);
```

#### `track_content_interaction(user_id, content_id, type, value)`
Track user interaction.

**Usage:**
```sql
SELECT track_content_interaction(
  'user_123',
  'content_uuid',
  'view',
  1
);
```

#### `generate_user_recommendations(user_id, count)`
Generate recommendation queue.

**Usage:**
```sql
SELECT generate_user_recommendations('user_123', 20);
```

#### `update_engagement_scores()`
Update all engagement scores (run daily).

**Usage:**
```sql
SELECT update_engagement_scores();
```

---

## 📈 Analytics Views

### `content_quality_overview`
Domain-level quality metrics.

**Columns:**
- `domain`
- `total_blocks`
- `high_quality_blocks` (rating ≥ 4.0)
- `fresh_content` (freshness ≥ 80)
- `connected_content` (has relationships)
- `avg_rating`
- `avg_freshness`
- `needs_review_soon`

### `content_discovery_index` (Materialized View)
Fast content discovery with search tokens.

**Refresh:**
```sql
REFRESH MATERIALIZED VIEW content_discovery_index;
```

### `content_performance_analytics`
Performance by domain, type, and difficulty.

### `audience_targeting_analysis`
Content distribution by audience segment.

### `content_maintenance_dashboard`
Quick overview of maintenance needs.

---

## 🎯 Personalization Logic

### Profile Matching Rules

#### PCS Content (3.0 bonus)
- User has `pcs_date` within 6 months
- Content domain is `pcs`

#### Career Content (3.0 bonus)
- User `service_status` is "Transitioning"
- Content domain is `career`

#### TSP Content (2.5 bonus)
- User `tsp_balance_range` is low ($0-$10k or None)
- Content title contains "tsp"

#### Debt Content (2.5 bonus)
- User has debt (`debt_amount_range` not "None" or "$0")
- Content title contains "debt" or "budget"

#### Family Content (2.0 bonus)
- User has children (`num_children` > 0)
- Content audience includes "family"

### Difficulty Matching

**Preferred Difficulty (1.5 bonus):**
- Content matches `content_difficulty_pref`

**Years of Service:**
- 0-5 years → beginner (1.0)
- 5-15 years → intermediate (1.0)
- 15+ years → advanced (1.0)
- Other → any (0.5)

---

## 🔒 Security

- All endpoints require Clerk authentication
- User ID from Clerk session used for personalization
- Rate limiting recommended for public endpoints
- Content interactions logged for audit trail

---

## 🚀 Performance

### Indexes
- IVFFlat on `embedding` for vector search
- GIN on `search_tokens` for full-text search
- B-tree on `recommendation_score`
- B-tree on `content_rating`
- Composite indexes on frequently filtered columns

### Optimization Tips
1. Refresh materialized views daily
2. Run `update_engagement_scores()` nightly
3. Clean up old recommendations (expired > 7 days)
4. Archive old performance metrics (> 90 days)

---

## 📊 Current Statistics

- **410 content blocks** with intelligence features
- **410 blocks** with search tokens
- **410 blocks** with difficulty levels
- **410 blocks** with audience targeting
- **74 blocks** with content relationships
- **5 domains** covered (finance, career, pcs, deployment, lifestyle)
- **6 audience segments** (military-member, spouse, family, veteran, officer, enlisted)

---

## 🎓 Future Enhancements

### Planned Features
- [ ] Vector embeddings for true semantic search (OpenAI embeddings)
- [ ] Collaborative filtering (users with similar profiles)
- [ ] Seasonal content promotion (tax season, PCS season, etc.)
- [ ] A/B testing framework for recommendations
- [ ] Email digest generation (top personalized content weekly)
- [ ] Content gap analysis (missing topics for user segments)
- [ ] Predictive analytics (anticipate user needs)

---

## 📝 Maintenance

### Daily Tasks
```sql
-- Update engagement scores
SELECT update_engagement_scores();

-- Refresh discovery index
REFRESH MATERIALIZED VIEW content_discovery_index;

-- Clean old recommendations
DELETE FROM content_recommendations WHERE expires_at < NOW() - INTERVAL '7 days';
```

### Weekly Tasks
```sql
-- Analyze popular content
SELECT * FROM get_trending_content(7, 20);

-- Check content quality
SELECT * FROM content_quality_overview;

-- Review maintenance needs
SELECT * FROM content_maintenance_dashboard;
```

### Monthly Tasks
```sql
-- Archive old metrics
DELETE FROM content_performance_metrics WHERE metric_date < CURRENT_DATE - 90;

-- Review user preferences
SELECT * FROM user_content_preferences ORDER BY last_updated DESC LIMIT 100;
```

---

## 🆘 Troubleshooting

### Low Recommendation Scores
- Ensure user profile is complete
- Check if content domains match user needs
- Verify content quality scores are accurate

### Slow Search Performance
- Refresh materialized views
- Check index usage: `EXPLAIN ANALYZE`
- Consider adding more specific indexes

### Missing Interactions
- Verify API endpoints are being called
- Check authentication is working
- Review error logs for failures

---

## 📚 Resources

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions)

---

**System Version:** 1.0.0  
**Last Updated:** October 15, 2025  
**Status:** Production Ready ✅


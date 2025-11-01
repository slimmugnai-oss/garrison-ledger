# CIRCUIT BREAKER INTEGRATION GUIDE

**For integrating circuit breakers into existing external API calls**

---

## EXAMPLE: Weather API with Circuit Breaker

### Before (No Protection):

```typescript
// lib/navigator/weather.ts
export async function fetchWeatherData(zipCode: string) {
  const response = await fetch(`https://api.weather.com/...`);
  
  if (!response.ok) {
    throw new Error('Weather API failed');
  }
  
  return await response.json();
}
```

**Problem:** If Weather API goes down, every request fails and slows down the entire app.

---

### After (With Circuit Breaker):

```typescript
// lib/navigator/weather.ts
import { circuitBreakers } from '@/lib/circuit-breaker';

export async function fetchWeatherData(zipCode: string) {
  // Define fallback data (cached or "unavailable" message)
  const fallback = {
    temperature: null,
    conditions: 'Data temporarily unavailable',
    status: 'circuit_open',
    provenance: {
      source: 'Google Weather',
      lastFetched: null,
      status: 'Service experiencing issues'
    }
  };

  // Execute with circuit breaker protection
  return await circuitBreakers.weather.execute(
    async () => {
      const response = await fetch(`https://api.weather.com/...`, {
        signal: AbortSignal.timeout(5000) // Enforces timeout
      });
      
      if (!response.ok) {
        throw new Error(`Weather API returned ${response.status}`);
      }
      
      return await response.json();
    },
    fallback // Returns this if circuit is OPEN
  );
}
```

**Benefits:**
- After 3 failures, circuit opens
- All requests return fallback immediately (no waiting)
- After 1 minute cooldown, tries again
- Automatic recovery when service restored

---

## INTEGRATION CHECKLIST

For each external API, add circuit breaker:

### 1. Weather API (`lib/navigator/weather.ts`)
- [ ] Import `circuitBreakers.weather`
- [ ] Wrap API call in `execute()`
- [ ] Define fallback data (cached or "unavailable")
- [ ] Test with API down

### 2. Housing API (`lib/navigator/housing.ts`)
- [ ] Import `circuitBreakers.housing`
- [ ] Wrap Zillow/RapidAPI calls
- [ ] Fallback: Use cached median rent
- [ ] Show staleness indicator

### 3. Schools API (`lib/navigator/schools.ts`)
- [ ] Import `circuitBreakers.schools`
- [ ] Wrap GreatSchools API calls
- [ ] Fallback: Show "Update in progress"
- [ ] Use last known scores

### 4. Gemini AI (`lib/ask/rag.ts`, `lib/les/parse.ts`)
- [ ] Import `circuitBreakers.gemini`
- [ ] Wrap AI API calls
- [ ] Fallback: Graceful error message
- [ ] Suggest alternatives (cached responses)

### 5. JTR Scraper (`lib/scrapers/*`)
- [ ] Import `circuitBreakers.jtr`
- [ ] Wrap scraper API calls
- [ ] Fallback: Use cached rates
- [ ] Alert admin via system_alerts

---

## TESTING CIRCUIT BREAKERS

### Test Circuit Opening:

```typescript
// Force failures to open circuit
for (let i = 0; i < 5; i++) {
  try {
    await fetchWeatherData('00000'); // Invalid ZIP - will fail
  } catch (error) {
    console.log(`Attempt ${i + 1}: ${error.message}`);
  }
}

// Check circuit state
const stats = circuitBreakers.weather.getStats();
console.log('Circuit state:', stats.state); // Should be 'OPEN'
```

### Test Fallback Behavior:

```typescript
// With circuit OPEN, should return fallback immediately
const result = await fetchWeatherData('valid_zip');
console.log(result.status); // Should be 'circuit_open'
```

### Test Recovery:

```typescript
// Wait for cooldown (1 minute)
await new Promise(resolve => setTimeout(resolve, 61000));

// Next request should try again (HALF_OPEN state)
const result = await fetchWeatherData('valid_zip');
console.log(result.status); // Should succeed if API is back
```

---

## MONITORING CIRCUIT BREAKERS

### Admin Dashboard Widget:

```typescript
// app/api/admin/circuit-breakers/route.ts
import { getAllCircuitBreakerStats } from '@/lib/circuit-breaker';

export async function GET() {
  const stats = getAllCircuitBreakerStats();
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    circuits: stats
  });
}
```

### Display in Admin UI:

```typescript
// Show circuit breaker status
{Object.entries(stats).map(([name, stat]) => (
  <div key={name}>
    <h3>{name}</h3>
    <Badge color={
      stat.state === 'CLOSED' ? 'green' :
      stat.state === 'HALF_OPEN' ? 'yellow' :
      'red'
    }>
      {stat.state}
    </Badge>
    <p>Failures: {stat.failures} / {threshold}</p>
    <p>Success Rate: {(stat.totalSuccesses / stat.totalRequests * 100).toFixed(1)}%</p>
  </div>
))}
```

---

## ALERTING

Circuit breaker automatically creates system alerts when opening:

```sql
-- Check for circuit breaker alerts
SELECT * FROM system_alerts
WHERE category = 'api'
AND message LIKE '%Circuit breaker%'
AND resolved = false
ORDER BY created_at DESC;
```

---

## FALLBACK DATA STRATEGIES

### Strategy 1: Use Cached Data
```typescript
const fallback = {
  ...cachedData,
  status: 'stale',
  cacheAge: Date.now() - cachedData.timestamp
};
```

### Strategy 2: Graceful Degradation
```typescript
const fallback = {
  data: null,
  status: 'unavailable',
  message: 'Service temporarily unavailable. Please try again in a few minutes.'
};
```

### Strategy 3: Alternative Source
```typescript
const fallback = await fetchFromBackupAPI();
```

---

## INTEGRATION PRIORITY

1. **HIGH:** Gemini AI (most expensive, affects LES parsing)
2. **MEDIUM:** Weather API (user-facing, but not critical)
3. **MEDIUM:** Housing API (premium feature, has cache)
4. **LOW:** Schools API (premium feature, has cache)
5. **LOW:** JTR Scraper (cron job, low frequency)

---

**Status:** Circuit breaker framework created  
**Next:** Integrate into external API calls (4-6 hours)  
**Files:** `lib/circuit-breaker.ts`, `sentry.*.config.ts`


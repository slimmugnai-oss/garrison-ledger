<!-- d11abf46-7e0b-42f0-af9a-2a0b081b6803 ba7e4702-87ea-4623-924e-4c43d08e9c57 -->
# LES Tax Enhancement & Ask Assistant Personalization

## Part 1: LES Auditor Tax Enhancements

### Problem

Currently, users manually enter all tax fields (Federal, State, FICA, Medicare) with no validation or assistance. FICA and Medicare are fixed formulas (6.2% and 1.45% of taxable gross) that should be auto-calculated.

### Solution

#### 1. Auto-Calculate FICA & Medicare (Editable with Validation)

**File: `app/components/les/LesManualEntryTabbed.tsx`**

Add calculation effect when taxable gross changes:

```typescript
// Add after other useEffects (~line 100)
useEffect(() => {
  // Calculate taxable gross (excludes BAH/BAS)
  const taxableGross = 
    parseFloat(basePay || '0') +
    parseFloat(cola || '0') +
    parseFloat(sdap || '0') +
    parseFloat(hfpIdp || '0') +
    parseFloat(fsa || '0') +
    parseFloat(flpp || '0');
  
  if (taxableGross > 0) {
    // Auto-fill FICA (6.2%)
    if (!fica || parseFloat(fica) === 0) {
      const calculatedFica = (taxableGross * 0.062).toFixed(2);
      setFica(calculatedFica);
      setAutoFilled(prev => ({ ...prev, fica: true }));
    }
    
    // Auto-fill Medicare (1.45%)
    if (!medicare || parseFloat(medicare) === 0) {
      const calculatedMedicare = (taxableGross * 0.0145).toFixed(2);
      setMedicare(calculatedMedicare);
      setAutoFilled(prev => ({ ...prev, medicare: true }));
    }
  }
}, [basePay, cola, sdap, hfpIdp, fsa, flpp]);
```

Update FICA/Medicare inputs to show they're calculated:

```typescript
// In Taxes tab section (~line 600)
<div className="space-y-4">
  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
    <div className="flex items-start gap-2">
      <Icon name="Info" className="h-4 w-4 text-blue-600 mt-0.5" />
      <div className="text-xs text-blue-800">
        <strong>FICA and Medicare are auto-calculated</strong> based on your taxable gross pay. 
        You can edit these if your LES shows different amounts (rare).
      </div>
    </div>
  </div>
  
  {/* FICA Input */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      FICA (Social Security)
      {autoFilled.fica && (
        <span className="ml-2 text-xs text-green-600">✓ Calculated (6.2%)</span>
      )}
    </label>
    <CurrencyInput
      value={fica}
      onChange={setFica}
      placeholder="Auto-calculated"
      className={autoFilled.fica ? 'bg-green-50 border-green-300' : ''}
    />
  </div>
  
  {/* Medicare Input */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Medicare
      {autoFilled.medicare && (
        <span className="ml-2 text-xs text-green-600">✓ Calculated (1.45%)</span>
      )}
    </label>
    <CurrencyInput
      value={medicare}
      onChange={setMedicare}
      placeholder="Auto-calculated"
      className={autoFilled.medicare ? 'bg-green-50 border-green-300' : ''}
    />
  </div>
</div>
```

#### 2. Add Tax Reasonableness Validation

**File: `app/api/les/audit/route.ts`** (create if doesn't exist, or find existing audit endpoint)

Add validation logic:

```typescript
interface TaxValidation {
  isReasonable: boolean;
  warnings: string[];
  advisories: string[];
}

function validateTaxes(
  federalTax: number,
  stateTax: number,
  fica: number,
  medicare: number,
  taxableGross: number,
  userState?: string
): TaxValidation {
  const result: TaxValidation = {
    isReasonable: true,
    warnings: [],
    advisories: []
  };
  
  // Validate FICA (should be exactly 6.2%)
  const expectedFica = taxableGross * 0.062;
  if (Math.abs(fica - expectedFica) > 5) {
    result.warnings.push(
      `FICA is $${fica.toFixed(2)} but expected $${expectedFica.toFixed(2)} (6.2% of taxable gross). Check your LES.`
    );
  }
  
  // Validate Medicare (should be exactly 1.45%)
  const expectedMedicare = taxableGross * 0.0145;
  if (Math.abs(medicare - expectedMedicare) > 2) {
    result.warnings.push(
      `Medicare is $${medicare.toFixed(2)} but expected $${expectedMedicare.toFixed(2)} (1.45% of taxable gross). Check your LES.`
    );
  }
  
  // Federal tax reasonableness (8-22% typical)
  const federalPercent = (federalTax / taxableGross) * 100;
  if (federalPercent < 5) {
    result.advisories.push(
      `Your federal tax (${federalPercent.toFixed(1)}%) seems low. Typical range: 10-15%. This might be correct if you have many exemptions.`
    );
  } else if (federalPercent > 25) {
    result.advisories.push(
      `Your federal tax (${federalPercent.toFixed(1)}%) seems high. Typical range: 10-15%. This might be correct if you requested additional withholding.`
    );
  }
  
  // State tax reasonableness (depends on state)
  if (userState && stateTax > 0) {
    const statePercent = (stateTax / taxableGross) * 100;
    const stateRanges: Record<string, { min: number; max: number }> = {
      CA: { min: 1, max: 10 },
      NY: { min: 4, max: 8 },
      TX: { min: 0, max: 0 },
      FL: { min: 0, max: 0 },
      // Add more states as needed
    };
    
    const range = stateRanges[userState];
    if (range && statePercent > range.max * 1.5) {
      result.advisories.push(
        `Your ${userState} state tax (${statePercent.toFixed(1)}%) seems high. Typical range: ${range.min}-${range.max}%.`
      );
    }
  }
  
  // Total tax burden check (shouldn't exceed 35%)
  const totalTaxes = federalTax + stateTax + fica + medicare;
  const totalPercent = (totalTaxes / taxableGross) * 100;
  if (totalPercent > 35) {
    result.warnings.push(
      `Total tax burden is ${totalPercent.toFixed(1)}% - higher than typical 25-30%. Verify all amounts with your LES.`
    );
  }
  
  return result;
}
```

#### 3. Add AI Explanations for Tax Advisories

**File: `lib/les/tax-advisor.ts`** (new file)

```typescript
import { ssot } from '@/lib/ssot';

export async function generateTaxAdvisory(
  type: 'federal' | 'state' | 'fica' | 'medicare' | 'total',
  userValue: number,
  expectedValue: number,
  taxableGross: number,
  rank?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return '';

  const prompt = buildTaxAdvisoryPrompt(type, userValue, expectedValue, taxableGross, rank);
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500, // Brief explanation
        },
      }),
    }
  );

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function buildTaxAdvisoryPrompt(
  type: string,
  userValue: number,
  expectedValue: number,
  taxableGross: number,
  rank?: string
): string {
  const percent = ((userValue / taxableGross) * 100).toFixed(1);
  const expectedPercent = ((expectedValue / taxableGross) * 100).toFixed(1);
  
  return `You are a military financial advisor. A service member ${rank ? `(${rank})` : ''} has a ${type} tax withholding that differs from typical amounts.

Their ${type} tax: $${userValue.toFixed(2)} (${percent}% of gross)
Expected typical: $${expectedValue.toFixed(2)} (${expectedPercent}% of gross)
Taxable gross: $${taxableGross.toFixed(2)}

Provide a brief 4-6 sentence explanation covering:
1. Why this might be happening (W-4 settings, YTD catch-up, bonuses, etc.)
2. Whether this is concerning or normal
3. What they should do next (check W-4, contact finance, verify LES)

Write in a conversational, reassuring tone. Be specific and actionable. Do NOT use markdown or formatting - just plain text.`;
}
```

## Part 2: Ask Assistant Personalization Fix

### Problem

The Ask Assistant is generating generic examples instead of using the actual user's profile data (rank, location, dependents) to provide personalized answers.

**Current behavior:**

```
"Based on the 2025 rates, if you were, for example, an E-5 with dependents..."
```

**Expected behavior:**

```
"Based on your profile (E-5 with dependents in El Paso), your BAH is $1,773/month."
```

### Root Cause

The `lib/ask/data-query-engine.ts` extracts user profile data but the AI prompt doesn't explicitly instruct Gemini to USE this personalized data in its response.

### Solution

#### 1. Enhance User Profile Query

**File: `lib/ask/data-query-engine.ts`**

Update `queryOfficialSources` to return user profile as a data source:

```typescript
export async function queryOfficialSources(
  question: string,
  userId: string
): Promise<DataSource[]> {
  const sources: DataSource[] = [];
  
  // FIRST: Get user profile data
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id, paygrade, mha_or_zip, years_of_service, has_dependents, dependents_count, rank, branch')
    .eq('user_id', userId)
    .maybeSingle();
  
  // Add user profile as a data source for personalization
  if (profile) {
    sources.push({
      table: 'user_profile',
      source_name: 'User Profile',
      url: '/dashboard/profile',
      effective_date: new Date().toISOString().split('T')[0],
      data: {
        paygrade: profile.paygrade,
        rank: profile.rank,
        mha_or_zip: profile.mha_or_zip,
        years_of_service: profile.years_of_service,
        has_dependents: profile.has_dependents,
        dependents_count: profile.dependents_count,
        branch: profile.branch
      }
    });
  }
  
  const entities = extractEntities(question, userId);
  
  // Continue with existing queries...
  // (rest of function unchanged)
}
```

#### 2. Update AI Prompt to Prioritize Personalization

**File: `app/api/ask/submit/route.ts`**

Update `buildPrompt` function to emphasize using user profile:

```typescript
function buildPrompt(
  question: string,
  contextData: DataSource[],
  mode: string,
  maxTokens: number
): string {
  // Check if user profile is in context
  const userProfile = contextData.find(source => source.table === 'user_profile');
  const hasUserProfile = !!userProfile;
  
  const basePrompt = `You are an expert military financial and lifestyle advisor with comprehensive knowledge of:
- Military pay, allowances, and benefits (BAH, BAS, TSP, SGLI, etc.)
- PCS moves, deployments, and TDY
- VA benefits, GI Bill, and military spouse resources
- Military bases, installations, and OCONUS assignments
- Career progression, retirement systems (BRS vs High-3)
- Military culture, regulations, and lifestyle

${hasUserProfile ? `
**CRITICAL: You have access to the user's actual profile data. Use it to personalize your answer.**

User Profile:
- Rank/Paygrade: ${userProfile?.data.rank || userProfile?.data.paygrade || 'Unknown'}
- Location (MHA/ZIP): ${userProfile?.data.mha_or_zip || 'Not set'}
- Years of Service: ${userProfile?.data.years_of_service || 'Unknown'}
- Dependents: ${userProfile?.data.has_dependents ? `Yes (${userProfile?.data.dependents_count || 1})` : 'No'}
- Branch: ${userProfile?.data.branch || 'Unknown'}

When answering:
1. Use their ACTUAL rank, location, and dependent status - not hypothetical examples
2. Say "Based on your profile" or "For you as an E-5 with dependents"
3. If they ask about "my BAH" or "my pay", use THEIR specific data from the sources below
4. If their profile is incomplete, tell them to update it at /dashboard/profile
5. DO NOT say "if you were an E-5" - they ARE what their profile says they are
` : ''}

QUESTION: ${question}

${mode === "strict" ? "OFFICIAL DATA AVAILABLE:" : "ADVISORY MODE - Using expert knowledge:"}
${contextData
  .map(
    (source) => `
Source: ${source.source_name}
URL: ${source.url}
Effective: ${source.effective_date}
Data: ${JSON.stringify(source.data, null, 2)}
`
  )
  .join("\n")}

ANSWER GUIDELINES:
1. ${mode === "strict" ? "Prioritize provided data sources and cite them" : "Use your comprehensive military knowledge"}
2. ${hasUserProfile ? "**PERSONALIZE using their actual profile data - not hypothetical examples**" : "Provide general guidance"}
3. Write conversationally - imagine explaining this to a friend over coffee
4. Be comprehensive (200-400 words) but start with the most important info (BLUF)
5. Include specific numbers, dates, regulations, and real-world examples
6. Acknowledge challenges ("Yes, this is confusing" or "You're not alone in this")
7. Suggest relevant Garrison Ledger tools (PCS Copilot, Base Navigator, LES Auditor, TSP Modeler)
8. Provide verification steps for users to confirm information
9. You have ${maxTokens} tokens - use them to be thorough and helpful
10. CRITICAL: Return ONLY valid JSON, no markdown formatting, no explanatory text

RESPONSE FORMAT - Return this EXACT JSON structure (no markdown, no code blocks):
{
  "bottomLine": ["Most important point first (use their ACTUAL profile data)", "Second key point", "Third key point", "Additional detail or context"],
  "nextSteps": [{"text": "Specific action to take", "action": "Button text", "url": "optional_url"}],
  "numbersUsed": [{"value": "Specific amount or rate", "source": "Source Name", "effective_date": "YYYY-MM-DD"}],
  "citations": [{"title": "Source Title", "url": "Source URL"}],
  "verificationChecklist": ["How to verify this info", "Where to check official sources", "Who to ask if unsure"],
  "toolHandoffs": [{"tool": "PCS Copilot", "url": "/dashboard/pcs-copilot", "description": "Calculate exact PCS costs and see what you'll actually get"}]
}

${mode === "advisory" ? "ADVISORY MODE: You're operating on expert knowledge without specific official data. Be helpful and conversational but encourage users to verify with official sources. Suggest relevant Garrison Ledger tools that might have the data they need." : "STRICT MODE: Use provided official data as primary source. Supplement with context, explanation, and practical advice in a conversational tone."}

EXAMPLE GOOD RESPONSE (with profile):
"Based on your profile (E-5 with dependents in El Paso, TX), your BAH for 2025 is $1,773 per month. This rate is effective January 1, 2025, and is designed to cover your housing costs in the El Paso area. Your specific rate accounts for your rank (E-5) and the fact that you have dependents."

NOT THIS (generic example):
"If you were an E-5 with dependents in El Paso, your BAH would be $1,773/month."

REMINDER: Return ONLY the JSON object above. Do not wrap it in markdown code blocks or add any explanatory text.`;

  return basePrompt;
}
```

## Testing Plan

### LES Tax Enhancements

1. Create new LES entry with entitlements
2. Navigate to Taxes tab
3. Verify FICA and Medicare are auto-calculated and highlighted
4. Submit audit
5. Check for tax validation warnings/advisories
6. Verify AI explanations are generated for flagged items

### Ask Assistant Personalization

1. Ensure profile has: rank (E-5), location (El Paso), dependents (Yes)
2. Ask: "What is my BAH?"
3. Verify answer says: "Based on your profile (E-5 with dependents in El Paso)..." NOT "if you were"
4. Ask: "How much is my base pay?"
5. Verify personalized response with actual rank
6. Test with incomplete profile (missing rank) - should prompt to update profile

## Documentation Updates

Update:

- `docs/LES_AUDITOR_TESTING_GUIDE.md` - Add tax auto-calculation section
- `docs/ASK_ASSISTANT_TESTING_GUIDE.md` - Add personalization verification
- `SYSTEM_STATUS.md` - Note LES tax enhancements and Ask personalization fix

### To-dos

- [ ] Add auto-calculation effect for FICA (6.2%) and Medicare (1.45%) in LesManualEntryTabbed.tsx
- [ ] Update Taxes tab UI to show FICA/Medicare are calculated with green highlight and info banner
- [ ] Create tax validation logic (FICA/Medicare exact, Federal/State reasonableness) in audit API route
- [ ] Create lib/les/tax-advisor.ts with AI explanation generation for flagged tax items
- [ ] Add user profile as a data source in queryOfficialSources (data-query-engine.ts)
- [ ] Update buildPrompt in ask/submit/route.ts to emphasize using actual user profile data, not hypothetical examples
- [ ] Test LES tax auto-calculation, validation warnings, and AI explanations
- [ ] Test Ask Assistant with complete profile, verify personalized responses (not 'if you were')
- [ ] Update LES and Ask testing guides, SYSTEM_STATUS.md with new features
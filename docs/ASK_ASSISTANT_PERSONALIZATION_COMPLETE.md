# Ask Assistant - Full Personalization Architecture

**Status:** ✅ **FULLY IMPLEMENTED & DEPLOYED**  
**Last Updated:** 2025-01-24  
**Version:** 6.1.0

---

## 🎯 **Core Philosophy**

> "The AI should know the person they're talking to - whether answering templates or custom questions."

Every answer from the Ask Assistant is **fully personalized** using the user's complete profile data. No generic "if you were an E-5" responses - the AI speaks directly to **their** rank, **their** location, **their** family situation.

---

## 📊 **Complete Data Flow**

### **1. User Profile Data Collection** (`lib/ask/data-query-engine.ts`)

**ALWAYS the first data source queried:**

```typescript
// Step 1: Get user profile data for personalization (FIRST!)
const { data: profile } = await supabase
  .from("user_profiles")
  .select(
    "user_id, paygrade, mha_code, current_base, years_of_service, has_dependents, dependents_count, rank, branch"
  )
  .eq("user_id", userId)
  .maybeSingle();

// Add user profile as a data source for personalization
if (profile) {
  sources.push({
    table: "user_profile",
    source_name: "User Profile",
    url: "/dashboard/profile",
    effective_date: new Date().toISOString().split("T")[0],
    data: {
      paygrade: profile.paygrade,           // E01, O03, W02, etc.
      rank: profile.rank,                   // "Private (PV1)", "Captain", etc.
      mha_code: profile.mha_code,           // TX279 (Fort Bliss)
      current_base: profile.current_base,   // "Fort Bliss"
      years_of_service: profile.years_of_service,
      has_dependents: profile.has_dependents,
      dependents_count: profile.dependents_count,
      branch: profile.branch                // Army, Navy, etc.
    },
  });
}
```

**This profile data is included in EVERY API call**, regardless of whether the question is a template or custom.

---

### **2. AI Prompt Injection** (`app/api/ask/submit/route.ts`)

The AI receives the user's profile in **every prompt**:

```typescript
const userProfile = contextData.find((source) => source.table === "user_profile");
const hasUserProfile = !!userProfile;

${hasUserProfile ? `
**CRITICAL: You have access to the user's actual profile data. Use it to personalize your answer.**

User Profile:
- Rank/Paygrade: ${userProfile?.data.rank || userProfile?.data.paygrade || "Unknown"}
- Location: ${userProfile?.data.current_base || userProfile?.data.mha_code || "Not set"}
- Years of Service: ${userProfile?.data.years_of_service || "Unknown"}
- Dependents: ${userProfile?.data.has_dependents ? `Yes (${userProfile?.data.dependents_count || 1})` : "No"}
- Branch: ${userProfile?.data.branch || "Unknown"}

When answering:
1. Use their ACTUAL rank, location, and dependent status - not hypothetical examples
2. Say "Based on your profile" or "For you as an ${userProfile?.data.paygrade || userProfile?.data.rank} with dependents"
3. If they ask about "my BAH" or "my pay", use THEIR specific data from the sources below
4. If their profile is incomplete, tell them to update it at /dashboard/profile
5. DO NOT say "if you were an E-5" - they ARE what their profile says they are
` : ""}
```

**Key Enforcement Rules:**
- ✅ "Based on your profile (E-1 with dependents at Fort Bliss), your BAH is $1,647/month"
- ❌ "If you were an E-5 with dependents in El Paso, your BAH would be $1,773"

---

### **3. Template Questions** (`app/api/ask/templates/route.ts`)

Templates are **pre-personalized** when the user has profile data, but the AI **still personalizes the answer** regardless:

**Generic Templates:**
```typescript
{
  id: "bah_lookup",
  text: "What's my BAH rate?",
  category: "BAH",
  personalized: false,  // Question text not personalized
}
```

**Profile-Based Templates:**
```typescript
if (profile?.rank && profile?.current_base) {
  personalizedTemplates.push({
    id: "personal_bah",
    text: `What's my BAH as ${profile.rank} at ${profile.current_base}?`,
    category: "BAH",
    personalized: true,  // Question text IS personalized
  });
}
```

**CRITICAL:** Even if the template question text is generic ("What's my BAH rate?"), the **AI answer is ALWAYS personalized** because the profile data is injected into the prompt.

---

## 🧠 **Personalization Examples**

### **Example 1: BAH Question (Template)**

**User Profile:**
- Rank: Private (PV1)
- Paygrade: E01
- Base: Fort Bliss
- Location: TX279
- Dependents: Yes (1 child)

**Question:** "What's my BAH rate?" *(Generic template)*

**AI Answer:**
```
Based on your profile (E-1 with dependents at Fort Bliss), your BAH is $1,647 per month 
effective January 1, 2025. This is the with-dependents rate for the El Paso area (MHA TX279).

Your BAH helps cover your housing costs in the local area. Since you have a dependent, 
you receive the higher "with dependents" rate regardless of how many dependents you have.
```

**NOT:**
```
BAH rates depend on paygrade, location, and dependency status. If you were an E-5 with 
dependents in El Paso, your BAH would be $1,773...
```

---

### **Example 2: TSP Contribution (Custom Question)**

**User Profile:**
- Rank: Staff Sergeant (E-6)
- Years of Service: 8
- Dependents: Yes (2 children)
- Branch: Army

**Question:** "How much should I put into TSP?" *(Custom, not template)*

**AI Answer:**
```
Hey there! As an E-6 with 8 years of service, here's my take on your TSP strategy:

At a minimum, contribute at least 5% to get the full BRS match - that's free money. 
With your base pay and 8 years in, that's roughly $230/month contribution to max 
out the match.

But ideally, if your family budget allows with two kids, aim for 10-15% total. 
That would put you at $460-690/month, which sets you up really well for retirement...
```

**NOT:**
```
TSP contributions depend on your personal financial situation. Most financial advisors 
recommend contributing at least 5% to get the match if you're in the BRS system...
```

---

### **Example 3: Deployment Pay (Template)**

**User Profile:**
- Rank: Specialist (E-4)
- Branch: Army
- Years of Service: 3

**Question:** "What special pays do I get on deployment?" *(Generic template)*

**AI Answer:**
```
As an E-4 with 3 years of service deploying to a combat zone, here's what you can expect:

1. **Hostile Fire Pay (HFP):** $225/month (prorated)
2. **Family Separation Allowance (FSA):** $250/month (after 30 days)
3. **Hardship Duty Pay:** Varies by location ($50-150/month)
4. **Combat Zone Tax Exclusion (CZTE):** Your entire base pay is tax-free

Plus, you'll have access to the Savings Deposit Program (SDP) - 10% guaranteed 
interest on up to $10,000. That's $1,000 free money per year...
```

---

## 🔍 **How to Verify Personalization**

### **Test Checklist:**

1. **Profile Setup:**
   - Go to `/dashboard/profile/setup`
   - Fill in: Rank, Paygrade, Base, Years of Service, Dependents

2. **Test Generic Template:**
   - Ask: "What's my BAH rate?"
   - ✅ Should say: "Based on your profile (E-1 with dependents at Fort Bliss)..."
   - ❌ Should NOT say: "If you were an E-5..." or "BAH depends on..."

3. **Test Custom Question:**
   - Type: "How much should I contribute to TSP?"
   - ✅ Should reference YOUR rank and years of service
   - ❌ Should NOT use generic examples

4. **Test Deployment Question:**
   - Ask: "What special pays do I get on deployment?"
   - ✅ Should mention YOUR paygrade and branch
   - ❌ Should NOT say "service members receive..."

---

## 🛠️ **Technical Implementation**

### **Key Files:**

| File | Purpose | Status |
|------|---------|--------|
| `lib/ask/data-query-engine.ts` | Fetches user profile FIRST | ✅ Uses `mha_code` |
| `app/api/ask/submit/route.ts` | Injects profile into AI prompt | ✅ Personalization enforced |
| `app/api/ask/templates/route.ts` | Generates template questions | ✅ Some pre-personalized |

### **Database Schema:**

```sql
-- user_profiles table
user_id           text PRIMARY KEY
rank              text              -- "Private (PV1)"
paygrade          text              -- "E01" (correct format!)
mha_code          text              -- "TX279" (NOT mha_or_zip!)
current_base      text              -- "Fort Bliss"
years_of_service  integer           -- 5
has_dependents    boolean           -- true
dependents_count  integer           -- 1
branch            text              -- "Army"
```

---

## 🚨 **Common Issues & Fixes**

### **Issue 1: Generic "If you were" Responses**

**Symptom:** AI says "If you were an E-5..." instead of using actual profile

**Causes:**
- ❌ Profile data not fetched (wrong column name)
- ❌ Profile incomplete (missing rank/paygrade)
- ❌ Prompt not enforcing personalization

**Fix:**
1. Verify profile data is fetched: Check `data-query-engine.ts` uses correct column names
2. Check user profile is complete: Query `user_profiles` table
3. Confirm prompt injection: Check `hasUserProfile` is true in `ask/submit/route.ts`

---

### **Issue 2: Wrong BAH/Pay Numbers**

**Symptom:** AI provides incorrect BAH for user's location

**Causes:**
- ❌ Wrong MHA code in profile (TX085 instead of TX279)
- ❌ Wrong paygrade format (E-1 instead of E01)
- ❌ Data query engine not using profile location

**Fix:**
1. Verify MHA code: `SELECT mha_code FROM user_profiles WHERE user_id = '...'`
2. Verify paygrade format: Should be `E01`, not `E-1`
3. Check base-to-MHA mapping: `lib/data/base-mha-map.json`

---

### **Issue 3: Profile Data Not Loading**

**Symptom:** AI answers generically even though profile is complete

**Causes:**
- ❌ Column name mismatch (`mha_or_zip` vs `mha_code`)
- ❌ Query returning null
- ❌ RLS policy blocking access

**Fix:**
```sql
-- Test query
SELECT user_id, paygrade, mha_code, current_base, years_of_service, has_dependents
FROM user_profiles
WHERE user_id = 'user_343xVqjkdILtBkaYAJfE5H8Wq0q';

-- Should return complete profile, not null
```

---

## 📈 **Future Enhancements**

### **Phase 2: Enhanced Personalization**

1. **Spouse-Specific Responses:**
   - Detect military spouse vs service member
   - Adjust tone and examples accordingly
   - "As a military spouse at Fort Bliss..." vs "As an E-5 at Fort Bliss..."

2. **Deployment Status:**
   - Add `deployment_status` to profile
   - Tailor SDP/CZTE advice based on current deployment

3. **Career Goals:**
   - Add `career_goal` (stay 20, separate early, etc.)
   - Adjust retirement advice based on goals

4. **Financial Context:**
   - Add `debt_level`, `savings_goal` to profile
   - Tailor TSP/investment advice based on debt situation

---

## 🎯 **Success Criteria**

✅ **100% of answers use actual profile data when available**  
✅ **Zero "if you were" or "for example" generic responses**  
✅ **Correct numbers (BAH, pay) based on user's rank/location**  
✅ **Conversational tone referencing user's actual situation**  
✅ **Works for both template and custom questions**

---

## 📝 **Deployment Notes**

**Latest Fixes (2025-01-24):**
- ✅ Fixed column name: `mha_or_zip` → `mha_code`
- ✅ Added `current_base` to profile query
- ✅ Updated AI prompt to use correct fields
- ✅ Removed duplicate `taxValidation` declaration

**Deployed Commits:**
1. `5b042a3` - Build fix (Suspense boundary)
2. `8032aa3` - LES Tax Enhancements
3. `cde9a9b` - Ask Assistant personalization fix (mha_code)
4. `dcc14c5` - Build error fix (duplicate removal)

**Status:** ✅ **Live on Production**

---

**End of Documentation**


# 🗑️ Base Navigator Cache Clearing

## ✅ AUTOMATED METHOD (Recommended)

### Option 1: API Endpoint
Simply visit this URL while logged in:

**Production:**
```
https://www.garrisonledger.com/api/admin/clear-navigator-cache
```

**Response:**
```json
{
  "success": true,
  "message": "Base Navigator cache cleared successfully",
  "remaining": {
    "neighborhood_profiles": 0,
    "base_external_data_cache": 0
  },
  "note": "Next Base Navigator run will use new school counting logic (v4)"
}
```

**Requirements:**
- Must be logged in (Clerk authentication)
- Works on any device/browser
- Safe & verified

---

## 📝 MANUAL METHOD (If Needed)

### Option 2: Supabase SQL Editor
If you prefer manual SQL execution:

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Paste this SQL:

```sql
-- Clear all cached neighborhood data
DELETE FROM neighborhood_profiles WHERE created_at < NOW();
DELETE FROM base_external_data_cache WHERE created_at < NOW();

-- Verify (should show 0 or very few)
SELECT COUNT(*) as remaining FROM neighborhood_profiles;
SELECT COUNT(*) as remaining FROM base_external_data_cache;
```

3. Click "Run"
4. Verify counts show 0

---

## 🔄 WHEN TO CLEAR CACHE

Clear cache after:
- ✅ Deploying new school counting logic
- ✅ Fixing verbiage/accuracy issues
- ✅ Updating intelligence algorithms
- ✅ Changing data sources or APIs
- ✅ Testing new features

---

## 📋 VERIFICATION

After clearing cache:

1. **Hard refresh browser:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Run Base Navigator** for any base (e.g., JBLM, Pendleton)
3. **Check Schools tab:**
   - ✅ No duplicate schools
   - ✅ Accurate counts ("2 schools in area" matches reality)
   - ✅ Perfect grammar ("1 school" not "1 schools")
4. **Check Housing tab:**
   - ✅ Property cards with photos show
   - ✅ Links work

---

## 🚨 TROUBLESHOOTING

### Cache not clearing?
- Verify you're logged in
- Try incognito window
- Check Supabase connection
- Run manual SQL method

### Still seeing old data?
- Clear browser cache (full clear, not just refresh)
- Check that deployment completed (Vercel)
- Verify cache version bumped (should be v4)

---

## 🎯 CURRENT STATUS

**School Counting:** v4 (unique schools, no duplicates)
**Cache Keys:**
- `sd:zip:v4:{zip}` - Schools data
- `gplaces:enhanced:v1:{zip}` - Amenities
- `zillow:listings:v2:{zip}:b{beds}` - Housing

**Last Major Fix:** Schools verbiage audit + unique counting (Oct 31, 2025)


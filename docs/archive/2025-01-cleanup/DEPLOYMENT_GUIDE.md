# 🚀 DEPLOYMENT GUIDE - Calculator Enhancements

## ⚠️ IMPORTANT: Database Migrations Required!

The calculator enhancements **will not work** until you deploy the database migrations to Supabase. Here's how:

---

## 📋 **STEP-BY-STEP DEPLOYMENT**

### **1. Open Supabase SQL Editor**
1. Go to https://supabase.com/dashboard
2. Select your Garrison Ledger project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### **2. Run Migrations in Order**

Copy and paste each migration file into the SQL Editor and click "Run":

#### **Migration 1: Calculator Scenarios (Comparison Mode)**
```bash
File: supabase-migrations/20250117_calculator_scenarios.sql
```
- Creates `calculator_scenarios` table
- Adds `get_user_scenarios()` function
- Adds `count_user_scenarios()` function
- **Enables comparison mode feature**

#### **Migration 2: Calculator Insights (AI Recommendations)**
```bash
File: supabase-migrations/20250117_calculator_insights.sql
```
- Creates `calculator_usage_log` table
- Creates `user_calculator_profile` table
- Creates `ai_recommendations` table
- Adds 3 analytics functions
- **Enables AI recommendation engine**

#### **Migration 3: Spouse Collaboration**
```bash
File: supabase-migrations/20250117_spouse_collaboration.sql
```
- Creates `spouse_connections` table
- Creates `shared_calculator_data` table
- Creates `collaboration_settings` table
- Adds 4 collaboration functions
- **Enables spouse pairing feature**

#### **Migration 4: Analytics Tracking**
```bash
File: supabase-migrations/20250117_analytics_tracking.sql
```
- Creates `analytics_events` table
- Adds 3 analytics functions
- **Enables comprehensive tracking**

---

## ✅ **VERIFY DEPLOYMENT**

After running all 4 migrations, verify they succeeded:

### **Check Tables Exist:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'calculator_scenarios',
    'calculator_usage_log',
    'user_calculator_profile',
    'ai_recommendations',
    'spouse_connections',
    'shared_calculator_data',
    'collaboration_settings',
    'analytics_events'
  );
```

You should see all 9 tables listed.

### **Check Functions Exist:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'get_user_scenarios',
    'count_user_scenarios',
    'generate_connection_code',
    'get_spouse_connection',
    'update_user_calculator_profile',
    'get_user_insights',
    'get_calculator_completion_rates',
    'get_conversion_funnel'
  );
```

You should see all functions listed.

---

## 🎯 **WHAT EACH FEATURE REQUIRES:**

| Feature | Migration Required | Status |
|---------|-------------------|--------|
| Save Scenarios | ✅ Migration 1 | Required |
| Comparison Mode | ✅ Migration 1 | Required |
| AI Recommendations | ✅ Migration 2 | Required |
| Financial Dashboard | ✅ Migration 2 | Required |
| Spouse Collaboration | ✅ Migration 3 | Required |
| Analytics Tracking | ✅ Migration 4 | Required |

---

## 🐛 **TROUBLESHOOTING:**

### **"Failed to save scenario" error:**
**Cause:** Migration 1 not deployed  
**Fix:** Run `20250117_calculator_scenarios.sql` in Supabase

### **"No recommendations" showing:**
**Cause:** Migration 2 not deployed  
**Fix:** Run `20250117_calculator_insights.sql` in Supabase

### **"Invalid code" when pairing spouse:**
**Cause:** Migration 3 not deployed  
**Fix:** Run `20250117_spouse_collaboration.sql` in Supabase

### **Analytics dashboard empty:**
**Cause:** Migration 4 not deployed  
**Fix:** Run `20250117_analytics_tracking.sql` in Supabase

---

## 🎉 **AFTER DEPLOYMENT:**

Once all migrations are deployed, test these features:

1. ✅ Save a scenario in TSP calculator
2. ✅ Compare 2 scenarios side-by-side
3. ✅ Download a PDF report
4. ✅ Email results to yourself
5. ✅ Generate a share link
6. ✅ Complete 5 calculators → see AI recommendations
7. ✅ Invite spouse with code
8. ✅ View analytics dashboard (admin only)

---

## 💡 **IMPORTANT NOTES:**

- Migrations are **idempotent** (safe to run multiple times)
- All tables have **RLS policies** (secure by default)
- Functions use **SECURITY DEFINER** (run with proper permissions)
- Free users can save **3 scenarios per tool**
- Premium users get **unlimited scenarios**

---

## 🆘 **NEED HELP?**

If migrations fail:
1. Check Supabase logs for error details
2. Ensure you're using the Service Role (not anon key)
3. Verify your Supabase project is active
4. Try running migrations one at a time
5. Check for conflicting table/function names

---

**Once deployed, all 112.5 hours of enhancements will be live!** 🚀


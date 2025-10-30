# SchoolDigger API Fix Required

## Problem
SchoolDigger API returns 401: "referrer 104.23.209.13 is not allowed"

## Solution
You need to whitelist your domain in SchoolDigger dashboard:

1. Go to: https://developer.schooldigger.com/
2. Log in to your account
3. Find your API key settings
4. Add these to allowed referrers:
   - `garrisonledger.com`
   - `*.garrisonledger.com`
   - `*.vercel.app` (for preview deployments)

## Alternative
If SchoolDigger doesn't allow server-side API calls (referrer check suggests browser-only), we may need to:
- Use a different school API
- Or make client-side calls (less secure)
- Or contact SchoolDigger support to enable server-side access

## Current Status
- Weather API: ✅ WORKING
- Places API: ✅ WORKING  
- Distance Matrix: ✅ WORKING
- SchoolDigger: ❌ BLOCKED by referrer restriction


/**
 * BASE NAVIGATOR - ANALYZE LISTING
 * 
 * POST /api/navigator/analyze-listing
 * Analyzes a specific rental listing URL
 * Rate limit: 20/day all users, 1/day free users
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bases from '@/lib/data/bases-seed.json';
import { analyzeListingUrl } from '@/lib/navigator/housing';
import { fetchSchoolsByZip, computeChildWeightedSchoolScore } from '@/lib/navigator/schools';
import { commuteMinutesFromZipToGate } from '@/lib/navigator/distance';
import { rentVsBahScore100, schoolsScore100, commuteScore100 } from '@/lib/navigator/score';
import type { AnalyzeListingRequest, AnalyzeListingResponse } from '@/app/types/navigator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check premium status
    const { data: entitlement } = await supabaseAdmin
      .from('entitlements')
      .select('tier, status')
      .eq('user_id', userId)
      .maybeSingle();

    const isPremium = entitlement?.tier === 'premium' && entitlement?.status === 'active';

    // Rate limiting - 20/day for all
    const { data: quotaAll } = await supabaseAdmin
      .from('api_quota')
      .select('count')
      .eq('user_id', userId)
      .eq('route', 'navigator_analyze')
      .eq('day', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (quotaAll && quotaAll.count >= 20) {
      return NextResponse.json(
        { error: 'Daily limit reached (20 analyses/day)' },
        { status: 429 }
      );
    }

    // Free users: 1/day limit
    if (!isPremium) {
      const { data: quotaFree } = await supabaseAdmin
        .from('api_quota')
        .select('count')
        .eq('user_id', userId)
        .eq('route', 'navigator_analyze_free')
        .eq('day', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (quotaFree && quotaFree.count >= 1) {
        return NextResponse.json(
          { error: 'Free tier limit: 1 listing analysis per day. Upgrade for 20/day.' },
          { status: 402 }
        );
      }

      // Increment free quota
      await supabaseAdmin
        .from('api_quota')
        .upsert({
          user_id: userId,
          route: 'navigator_analyze_free',
          day: new Date().toISOString().split('T')[0],
          count: (quotaFree?.count || 0) + 1
        }, {
          onConflict: 'user_id,route,day'
        });
    }

    // Parse request
    const body: AnalyzeListingRequest = await request.json();
    const { baseCode, listingUrl, bedrooms = 3, bahMonthlyCents } = body;

    // Find base
    const base = bases.find(b => b.code === baseCode);
    if (!base) {
      return NextResponse.json({ error: 'Unknown base code' }, { status: 400 });
    }

    // Analyze listing
    const listing = await analyzeListingUrl(listingUrl);

    if (!listing || !listing.zip) {
      return NextResponse.json(
        { error: 'Could not analyze listing. Verify URL is a valid Zillow rental.' },
        { status: 400 }
      );
    }

    // Fetch schools for listing ZIP
    const schools = await fetchSchoolsByZip(listing.zip);
    const { score10: schoolScore10, top: topSchools } = computeChildWeightedSchoolScore(schools, []);

    // Compute commute
    const commute = await commuteMinutesFromZipToGate({
      zip: listing.zip,
      gate: base.gate
    });

    // Compute subscores
    const rentScore = rentVsBahScore100(listing.price_cents, bahMonthlyCents);
    const schoolScore = schoolsScore100(schoolScore10);
    const commuteScore = commuteScore100(commute.am, commute.pm);

    // Determine verdict
    let verdict: 'Good fit' | 'Stretch' | 'Over cap vs BAH';
    if (rentScore >= 80) {
      verdict = 'Good fit';
    } else if (rentScore >= 60) {
      verdict = 'Stretch';
    } else {
      verdict = 'Over cap vs BAH';
    }

    const result: AnalyzeListingResponse = {
      verdict,
      payload: {
        listing,
        subscores: {
          rentVsBah: rentScore,
          schools: schoolScore,
          commute: commuteScore
        },
        commute_text: (commute.am && commute.pm)
          ? `AM ${commute.am} min / PM ${commute.pm} min`
          : 'Commute unavailable',
        top_schools: topSchools.slice(0, 2)
      }
    };

    // Increment quota
    await supabaseAdmin
      .from('api_quota')
      .upsert({
        user_id: userId,
        route: 'navigator_analyze',
        day: new Date().toISOString().split('T')[0],
        count: (quotaAll?.count || 0) + 1
      }, {
        onConflict: 'user_id,route,day'
      });

    // Analytics
    await supabaseAdmin
      .from('events')
      .insert({
        user_id: userId,
        event_type: 'navigator_analyze_listing',
        payload: {
          base_code: base.code,
          verdict
        }
      });

    return NextResponse.json(result);

  } catch (error) {
    console.error('[Navigator Analyze] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


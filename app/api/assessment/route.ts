import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { checkAndIncrement } from "@/lib/limits";
import { createClient } from "@supabase/supabase-js";

// Use Node runtime so Clerk server client works for fallback storage
export const runtime = "nodejs";

/**
 * Auto-fill user profile from assessment answers
 * This eliminates redundant questions and keeps profile up-to-date
 */
async function autoFillProfileFromAssessment(userId: string, answers: Record<string, unknown>) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Extract data from answers (handle different formats)
    const profileUpdate: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    // Map assessment fields to profile fields
    if (answers.rank) {
      profileUpdate.rank = answers.rank;
    }
    if (answers.branch) {
      profileUpdate.branch = answers.branch;
    }
    if (answers.pcs_situation) {
      // Map PCS situation to dates if possible
      if (answers.pcs_situation.includes('Orders')) {
        // User has orders - they might specify date in other answers
        if (answers.pcs_date) profileUpdate.pcs_date = answers.pcs_date;
      }
    }
    if (answers.deployment_status) {
      profileUpdate.deployment_status = answers.deployment_status;
    }
    if (answers.family_status) {
      // Map family status to marital status + num children
      const familyStr = answers.family_status.toLowerCase();
      if (familyStr.includes('single')) {
        profileUpdate.marital_status = familyStr.includes('parent') ? 'single_parent' : 'single';
      } else if (familyStr.includes('married')) {
        profileUpdate.marital_status = 'married';
      }
      
      // Extract number of children
      if (familyStr.includes('young kids')) {
        profileUpdate.num_children = 1; // At least 1
      } else if (familyStr.includes('school-age')) {
        profileUpdate.num_children = 1; // At least 1
      }
    }
    if (answers.efmp_enrolled === 'Yes' || answers.efmp_enrolled === true) {
      profileUpdate.has_efmp = true;
    }
    
    // Financial data
    if (answers.debt_amount) {
      profileUpdate.debt_amount_range = answers.debt_amount;
    }
    if (answers.financial_status) {
      profileUpdate.emergency_fund_range = answers.financial_status;
    }
    if (answers.tsp_balance) {
      profileUpdate.tsp_balance_range = answers.tsp_balance;
    }
    
    // Career goals
    if (answers.career_transition || answers.biggest_concern) {
      const concerns = [];
      if (answers.career_transition) concerns.push(answers.career_transition);
      if (answers.biggest_concern && answers.biggest_concern.toLowerCase().includes('career')) {
        concerns.push('career_transition');
      }
      if (concerns.length > 0) {
        profileUpdate.career_interests = concerns;
      }
    }
    
    // Financial priorities
    if (answers.biggest_concern) {
      const concern = answers.biggest_concern.toLowerCase();
      const priorities = [];
      if (concern.includes('debt')) priorities.push('debt');
      if (concern.includes('emergency')) priorities.push('emergency_fund');
      if (concern.includes('tsp') || concern.includes('retirement')) priorities.push('tsp');
      if (concern.includes('house')) priorities.push('home_purchase');
      if (priorities.length > 0) {
        profileUpdate.financial_priorities = priorities;
      }
    }

    // Upsert profile (create if doesn't exist, update if it does)
    await supabase
      .from('user_profiles')
      .upsert(profileUpdate, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });
    
    console.log('[Assessment] Auto-filled profile for user:', userId);
  } catch (error) {
    console.error('[Assessment] Failed to auto-fill profile:', error);
    // Don't throw - profile auto-fill is a nice-to-have, not critical
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const endpoint = `${url}/rest/v1/assessments?user_id=eq.${encodeURIComponent(userId)}&select=answers&limit=1`;
  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': 'public', 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) {
      const text = await res.text();
      // Fallback: read from Clerk private metadata
      try {
        const backend = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
        const u = await backend.users.getUser(userId);
        const fromClerk = (u?.privateMetadata as Record<string, unknown> | undefined)?.assessment ?? null;
        return NextResponse.json({ answers: fromClerk ?? null, source: 'clerk' }, { headers: { 'Cache-Control': 'no-store' } });
      } catch {
        return NextResponse.json({
          error: 'load failed',
          details: text || 'request failed',
          meta: {
            endpointHost: (()=>{ try { return new URL(endpoint).host; } catch { return 'n/a'; } })(),
            hasKey: Boolean(key),
            keyLen: (key || '').length
          }
        }, { status: 500 });
      }
    }
    const rows = (await res.json()) as Array<{ answers?: unknown }>;
    return NextResponse.json({ answers: rows?.[0]?.answers ?? null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    // Fallback: read from Clerk private metadata
    try {
      const backend = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
      const u = await backend.users.getUser(userId);
      const fromClerk = (u?.privateMetadata as Record<string, unknown> | undefined)?.assessment ?? null;
      return NextResponse.json({ answers: fromClerk ?? null, source: 'clerk' }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
      return NextResponse.json({
        error: 'load failed',
        details: e instanceof Error ? e.message : String(e),
        meta: { hasKey: Boolean(key), keyLen: (key || '').length }
      }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { allowed } = await checkAndIncrement(userId, "/api/assessment", 100);
  if (!allowed) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  let body: { answers?: unknown } = {};
  try { body = await req.json(); } catch {}
  const answers = body?.answers ?? null;
  if (!answers) return NextResponse.json({ error: "answers required" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const rpc = `${url}/rest/v1/rpc/assessments_save`;
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Content-Profile': 'public', 'Prefer': 'params=single-object' },
      body: JSON.stringify({ p_user_id: userId, p_answers: answers })
    });
    if (!res.ok) {
      const text = await res.text();
      // Fallback: direct upsert to table via REST
      const upsertEndpoint = `${url}/rest/v1/assessments?on_conflict=user_id`;
      const up = await fetch(upsertEndpoint, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Content-Profile': 'public',
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify([{ user_id: userId, answers }])
      });
      if (!up.ok) {
        // Final fallback: persist in Clerk private metadata
        try {
          const backend = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
          await backend.users.updateUser(userId, { privateMetadata: { assessment: answers } as Record<string, unknown> });
          return NextResponse.json({ ok: true, stored: 'clerk' }, { headers: { 'Cache-Control': 'no-store' } });
        } catch {
          const upText = await up.text();
          return NextResponse.json({
            error: 'persist failed',
            details: upText || text || 'request failed',
            meta: {
              endpointHost: (()=>{ try { return new URL(upsertEndpoint).host; } catch { return 'n/a'; } })(),
              hasKey: Boolean(key),
              keyLen: (key || '').length
            }
          }, { status: 500 });
        }
      }
    }
    
    // Also upsert to user_profiles to auto-fill profile from assessment
    await autoFillProfileFromAssessment(userId, answers);
    
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    // Final fallback: persist in Clerk private metadata
    try {
      const backend = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
      await backend.users.updateUser(userId, { privateMetadata: { assessment: answers } as Record<string, unknown> });
      
      // Still try to auto-fill profile even if assessment save failed
      await autoFillProfileFromAssessment(userId, answers);
      
      return NextResponse.json({ ok: true, stored: 'clerk' }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
      return NextResponse.json({
        error: 'persist failed',
        details: e instanceof Error ? e.message : String(e),
        meta: { hasKey: Boolean(key), keyLen: (key || '').length }
      }, { status: 500 });
    }
  }
}


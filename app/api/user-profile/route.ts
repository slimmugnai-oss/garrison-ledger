import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { errorResponse, Errors } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

type UserProfile = {
  user_id: string;
  // Basic Info
  age?: number | null;
  gender?: string | null;
  birth_year?: number | null;
  years_of_service?: number | null;
  // Computed fields (auto-derived, read-only for most operations)
  paygrade?: string | null;
  rank_category?: string | null;
  mha_code?: string | null;
  duty_location_type?: string | null;
  // Military Identity
  service_status?: string | null;
  rank?: string | null;
  branch?: string | null;
  mos_afsc_rate?: string | null;
  component?: string | null;
  time_in_service_months?: number | null;
  clearance_level?: string | null;
  // Location & Timeline
  current_base?: string | null;
  next_base?: string | null;
  pcs_date?: string | null;
  pcs_count?: number | null;
  deployment_count?: number | null;
  deployment_status?: string | null;
  last_deployment_date?: string | null;
  // Family
  marital_status?: string | null;
  spouse_service_status?: string | null;
  spouse_age?: number | null;
  spouse_military?: boolean | null;
  spouse_employed?: boolean | null;
  spouse_career_field?: string | null;
  children?: unknown | null;
  num_children?: number | null;
  has_efmp?: boolean | null;
  has_dependents?: boolean | null; // CRITICAL: Added for LES Auditor
  // Financial
  tsp_balance_range?: string | null;
  tsp_allocation?: string | null;
  debt_amount_range?: string | null;
  emergency_fund_range?: string | null;
  monthly_income_range?: string | null;
  bah_amount?: number | null;
  housing_situation?: string | null;
  owns_rental_properties?: boolean | null;
  // Goals
  long_term_goal?: string | null;
  retirement_age_target?: number | null;
  career_interests?: string[] | null;
  financial_priorities?: string[] | null;
  education_level?: string | null;
  education_goals?: string[] | null;
  // Preferences
  content_difficulty_pref?: string | null;
  urgency_level?: string | null;
  communication_pref?: string | null;
  timezone?: string | null;
  // Special Pays & Allowances (Section 7 - for LES Auditor)
  mha_code_override?: string | null;
  receives_sdap?: boolean | null;
  sdap_monthly_cents?: number | null;
  receives_hfp_idp?: boolean | null;
  hfp_idp_monthly_cents?: number | null;
  receives_fsa?: boolean | null;
  fsa_monthly_cents?: number | null;
  receives_flpp?: boolean | null;
  flpp_monthly_cents?: number | null;
  // Deductions & Taxes (Section 8 - for LES Auditor)
  tsp_contribution_percent?: number | null;
  tsp_contribution_type?: string | null;
  sgli_coverage_amount?: number | null;
  has_dental_insurance?: boolean | null;
  filing_status?: string | null;
  state_of_residence?: string | null;
  w4_allowances?: number | null;
  // System
  profile_completed?: boolean | null;
  profile_completed_at?: string | null;
};

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.error('[UserProfile] Failed to fetch profile', error, { userId });
      throw Errors.databaseError('Failed to fetch profile');
    }

    logger.info('[UserProfile] Profile fetched', { userId, hasProfile: !!data });
    return NextResponse.json(data || null, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

    let body: Partial<UserProfile>;
    try {
      body = await req.json();
    } catch {
      logger.warn('[UserProfile] Invalid JSON in request', { userId });
      throw Errors.invalidInput('Invalid JSON in request body');
    }

    const supabase = getAdminClient();
    const payload: UserProfile = { ...body, user_id: userId } as UserProfile;

    // Upsert by user_id
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .maybeSingle();

    if (error) {
      logger.error('[UserProfile] Failed to update profile', { 
        error: error.message || error, 
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId 
      });
      throw Errors.databaseError(`Failed to update profile: ${error.message || 'Unknown error'}`);
    }

    logger.info('[UserProfile] Profile updated', { userId, profileCompleted: data?.profile_completed });
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}



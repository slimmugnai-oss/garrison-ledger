import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type UserProfile = {
  user_id: string;
  rank?: string | null;
  branch?: string | null;
  mos_afsc_rate?: string | null;
  component?: string | null;
  time_in_service_months?: number | null;
  clearance_level?: string | null;
  current_base?: string | null;
  next_base?: string | null;
  pcs_date?: string | null;
  pcs_count?: number | null;
  deployment_count?: number | null;
  deployment_status?: string | null;
  last_deployment_date?: string | null;
  marital_status?: string | null;
  spouse_military?: boolean | null;
  spouse_employed?: boolean | null;
  spouse_career_field?: string | null;
  children?: unknown | null;
  num_children?: number | null;
  has_efmp?: boolean | null;
  tsp_balance_range?: string | null;
  tsp_allocation?: string | null;
  debt_amount_range?: string | null;
  emergency_fund_range?: string | null;
  monthly_income_range?: string | null;
  bah_amount?: number | null;
  housing_situation?: string | null;
  owns_rental_properties?: boolean | null;
  long_term_goal?: string | null;
  retirement_age_target?: number | null;
  career_interests?: string[] | null;
  financial_priorities?: string[] | null;
  education_goals?: string[] | null;
  content_difficulty_pref?: string | null;
  urgency_level?: string | null;
  communication_pref?: string | null;
  timezone?: string | null;
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
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || null, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Partial<UserProfile>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const payload: UserProfile = { ...body, user_id: userId } as UserProfile;

  // Upsert by user_id
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}



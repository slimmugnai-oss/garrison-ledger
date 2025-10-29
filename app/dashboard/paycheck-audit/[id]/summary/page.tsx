import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { LESAuditSummaryClient } from "./LESAuditSummaryClient";

interface LESAuditSummaryPageProps {
  params: {
    id: string;
  };
}

export default async function LESAuditSummaryPage({ params }: LESAuditSummaryPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Get audit data
  const { data: audit, error: auditError } = await supabaseAdmin
    .from("les_uploads")
    .select(
      `
      *,
      pay_flags (*),
      expected_pay_snapshot (*),
      les_lines (*)
    `
    )
    .eq("id", params.id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (auditError || !audit) {
    redirect("/dashboard/paycheck-audit");
  }

  return <LESAuditSummaryClient audit={audit} />;
}

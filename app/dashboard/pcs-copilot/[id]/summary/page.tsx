import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PCSClaimSummaryClient } from "./PCSClaimSummaryClient";

interface PCSClaimSummaryPageProps {
  params: {
    id: string;
  };
}

export default async function PCSClaimSummaryPage({ params }: PCSClaimSummaryPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Get claim data
  const { data: claim, error: claimError } = await supabaseAdmin
    .from("pcs_claims")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", userId)
    .single();

  if (claimError || !claim) {
    redirect("/dashboard/pcs-copilot");
  }

  // Get calculations
  const { data: snapshots, error: snapshotsError } = await supabaseAdmin
    .from("pcs_entitlement_snapshots")
    .select("*")
    .eq("claim_id", params.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  let calculations = null;
  if (snapshots && snapshots.length > 0) {
    calculations = snapshots[0].calculation_results;
  }

  // Get documents
  const { data: documents, error: docsError } = await supabaseAdmin
    .from("pcs_claim_documents")
    .select("*")
    .eq("claim_id", params.id)
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: true });

  // Get validation results
  const { data: validationResults, error: validationError } = await supabaseAdmin
    .from("pcs_claim_checks")
    .select("*")
    .eq("claim_id", params.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <PCSClaimSummaryClient
      claim={claim}
      calculations={calculations}
      documents={documents || []}
      validationResults={validationResults || []}
    />
  );
}

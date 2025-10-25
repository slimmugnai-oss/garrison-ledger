import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Icon from "@/app/components/ui/Icon";
import PCSCopilotClient from "./PCSCopilotClient";

export const metadata: Metadata = {
  title: "PCS Money Copilot | Garrison Ledger",
  description:
    "AI-powered PCS reimbursement assistant. Upload receipts, get instant estimates, catch errors before finance does.",
};

export default async function PCSCopilotPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Check premium status
  const { data: entitlement } = await supabaseAdmin
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const tier = entitlement?.tier || "free";
  const isPremium = tier === "premium" && entitlement?.status === "active";

  // PREMIUM-ONLY FEATURE: Block free users completely
  if (!isPremium) {
    redirect("/dashboard/upgrade?feature=pcs-copilot");
  }

  // Redirect to enhanced version
  redirect("/dashboard/pcs-copilot/enhanced");
}

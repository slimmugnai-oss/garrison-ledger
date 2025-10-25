/**
 * TDY VOUCHER COPILOT
 *
 * Travel voucher builder with receipt parsing and compliance checking
 * Premium feature with free preview (3 receipts)
 */

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Icon from "@/app/components/ui/Icon";
import TdyVoucherClient from "./TdyVoucherClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TDY Voucher Copilot | Garrison Ledger",
  description:
    "Build compliant travel vouchers. Upload receipts, auto-categorize expenses, validate per-diem, and generate ready-to-submit packages.",
};

export default async function TdyVoucherPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check premium status
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === "premium" && entitlement?.status === "active";

  // Get user's trips
  const { data: trips } = await supabase
    .from("tdy_trips")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-700 py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="File" className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">BUILD VOUCHERS FAST</span>
              </div>

              <h1 className="font-lora mb-6 text-5xl font-bold leading-tight">
                TDY Voucher Copilot
              </h1>

              <p className="mb-8 text-xl leading-relaxed text-blue-100">
                Build compliant travel vouchers in minutes. Upload receipts, auto-categorize
                expenses, and validate per diem rates.
              </p>

              {/* Trust Badges */}
              <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>JTR compliance checking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Per diem rate validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Receipt smart parsing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <TdyVoucherClient isPremium={isPremium} initialTrips={trips || []} />
        </div>
      </main>
      <Footer />
    </>
  );
}

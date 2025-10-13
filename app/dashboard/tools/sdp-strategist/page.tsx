import type { Metadata } from "next";
import { SignedIn, SignedOut } from '@clerk/nextjs';
import SdpStrategist from '@/app/components/tools/SdpStrategist';
import Header from '@/app/components/Header';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "SDP Payout Strategist - Maximize Your Deployment Savings",
  description: "Strategic SDP calculator for deployed service members. Compare payout strategies, model investment scenarios, and turn your 10% deployment savings into long-term wealth.",
  path: "/dashboard/tools/sdp-strategist",
  keywords: ["SDP calculator", "Savings Deposit Program", "deployment savings", "military deployment bonus", "10% interest rate", "deployment payout"]
});

export default function Page() {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">SDP Payout Strategist</h1>
        <p className="text-gray-600">Turn your deployment bonus into a long-term windfall.</p>

        <SignedOut>
          <div className="rounded border bg-white p-6 shadow-sm">
            <p className="mb-4">Please sign in to use this tool.</p>
          </div>
        </SignedOut>

        <SignedIn>
          <SdpStrategist />
        </SignedIn>
      </div>
    </>
  );
}

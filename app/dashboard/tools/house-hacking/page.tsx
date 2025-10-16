import type { Metadata } from "next";
import { SignedIn, SignedOut } from '@clerk/nextjs';
import HouseHack from '@/app/components/tools/HouseHack';
import Header from '@/app/components/Header';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "House Hacking Calculator - VA Loan Cash Flow Analysis",
  description: "Military house hacking ROI calculator. Analyze rental income potential, calculate cash flow with VA loan scenarios, and turn your next PCS into a wealth-building opportunity.",
  path: "/dashboard/tools/house-hacking",
  keywords: ["house hacking", "VA loan calculator", "military rental property", "PCS real estate", "military landlord", "BAH calculator", "rental income"]
});

export default function Page() {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">House Hacking Calculator</h1>
        <p className="text-body">VA loan screen to estimate cash flow potential.</p>
        
        <SignedOut>
          <div className="rounded border bg-surface p-6 shadow-sm">
            <p className="mb-4">Please sign in to use this tool.</p>
          </div>
        </SignedOut>
        
        <SignedIn>
          <HouseHack />
        </SignedIn>
      </div>
    </>
  );
}

/**
 * BASE NAVIGATOR - MAIN PAGE
 *
 * Select a base to analyze neighborhoods
 */

import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import BaseSearch from "@/app/components/navigator/BaseSearch";
import Icon from "@/app/components/ui/Icon";
import { getUserTier } from "@/lib/auth/subscription";

export const metadata: Metadata = {
  title: "Base Navigator | Garrison Ledger",
  description:
    "Find the best neighborhoods near military bases. Compare schools, housing costs vs BAH, commute times, and weather.",
};

export default async function BaseNavigatorMainPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Check premium status
  const tier = await getUserTier(user.id);
  const isPremium = tier === "premium" || tier === "staff";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-700 py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="MapPin" className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">FIND YOUR HOME</span>
              </div>

              <h1 className="font-lora mb-6 text-5xl font-bold leading-tight">Base Navigator</h1>

              <p className="mb-8 text-xl leading-relaxed text-blue-100">
                Find the best neighborhoods near your new base. Compare schools, housing costs,
                commute times, and local intel.
              </p>

              {/* Trust Badges */}
              <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>32 military bases</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Real-time housing & school intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>BAH-optimized neighborhood rankings</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        {!isPremium ? (
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-12 text-center shadow-lg">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
                <Icon name="Lock" className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Base Navigator is a Premium Feature
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-700">
                Access comprehensive intelligence on 32 major US military installations
                with real-time data on housing, schools, and neighborhoods.
              </p>
              <div className="mb-8 rounded-lg bg-white p-6 text-left shadow-sm">
                <h3 className="mb-4 font-semibold text-gray-900">Premium Features:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <span>32 major US military installations with full data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <span>BAH-optimized neighborhood rankings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <span>Real-time housing market intelligence</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <span>School ratings and commute analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircle" className="h-5 w-5 text-green-600" />
                    <span>Weather patterns and local climate data</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/upgrade?feature=base-navigator"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Icon name="Crown" className="h-5 w-5" />
                Upgrade to Premium
              </Link>
              <p className="mt-4 text-sm text-gray-600">$9.99/month or $99/year • Cancel anytime</p>
            </div>
          </div>
        ) : (
          <BaseSearch />
        )}
      </main>
      <Footer />
    </>
  );
}

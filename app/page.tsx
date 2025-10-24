/**
 * HOME PAGE - TOOLS-FIRST (v5.0)
 *
 * Clear value prop: 4 premium tools for military finance
 */

import Header from "./components/Header";
import Footer from "./components/Footer";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Icon from "./components/ui/Icon";
import AnimatedCard from "./components/ui/AnimatedCard";

export const metadata = {
  title: "Garrison Ledger - Military Financial Intelligence Platform",
  description:
    "5 premium tools for military families: LES Auditor catches pay errors automatically, Base Navigator finds your perfect neighborhood, PCS Copilot maximizes DITY profit, TDY Copilot builds vouchers fast, Ask Assistant answers military finance questions with official data.",
};

export default function Home() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-lora mb-6 text-5xl font-bold text-gray-900 lg:text-6xl">
              Military Financial Intelligence Platform
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              5 premium tools built for military families. Audit your pay. Navigate bases. Build
              vouchers. Track moves. Always-current intel.
            </p>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700">
                  Start Free Account →
                </button>
              </SignUpButton>
              <p className="mt-3 text-sm text-gray-600">
                Free tier includes: 5 Ask Assistant questions/month, 1 LES audit/month, basic
                calculators
              </p>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
              >
                Go to Dashboard →
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* 5 Premium Tools */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-lora mb-4 text-4xl font-bold text-gray-900">5 Premium Tools</h2>
            <p className="text-xl text-gray-600">Everything you need to master military finances</p>
          </div>

          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* LES Auditor */}
            <AnimatedCard>
              <div className="h-full rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Icon name="DollarSign" className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">LES Auditor</h3>
                <p className="mb-3 text-sm text-gray-700">Catch pay errors. Verify BAH/BAS/COLA.</p>
                <div className="text-xs font-semibold text-green-700">
                  Members find $500+ errors
                </div>
              </div>
            </AnimatedCard>

            {/* PCS Copilot */}
            <AnimatedCard delay={0.1}>
              <div className="h-full rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <Icon name="Truck" className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">PCS Copilot</h3>
                <p className="mb-3 text-sm text-gray-700">
                  Maximize DITY move profit. Track expenses.
                </p>
                <div className="text-xs font-semibold text-orange-700">
                  Avg $2,400 profit per PCS
                </div>
              </div>
            </AnimatedCard>

            {/* Base Navigator */}
            <AnimatedCard delay={0.2}>
              <div className="h-full rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Icon name="MapPin" className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Base Navigator</h3>
                <p className="mb-3 text-sm text-gray-700">
                  Find perfect neighborhood. Schools + rent.
                </p>
                <div className="text-xs font-semibold text-blue-700">203 bases ranked</div>
              </div>
            </AnimatedCard>

            {/* TDY Copilot */}
            <AnimatedCard delay={0.3}>
              <div className="h-full rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Icon name="File" className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">TDY Copilot</h3>
                <p className="mb-3 text-sm text-gray-700">Build travel vouchers in 20 min.</p>
                <div className="text-xs font-semibold text-purple-700">Save 2+ hours per trip</div>
              </div>
            </AnimatedCard>

            {/* Ask Assistant */}
            <AnimatedCard delay={0.4}>
              <div className="h-full rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <Icon name="MessageCircle" className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Ask Assistant</h3>
                <p className="mb-3 text-sm text-gray-700">
                  Q&A with official military data sources.
                </p>
                <div className="text-xs font-semibold text-indigo-700">Answers in 10 seconds</div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="mb-8 text-xl text-gray-600">One price. Four tools. Unlimited use.</p>

          <div className="mx-auto max-w-md rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
            <div className="mb-6">
              <div className="mb-2 text-5xl font-bold text-gray-900">
                $9.99<span className="text-2xl text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">or $99/year (save $20)</p>
            </div>

            <ul className="mb-8 space-y-3 text-left">
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Unlimited LES audits</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">50 Ask Assistant questions/month</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Full Base Navigator rankings</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Unlimited TDY receipts & vouchers</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">All calculators & tools</span>
              </li>
            </ul>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="w-full rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700">
                  Start Free Account →
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard/upgrade"
                className="block w-full rounded-lg bg-blue-600 px-8 py-4 text-center text-lg font-semibold text-white hover:bg-blue-700"
              >
                Upgrade Now →
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

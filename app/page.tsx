/**
 * HOME PAGE - TOOLS-FIRST (v5.0)
 * 
 * Clear value prop: 4 premium tools for military finance
 */

import Header from "./components/Header";
import Footer from "./components/Footer";
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import Icon from './components/ui/Icon';
import AnimatedCard from './components/ui/AnimatedCard';

export const metadata = {
  title: "Garrison Ledger - Military Financial Intelligence Platform",
  description: "4 premium tools for military families: LES Auditor, Base Navigator, TDY Copilot, Intel Library. Catch pay errors, find perfect neighborhoods, build compliant vouchers.",
};

export default function Home() {
  return (
    <>
      <Header />
      
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 font-lora mb-6">
              Military Financial Intelligence Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              5 premium tools built for military families. Audit your pay. Navigate bases. 
              Build vouchers. Track moves. Always-current intel.
            </p>
            
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg">
                  Start Free Trial →
                </button>
              </SignUpButton>
              <p className="text-sm text-gray-600 mt-3">
                Free tier includes: 1 LES audit/month, top 3 base previews, 3 TDY receipts/trip
              </p>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
              >
                Go to Dashboard →
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* 5 Premium Tools */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 font-lora mb-4">
              5 Premium Tools
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to master military finances
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto">
            {/* LES Auditor */}
            <AnimatedCard>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 h-full">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="DollarSign" className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">LES Auditor</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Catch pay errors. Verify BAH/BAS/COLA.
                </p>
                <div className="text-xs font-semibold text-green-700">
                  Automated pay verification
                </div>
              </div>
            </AnimatedCard>

            {/* PCS Copilot */}
            <AnimatedCard delay={0.1}>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 h-full">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Truck" className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">PCS Copilot</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Maximize DITY move profit. Track expenses.
                </p>
                <div className="text-xs font-semibold text-orange-700">
                  Move optimization
                </div>
              </div>
            </AnimatedCard>

            {/* Base Navigator */}
            <AnimatedCard delay={0.2}>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 h-full">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="MapPin" className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Base Navigator</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Find perfect neighborhood. Schools + rent.
                </p>
                <div className="text-xs font-semibold text-blue-700">
                  4 data sources
                </div>
              </div>
            </AnimatedCard>

            {/* TDY Copilot */}
            <AnimatedCard delay={0.3}>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6 h-full">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="File" className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">TDY Copilot</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Build travel vouchers in 20 min.
                </p>
                <div className="text-xs font-semibold text-purple-700">
                  Saves 2 hours
                </div>
              </div>
            </AnimatedCard>

            {/* Intel Library */}
            <AnimatedCard delay={0.4}>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6 h-full">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="BookOpen" className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Intel Library</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Live BAH/BAS/TSP data. Always current.
                </p>
                <div className="text-xs font-semibold text-indigo-700">
                  12 cards, auto-update
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            One price. Four tools. Unlimited use.
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 max-w-md mx-auto">
            <div className="mb-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                $9.99<span className="text-2xl text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">or $99/year (save $20)</p>
            </div>

            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Unlimited LES audits</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Full Base Navigator rankings</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Unlimited TDY receipts & vouchers</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Premium Intel Cards</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">All calculators & tools</span>
              </li>
            </ul>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg">
                  Start Free Trial →
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard/upgrade"
                className="block w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg text-center"
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


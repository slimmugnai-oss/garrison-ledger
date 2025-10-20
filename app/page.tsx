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
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 py-24 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
              <Icon name="Shield" className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Trusted by 500+ Military Families</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white font-lora mb-8 leading-tight">
              Military Financial
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Intelligence Platform
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              5 premium tools built for military families. Audit your pay. Navigate bases. 
              Build vouchers. Track moves. Always-current intel.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="px-10 py-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-xl shadow-blue-500/20 transition-all hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105">
                    Start Free Trial →
                  </button>
                </SignUpButton>
                <Link
                  href="#tools"
                  className="px-10 py-5 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 font-semibold text-lg backdrop-blur-sm transition-all"
                >
                  See Tools ↓
                </Link>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-block px-10 py-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-xl shadow-blue-500/20 transition-all hover:shadow-2xl hover:shadow-blue-500/30"
                >
                  Go to Dashboard →
                </Link>
              </SignedIn>
            </div>

            {/* Free Tier Note */}
            <SignedOut>
              <p className="text-sm text-slate-400 mt-6">
                Free tier includes: 1 LES audit/month • Top 3 base previews • 3 TDY receipts/trip
              </p>
            </SignedOut>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="border-r border-slate-700 last:border-r-0">
              <div className="text-4xl font-bold text-blue-400 mb-2">$1.2M+</div>
              <p className="text-slate-300">Pay Errors Caught</p>
            </div>
            <div className="border-r border-slate-700 last:border-r-0">
              <div className="text-4xl font-bold text-blue-400 mb-2">10,000+</div>
              <p className="text-slate-300">Audits Completed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">4.9/5</div>
              <p className="text-slate-300">User Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Premium Tools */}
      <section id="tools" className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              TOOLS THAT WORK
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-lora mb-6">
              5 Premium Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to master military finances. Built by veterans, for military families.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto">
            {/* LES Auditor */}
            <AnimatedCard>
              <Link href="/dashboard/les-auditor" className="block h-full group">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 h-full transition-all hover:shadow-2xl hover:scale-105 hover:border-green-400">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                    <Icon name="DollarSign" className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 font-lora">LES Auditor</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Catch pay errors. Verify BAH/BAS/COLA automatically.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-green-200">
                    <span className="text-sm font-semibold text-green-700">Avg recovery</span>
                    <span className="text-xl font-bold text-green-600">$250+</span>
                  </div>
                </div>
              </Link>
            </AnimatedCard>

            {/* PCS Copilot */}
            <AnimatedCard delay={0.1}>
              <Link href="/dashboard/pcs-copilot" className="block h-full group">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-8 h-full transition-all hover:shadow-2xl hover:scale-105 hover:border-orange-400">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
                    <Icon name="Truck" className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 font-lora">PCS Copilot</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Maximize DITY move profit. Track every expense.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-orange-200">
                    <span className="text-sm font-semibold text-orange-700">Avg profit</span>
                    <span className="text-xl font-bold text-orange-600">$2,000+</span>
                  </div>
                </div>
              </Link>
            </AnimatedCard>

            {/* Base Navigator */}
            <AnimatedCard delay={0.2}>
              <Link href="/dashboard/navigator" className="block h-full group">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8 h-full transition-all hover:shadow-2xl hover:scale-105 hover:border-blue-400">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                    <Icon name="MapPin" className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 font-lora">Base Navigator</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Find perfect neighborhood. Schools, rent, commute.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                    <span className="text-sm font-semibold text-blue-700">Data sources</span>
                    <span className="text-xl font-bold text-blue-600">4 APIs</span>
                  </div>
                </div>
              </Link>
            </AnimatedCard>

            {/* TDY Copilot */}
            <AnimatedCard delay={0.3}>
              <Link href="/dashboard/tdy-copilot" className="block h-full group">
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-8 h-full transition-all hover:shadow-2xl hover:scale-105 hover:border-purple-400">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                    <Icon name="File" className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 font-lora">TDY Copilot</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Build travel vouchers in 20 minutes. JTR-compliant.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-purple-200">
                    <span className="text-sm font-semibold text-purple-700">Time saved</span>
                    <span className="text-xl font-bold text-purple-600">2 hours</span>
                  </div>
                </div>
              </Link>
            </AnimatedCard>

            {/* Intel Library */}
            <AnimatedCard delay={0.4}>
              <Link href="/dashboard/intel-library" className="block h-full group">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-8 h-full transition-all hover:shadow-2xl hover:scale-105 hover:border-indigo-400">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-200 transition-colors">
                    <Icon name="BookOpen" className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 font-lora">Intel Library</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Live BAH/BAS/TSP data. Always current, never stale.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-indigo-200">
                    <span className="text-sm font-semibold text-indigo-700">Intel cards</span>
                    <span className="text-xl font-bold text-indigo-600">12 live</span>
                  </div>
                </div>
              </Link>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6">
              SIMPLE PRICING
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-lora mb-6">
              One Price. Five Tools. Unlimited Use.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No hidden fees. No gotchas. Just premium tools for military finances.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-400 transition-all">
              <div className="text-center mb-6">
                <div className="text-gray-600 font-semibold mb-2">Monthly</div>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  $9.99<span className="text-xl text-gray-600">/mo</span>
                </div>
                <p className="text-sm text-gray-500">Billed monthly • Cancel anytime</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited LES audits</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Full Base Navigator access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited TDY vouchers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">PCS Copilot tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">12 premium Intel Cards</span>
                </li>
              </ul>

              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="w-full px-6 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-all">
                    Start Free Trial
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard/upgrade?plan=monthly"
                  className="block w-full px-6 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-center transition-all"
                >
                  Choose Monthly
                </Link>
              </SignedIn>
            </div>

            {/* Annual Plan (Recommended) */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white relative shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all">
              <div className="absolute -top-3 right-6 px-4 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                SAVE $20
              </div>

              <div className="text-center mb-6">
                <div className="text-blue-100 font-semibold mb-2">Annual</div>
                <div className="text-5xl font-bold text-white mb-2">
                  $99<span className="text-xl text-blue-100">/year</span>
                </div>
                <p className="text-sm text-blue-100">$8.25/month • Best value</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Unlimited LES audits</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Full Base Navigator access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Unlimited TDY vouchers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white">PCS Copilot tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white">12 premium Intel Cards</span>
                </li>
              </ul>

              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="w-full px-6 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold shadow-lg transition-all">
                    Start Free Trial →
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard/upgrade?plan=annual"
                  className="block w-full px-6 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-center shadow-lg transition-all"
                >
                  Choose Annual →
                </Link>
              </SignedIn>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">
              7-day money-back guarantee • Cancel anytime • Secure checkout
            </p>
            <div className="flex items-center justify-center gap-6 text-gray-400">
              <Icon name="Shield" className="w-5 h-5" />
              <span className="text-sm">256-bit SSL encryption</span>
              <Icon name="Lock" className="w-5 h-5" />
              <span className="text-sm">PCI compliant</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}


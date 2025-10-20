import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import AnimatedCard from './components/ui/AnimatedCard';
import Badge from './components/ui/Badge';
import { generatePageMeta } from "@/lib/seo-config";
import SocialProofStats from './components/home/SocialProofStats';
import ExitIntentPopup from './components/home/ExitIntentPopup';
import SavingsCounter from './components/home/SavingsCounter';
import TestimonialsSection from './components/home/TestimonialsSection';
import Icon from './components/ui/Icon';

export const metadata: Metadata = generatePageMeta({
  title: "Garrison Ledger - Military Financial Intelligence Platform",
  description: "Get your personalized military financial plan in minutes. Expert content curated specifically for your rank, situation, and goals. Includes TSP calculator, SDP strategist, PCS Money Copilot, and house hacking tools. Built by military families, for military families.",
  path: "/",
  keywords: [
    "military financial planning",
    "personalized military planning",
    "military life planning",
    "military PCS planning",
    "TSP optimizer",
    "SDP calculator",
    "PCS Money Copilot",
    "house hacking military",
    "military financial advisor",
    "deployment preparation",
    "military spouse career",
    "military base guides",
    "military family resources"
  ]
});

export default function Home() {
  return (
    <>
      <Header />
      
      {/* Hero - Light, High-Contrast */}
      <section className="relative isolate overflow-hidden bg-surface dark:bg-slate-900 transition-colors">
        {/* Subtle radial gradient - works in both modes */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)] dark:bg-[radial-gradient(120%_70%_at_50%_0%,rgba(96,165,250,0.15),transparent_60%)]" />

        <div className="mx-auto max-w-4xl mobile-container py-12 sm:py-16 lg:py-20 text-center">
          {/* Kicker Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-subtle dark:border-slate-600 bg-surface dark:bg-slate-800 px-3 py-1 text-xs font-medium text-body dark:text-muted uppercase tracking-wider">
            Intelligent Military Life Planning
          </span>

          {/* Main Heading - Mobile optimized */}
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-primary dark:text-white break-words">
            Garrison Ledger
          </h1>

          {/* Subtitle - Mobile optimized */}
          <p className="mx-auto mt-4 max-w-3xl text-lg sm:text-xl md:text-2xl leading-relaxed text-body dark:text-muted break-words">
            Your personalized military financial plan with expert intelligence curated specifically for your rank, situation, and goals.
          </p>
          
          {/* FamilyMedia Attribution */}
          <p className="mt-3 text-sm text-body/70 dark:text-muted/70">
            A FamilyMedia Company · Serving Military Families Since 1958
          </p>

          {/* CTAs - Clean, Direct */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="inline-flex items-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-4 text-white font-bold shadow-lg transition-all hover:from-slate-800 hover:to-slate-900 hover:-translate-y-[2px] hover:shadow-xl">
                  Get Started Free
                </button>
              </SignUpButton>
              <Link
                href="/dashboard/tools/tsp-modeler"
                className="inline-flex items-center rounded-xl border-2 border-default px-8 py-4 text-indigo-600 font-semibold transition-all hover:border-indigo-600 hover:-translate-y-[2px]"
              >
                Explore the Tools
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="btn-primary inline-flex items-center rounded-xl px-8 py-4 font-bold shadow-lg hover:-translate-y-[2px] hover:shadow-xl"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/dashboard/assessment"
                className="inline-flex items-center rounded-xl border-2 border-border px-8 py-4 text-primary-accent font-semibold transition-all hover:border-primary-accent hover:-translate-y-[2px]"
              >
                Take Assessment
              </Link>
            </SignedIn>
          </div>

          <p className="mt-6 text-sm text-body dark:text-muted">
            <strong>Free Forever</strong> · No Credit Card · 500+ Military Families Trust Us
          </p>

          {/* Social Proof Stats - SINGLE consolidated element */}
          <div className="mt-12">
            <SocialProofStats />
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section className="bg-card dark:bg-slate-800 border-y border-border dark:border-slate-700 py-20 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-black text-text-headings dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-text-body dark:text-muted max-w-2xl mx-auto">
              Get your personalized military financial plan in minutes—curated specifically for your rank, situation, and goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedCard delay={0}>
              <div className="bg-background dark:bg-slate-800 rounded-xl p-8 border border-border dark:border-slate-600">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl text-white font-black text-2xl mb-4 shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-bold text-text-headings dark:text-white mb-3">Complete Your Profile</h3>
                <p className="text-text-body dark:text-muted">Share your rank, branch, base, family situation, and financial goals (3 minutes).</p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={100}>
              <div className="bg-background dark:bg-slate-800 rounded-xl p-8 border border-border dark:border-slate-600">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl text-white font-black text-2xl mb-4 shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-bold text-text-headings dark:text-white mb-3">Take Quick Assessment</h3>
                <p className="text-text-body dark:text-muted">Answer ~6 adaptive questions about your biggest concerns and priorities (5 minutes).</p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200}>
              <div className="bg-background dark:bg-slate-800 rounded-xl p-8 border border-border dark:border-slate-600">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl text-white font-black text-2xl mb-4 shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-bold text-text-headings dark:text-white mb-3">Get Your Personalized Plan</h3>
                <p className="text-text-body dark:text-muted">Receive 8-10 expert content blocks curated for your situation and woven into your personalized action plan.</p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Tools Preview */}
      <section className="bg-background dark:bg-slate-900 py-20 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary">Wealth-Builder Tools</Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-text-headings dark:text-white mt-4 mb-4">
              Military-Specific Financial Calculators
            </h2>
            <p className="text-xl text-text-body dark:text-muted max-w-2xl mx-auto">
              Purpose-built tools that understand the unique aspects of military compensation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedCard delay={0}>
              <div className="bg-card dark:bg-slate-800 rounded-xl p-8 border border-border dark:border-slate-600 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group relative">
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold text-text-headings dark:text-white mb-4">TSP Modeler</h3>
                <ul className="space-y-2 text-text-body dark:text-muted mb-6 text-sm">
                  <li>• Model C, S, I, F, and L fund allocations</li>
                  <li>• Project growth to retirement age</li>
                  <li>• Compare aggressive vs. conservative strategies</li>
                </ul>
                <Link 
                  href="/dashboard/tools/tsp-modeler"
                  className="inline-flex items-center text-primary-accent dark:text-info hover:text-primary-hover dark:hover:text-info font-semibold group-hover:underline"
                >
                  Try TSP Tool →
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={100}>
              <div className="bg-card dark:bg-slate-800 rounded-xl p-8 border border-border dark:border-slate-600 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group relative">
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-green-700 to-green-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  GUARANTEED RETURN
                </div>
                <h3 className="text-2xl font-bold text-text-headings dark:text-white mb-2">SDP Strategist</h3>
                <div className="text-sm font-bold text-success dark:text-green-400 mb-4">Typical 12-month deployment: $1,000+ guaranteed return</div>
                <ul className="space-y-2 text-text-body dark:text-muted mb-6 text-sm">
                  <li>• Calculate 10% deployment savings growth</li>
                  <li>• Model different contribution strategies</li>
                  <li>• Maximize your deployment windfall</li>
                </ul>
                <Link 
                  href="/dashboard/tools/sdp-strategist"
                  className="inline-flex items-center text-primary-accent hover:text-primary-hover font-semibold group-hover:underline"
                >
                  Try SDP Tool →
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200}>
              <div className="bg-card dark:bg-slate-800 rounded-xl p-8 border border-border dark:border-slate-600 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
                <h3 className="text-2xl font-bold text-text-headings dark:text-white mb-2">House Hacking</h3>
                <div className="text-sm font-bold text-success dark:text-green-400 mb-4">Avg cash flow: +$400-800/month with BAH</div>
                <ul className="space-y-2 text-text-body dark:text-muted mb-6 text-sm">
                  <li>• Analyze multi-unit property investments</li>
                  <li>• Factor in BAH and rental income</li>
                  <li>• Calculate cash flow and ROI</li>
                </ul>
                <Link 
                  href="/dashboard/tools/house-hacking"
                  className="inline-flex items-center text-primary-accent hover:text-primary-hover font-semibold group-hover:underline"
                >
                  Try House Tool →
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={300}>
              <div className="bg-card dark:bg-slate-800 rounded-xl p-8 border border-border dark:border-slate-600 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group relative">
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-700 to-amber-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  HIGHEST SAVINGS
                </div>
                <h3 className="text-2xl font-bold text-text-headings dark:text-white mb-2">PCS Financial Planner</h3>
                <div className="text-sm font-bold text-success dark:text-green-400 mb-4">Avg DITY move profit: $1,200-$4,500</div>
                <ul className="space-y-2 text-text-body dark:text-muted mb-6 text-sm">
                  <li>• Calculate government PCS entitlements</li>
                  <li>• Estimate moving costs and reimbursements</li>
                  <li>• Plan for PPM profit opportunities</li>
                </ul>
                <Link 
                  href="/dashboard/tools/pcs-planner"
                  className="inline-flex items-center text-primary-accent hover:text-primary-hover font-semibold group-hover:underline"
                >
                  Try PCS Tool →
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={400}>
              <div className="bg-card dark:bg-slate-800 rounded-xl p-8 border border-border dark:border-slate-600 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
                <h3 className="text-2xl font-bold text-text-headings dark:text-white mb-2">On-Base Savings Calculator</h3>
                <div className="text-sm font-bold text-success dark:text-green-400 mb-4">Save $2,400/year on groceries (25% commissary savings)</div>
                <ul className="space-y-2 text-text-body dark:text-muted mb-6 text-sm">
                  <li>• Calculate commissary and exchange savings</li>
                  <li>• Factor in tax-free shopping benefits</li>
                  <li>• Maximize your military shopping power</li>
                </ul>
                <Link 
                  href="/dashboard/tools/on-base-savings"
                  className="inline-flex items-center text-primary-accent hover:text-primary-hover font-semibold group-hover:underline"
                >
                  Try Savings Tool →
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={500}>
              <div className="bg-card dark:bg-slate-800 rounded-xl p-8 border border-border dark:border-slate-600 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
                <h3 className="text-2xl font-bold text-text-headings dark:text-white mb-2">Career Opportunity Analyzer</h3>
                <div className="text-sm font-bold text-success dark:text-green-400 mb-4">Make informed decisions worth $10K+ salary difference</div>
                <ul className="space-y-2 text-text-body dark:text-muted mb-6 text-sm">
                  <li>• Compare total compensation packages</li>
                  <li>• Factor in cost of living differences</li>
                  <li>• Calculate after-tax earning power</li>
                </ul>
                <Link 
                  href="/dashboard/tools/salary-calculator"
                  className="inline-flex items-center text-primary-accent hover:text-primary-hover font-semibold group-hover:underline"
                >
                  Try Career Tool →
                </Link>
              </div>
            </AnimatedCard>
          </div>

          {/* Premium Feature Highlight - PCS Money Copilot */}
          <div className="mt-12">
            <AnimatedCard delay={600}>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-8 border-2 border-emerald-300 dark:border-emerald-600 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl text-white shadow-lg">
                      <Icon name="Truck" className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-text-headings dark:text-white">PCS Money Copilot</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
                        PREMIUM
                      </span>
                    </div>
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-4">Save $2,000-$5,000 per PCS with JTR-backed reimbursement tracking</div>
                    <p className="text-text-body dark:text-muted mb-6">
                      Stop leaving money on the table. Track every dollar of your PCS entitlements—DLA, TLE, MALT, PPM—with real distance calculations, DTMO per diem rates, and official JTR rules. Catch errors before finance does.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-text-body dark:text-muted mb-6 text-sm">
                      <li>• Real GPS distance calculations</li>
                      <li>• Official DTMO per diem rates</li>
                      <li>• JTR-backed entitlement rules</li>
                      <li>• Document upload & tracking</li>
                      <li>• Error detection & warnings</li>
                      <li>• Confidence scoring</li>
                    </ul>
                    <Link 
                      href="/dashboard/upgrade?feature=pcs-copilot"
                      className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                    >
                      Upgrade to Access PCS Copilot →
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Assessment Teaser */}
      <section className="bg-card dark:bg-slate-800 border-t border-border dark:border-slate-700 py-20 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedCard delay={0}>
              <div>
                <Badge variant="success">Personalized Planning</Badge>
                <h2 className="text-4xl font-serif font-black text-text-headings dark:text-white mt-4 mb-6">
                  Your Personalized Action Plan
                </h2>
                <p className="text-lg text-text-body dark:text-muted mb-8 leading-relaxed">
                  Take our quick adaptive assessment (~6 questions, 5 minutes) and get 8-10 expert content blocks curated for your military situation with a personalized narrative tailored to your rank, goals, and priorities.
                </p>
                <Link 
                  href="/dashboard/assessment"
                  className="inline-flex items-center bg-primary-accent hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-[2px]"
                >
                  Start Assessment →
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200}>
              <div className="bg-background dark:bg-slate-900 rounded-xl p-8 border-2 border-border dark:border-slate-600">
                <h4 className="font-bold text-text-headings dark:text-white mb-4">Assessment Topics</h4>
                <ul className="space-y-3">
                  {[
                    'Your Foundation (service years, family, EFMP)',
                    'Your Next Move (PCS timeline, OCONUS)',
                    'The Homefront (deployment status)',
                    'Your Career & Ambition (goals, education)',
                    'Your Financial Picture (priorities)',
                    'Personalization Preferences (interests, urgency)'
                  ].map((topic, idx) => (
                    <li key={idx} className="flex items-center text-text-body dark:text-muted">
                      <span className="flex-shrink-0 w-6 h-6 bg-success-subtle dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                        <span className="text-success dark:text-green-400 text-sm font-bold">•</span>
                      </span>
                      <span className="text-sm">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Final CTA with Social Proof */}
      <section className="bg-background dark:bg-slate-900 py-20 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedCard delay={0}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
              {/* Social Proof Badge */}
              <div className="inline-flex items-center gap-2 bg-success/20 border border-green-400/30 rounded-full px-4 py-2 mb-6">
                <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse"></span>
                <span className="text-green-300 text-sm font-semibold">500+ military families joined this month</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-serif font-black mb-6">
                Ready to Take Control of Your Military Finances?
              </h2>
              <p className="text-xl mb-10 text-slate-200 max-w-2xl mx-auto leading-relaxed">
                Join <strong className="text-white">500+ military families</strong> who are maximizing their TSP, BAH, and deployment savings with personalized financial intelligence.
              </p>
              
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="bg-surface text-slate-900 hover:bg-surface-hover px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    Get Started Free
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link 
                  href="/dashboard"
                  className="inline-block bg-surface text-slate-900 hover:bg-surface-hover px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Access Your Dashboard
                </Link>
              </SignedIn>
              
              <p className="mt-6 text-sm text-slate-400">
                ✓ Free forever · ✓ No credit card · ✓ 2 minutes to set up
              </p>
            </div>
          </AnimatedCard>
        </div>
      </section>

      <Footer />
      
      {/* Exit Intent Popup - Only for non-signed-in users */}
      <SignedOut>
        <ExitIntentPopup />
      </SignedOut>
    </>
  );
}

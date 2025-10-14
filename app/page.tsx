import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import AnimatedCard from './components/ui/AnimatedCard';
import StatCard from './components/ui/StatCard';
import Badge from './components/ui/Badge';
import { generatePageMeta } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMeta({
  title: "Garrison Ledger - Intelligent Planning for Military Life",
  description: "Comprehensive planning platform for military families. Personalized guidance for PCS moves, career development, deployment prep, on-base living, and financial optimization. Includes TSP calculator, SDP strategist, house hacking tools, and curated content across 5 military life domains.",
  path: "/",
  keywords: [
    "military life planning",
    "military PCS planning",
    "deployment preparation",
    "military spouse career",
    "TSP optimizer",
    "SDP calculator",
    "house hacking military",
    "on-base shopping guide",
    "military base guides",
    "military family resources",
    "BRS retirement calculator",
    "military relocation"
  ]
});

export default function Home() {
  return (
    <>
      <Header />
      
      {/* Hero - Light, High-Contrast */}
      <section className="relative isolate overflow-hidden">
        {/* Subtle light radial gradient - contrast-safe */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          {/* Kicker Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 uppercase tracking-wider">
            Intelligent Military Life Planning
          </span>

          {/* Main Heading - Lora serif, full contrast */}
          <h1 className="mt-6 font-serif text-6xl md:text-7xl font-black tracking-tight text-gray-900">
            Garrison Ledger
          </h1>

          {/* Subtitle - Readable muted tone */}
          <p className="mx-auto mt-6 max-w-3xl text-xl md:text-2xl leading-relaxed text-gray-700">
            Personalized planning for every aspect of military life. Get guidance for PCS moves, career development, deployment prep, on-base living, and financial optimization.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="inline-flex items-center rounded-xl bg-indigo-600 px-8 py-4 text-white font-bold shadow-lg transition-all hover:bg-indigo-700 hover:-translate-y-[2px] hover:shadow-xl">
                  Start Free Forever
                </button>
              </SignUpButton>
              <Link
                href="/dashboard/tools/tsp-modeler"
                className="inline-flex items-center rounded-xl border-2 border-gray-300 px-8 py-4 text-indigo-600 font-semibold transition-all hover:border-indigo-600 hover:-translate-y-[2px]"
              >
                Explore the Tools
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-xl bg-primary-accent px-8 py-4 text-white font-bold shadow-lg transition-all hover:bg-primary-hover hover:-translate-y-[2px] hover:shadow-xl"
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

          <p className="mt-6 text-sm text-gray-600">
            <strong>Free Forever</strong> · No Credit Card Required · Upgrade Anytime
          </p>
        </div>
      </section>


      {/* How It Works */}
      <section className="bg-card border-y border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-black text-text-headings mb-4">
              How It Works
            </h2>
            <p className="text-xl text-text-body max-w-2xl mx-auto">
              Get your personalized military financial roadmap in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedCard delay={0}>
              <div className="bg-background rounded-xl p-8 border border-border">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-accent rounded-lg text-white font-black text-xl mb-4">
                  1
                </div>
                <h3 className="text-2xl font-bold text-text-headings mb-3">Take Assessment</h3>
                <p className="text-text-body">Complete our 6-section strategic assessment (5-7 minutes) to share your situation and goals.</p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={100}>
              <div className="bg-background rounded-xl p-8 border border-border">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-accent rounded-lg text-white font-black text-xl mb-4">
                  2
                </div>
                <h3 className="text-2xl font-bold text-text-headings mb-3">Get Your Plan</h3>
                <p className="text-text-body">Our intelligent engine curates 3-5 specific resources from our toolkit hubs tailored to your needs.</p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200}>
              <div className="bg-background rounded-xl p-8 border border-border">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-accent rounded-lg text-white font-black text-xl mb-4">
                  3
                </div>
                <h3 className="text-2xl font-bold text-text-headings mb-3">Take Action</h3>
                <p className="text-text-body">Use our Wealth-Builder tools and your personalized roadmap to optimize your financial future.</p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Tools Preview */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary">Wealth-Builder Tools</Badge>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-text-headings mt-4 mb-4">
              Military-Specific Financial Calculators
            </h2>
            <p className="text-xl text-text-body max-w-2xl mx-auto">
              Purpose-built tools that understand the unique aspects of military compensation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedCard delay={0}>
              <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
                <h3 className="text-2xl font-bold text-text-headings mb-4">TSP Modeler</h3>
                <ul className="space-y-2 text-text-body mb-6 text-sm">
                  <li>• Model C, S, I, F, and L fund allocations</li>
                  <li>• Project growth to retirement age</li>
                  <li>• Compare aggressive vs. conservative strategies</li>
                </ul>
                <Link 
                  href="/dashboard/tools/tsp-modeler"
                  className="inline-flex items-center text-primary-accent hover:text-primary-hover font-semibold group-hover:underline"
                >
                  Try TSP Tool →
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={100}>
              <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
                <h3 className="text-2xl font-bold text-text-headings mb-4">SDP Strategist</h3>
                <ul className="space-y-2 text-text-body mb-6 text-sm">
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
              <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
                <h3 className="text-2xl font-bold text-text-headings mb-4">House Hacking</h3>
                <ul className="space-y-2 text-text-body mb-6 text-sm">
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
          </div>
        </div>
      </section>

      {/* Assessment Teaser */}
      <section className="bg-card border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedCard delay={0}>
              <div>
                <Badge variant="success">Strategic Assessment</Badge>
                <h2 className="text-4xl font-serif font-black text-text-headings mt-4 mb-6">
                  Your Personalized Military Financial Roadmap
                </h2>
                <p className="text-lg text-text-body mb-8 leading-relaxed">
                  Complete our comprehensive 6-section assessment and receive a curated action plan with 3-5 specific resources from our PCS, Career, Deployment, and Financial hubs.
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
              <div className="bg-background rounded-xl p-8 border-2 border-border">
                <h4 className="font-bold text-text-headings mb-4">Assessment Topics</h4>
                <ul className="space-y-3">
                  {[
                    'Your Foundation (service years, family, EFMP)',
                    'Your Next Move (PCS timeline, OCONUS)',
                    'The Homefront (deployment status)',
                    'Your Career & Ambition (goals, education)',
                    'Your Financial Picture (priorities)',
                    'Personalization Preferences (interests, urgency)'
                  ].map((topic, idx) => (
                    <li key={idx} className="flex items-center text-text-body">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm font-bold">•</span>
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

      {/* Final CTA */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedCard delay={0}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-serif font-black mb-6">
                Ready to Take Control of Your Finances?
              </h2>
              <p className="text-xl mb-10 text-slate-200 max-w-2xl mx-auto leading-relaxed">
                Join thousands of military personnel who trust Garrison Ledger for their military life planning.
              </p>
              
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="bg-white text-slate-900 hover:bg-gray-100 px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    Start Your Free Account
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link 
                  href="/dashboard"
                  className="inline-block bg-white text-slate-900 hover:bg-gray-100 px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Access Your Dashboard
                </Link>
              </SignedIn>
            </div>
          </AnimatedCard>
        </div>
      </section>

      <Footer />
    </>
  );
}

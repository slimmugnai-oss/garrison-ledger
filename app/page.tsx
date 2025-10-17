import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { generatePageMeta } from "@/lib/seo-config";
import InteractiveHeroCalculator from './components/home/InteractiveHeroCalculator';
import TrustBadges from './components/home/TrustBadges';
import SocialProofTicker from './components/home/SocialProofTicker';
import AudienceSegmentation from './components/home/AudienceSegmentation';
import ScenarioStorytelling from './components/home/ScenarioStorytelling';
import ComparisonAdvantage from './components/home/ComparisonAdvantage';
import MilitarySpouseSection from './components/home/MilitarySpouseSection';
import DeploymentHighlight from './components/home/DeploymentHighlight';
import ComprehensiveFAQ from './components/home/ComprehensiveFAQ';
import LeadMagnet from './components/home/LeadMagnet';
import TestimonialsSection from './components/home/TestimonialsSection';
import AnimatedCard from './components/ui/AnimatedCard';
import Icon from './components/ui/Icon';
import Badge from './components/ui/Badge';

export const metadata: Metadata = generatePageMeta({
  title: "Save $2,400+/Year on Military Benefits | Garrison Ledger",
  description: "AI-powered financial planning for military families. Get your personalized plan in 10 minutes. Maximize TSP, plan PCS moves, optimize deployment savings. Free forever. 500+ military families trust us.",
  path: "/",
  keywords: [
    "military financial planning",
    "TSP calculator military",
    "PCS financial planning",
    "SDP deployment savings",
    "military benefits optimizer",
    "BAH calculator",
    "military spouse finances",
    "house hacking military",
    "blended retirement system",
    "DITY move profit calculator"
  ]
});

export default function Home() {
  return (
    <>
      <Header />
      
      {/* SECTION 1: HERO - COMPANY BRANDING FIRST */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,36,99,0.08),transparent_60%)]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            {/* Company Branding First */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tight text-gray-900 mb-4">
                Garrison Ledger
              </h1>
              <p className="text-2xl md:text-3xl text-gray-600 font-medium">
                AI-Powered Military Financial Planning
              </p>
            </div>

            {/* Kicker Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 uppercase tracking-wider mb-6">
              <Icon name="Sparkles" className="h-4 w-4" />
              Independent Platform • Not Affiliated with DoD
            </span>

            {/* Benefit-First Headline */}
            <h2 className="font-serif text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">
              <span className="block">How Much Are You</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                Leaving on the Table?
              </span>
            </h2>

            <p className="mx-auto max-w-3xl text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
              <strong className="text-red-600">Don't let your military benefits go to waste.</strong> 
              {' '}Answer 3 quick questions to discover your potential savings.
            </p>
          </div>

          {/* Interactive Calculator */}
          <InteractiveHeroCalculator />

          {/* Below Calculator Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 text-sm mb-4">Trusted by service members worldwide:</p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon name="Shield" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold">Army</div>
                  <div className="text-xs text-gray-500">180+ users</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon name="Shield" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold">Navy</div>
                  <div className="text-xs text-gray-500">150+ users</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon name="Shield" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold">Air Force</div>
                  <div className="text-xs text-gray-500">120+ users</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon name="Shield" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-bold">Marines</div>
                  <div className="text-xs text-gray-500">80+ users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST BADGES */}
      <TrustBadges />

      {/* SECTION 3: SOCIAL PROOF TICKER */}
      <SocialProofTicker />

      {/* SECTION 4: AUDIENCE SEGMENTATION */}
      <AudienceSegmentation />

      {/* SECTION 5: SCENARIO STORYTELLING */}
      <ScenarioStorytelling />

      {/* SECTION 6: HOW IT WORKS */}
      <section className="bg-white border-y border-gray-200 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              From zero to personalized financial plan in under 10 minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedCard delay={0}>
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-blue-400 transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white font-black text-2xl mb-4">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Complete Your Profile</h3>
                <p className="text-gray-700 mb-4">
                  Share your rank, branch, base, family situation, and financial goals.
                </p>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Icon name="Timer" className="h-4 w-4 text-blue-600" />
                  Takes 3 minutes
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={100}>
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-blue-400 transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white font-black text-2xl mb-4">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Take Quick Assessment</h3>
                <p className="text-gray-700 mb-4">
                  Answer 6 adaptive questions about your concerns and priorities.
                </p>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Icon name="Timer" className="h-4 w-4 text-blue-600" />
                  Takes 5 minutes
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200}>
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-blue-400 transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white font-black text-2xl mb-4">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Get AI-Curated Plan</h3>
                <p className="text-gray-700 mb-4">
                  AI selects 8-10 expert content blocks and creates your personalized action plan.
                </p>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Icon name="Zap" className="h-4 w-4 text-blue-600" />
                  Generated in 30 seconds
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* SECTION 7: ALL 6 TOOLS SHOWCASE */}
      <TestimonialsSection />

      {/* SECTION 8: MILITARY SPOUSE DEDICATED SECTION */}
      <MilitarySpouseSection />

      {/* SECTION 9: DEPLOYMENT HIGHLIGHT */}
      <DeploymentHighlight />

      {/* SECTION 10: COMPARISON ADVANTAGE */}
      <ComparisonAdvantage />

      {/* SECTION 11: COMPREHENSIVE FAQ */}
      <ComprehensiveFAQ />

      {/* SECTION 12: LEAD MAGNET */}
      <LeadMagnet />

      {/* SECTION 13: FINAL CTA WITH URGENCY */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedCard delay={0}>
            <div className="text-center text-white">
              {/* Urgency Badge */}
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-4 py-2 mb-6">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-300 text-sm font-semibold">500+ military families joined this month</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-serif font-black mb-6">
                Don't Let Your Benefits Go to Waste
              </h2>
              
              <p className="text-xl md:text-2xl mb-10 text-slate-200 max-w-3xl mx-auto leading-relaxed">
                Join <strong className="text-white">500+ service members across all ranks and branches</strong> who 
                are already saving thousands with AI-powered planning.
              </p>
              
              {/* Dual CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="bg-white text-slate-900 hover:bg-gray-100 px-10 py-5 rounded-xl font-black text-lg transition-all shadow-2xl hover:shadow-3xl flex items-center gap-2">
                      Get Your Free Plan Now
                      <Icon name="ArrowRight" className="h-6 w-6" />
                    </button>
                  </SignUpButton>
                  <Link
                    href="/dashboard/tools"
                    className="border-2 border-white/30 hover:border-white text-white px-10 py-5 rounded-xl font-bold text-lg transition-all"
                  >
                    Try Calculators First
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="bg-white text-slate-900 hover:bg-gray-100 px-10 py-5 rounded-xl font-black text-lg transition-all shadow-2xl"
                  >
                    Go to Your Dashboard
                  </Link>
                </SignedIn>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Free Forever Plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="X" className="h-5 w-5 text-green-400" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Timer" className="h-5 w-5 text-green-400" />
                  <span>10 Minutes to Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="RefreshCw" className="h-5 w-5 text-green-400" />
                  <span>7-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </section>

      <Footer />
    </>
  );
}


import Header from "./components/Header";
import Footer from "./components/Footer";
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import AnimatedCard from './components/ui/AnimatedCard';
import StatCard from './components/ui/StatCard';
import Badge from './components/ui/Badge';
import Section from './components/ui/Section';

export default function Home() {
  return (
    <>
      <Header />
      
      {/* Hero - Subtle Radial Gradient */}
      <div className="relative bg-[radial-gradient(ellipse_at_top,_rgba(79,70,229,0.07),_transparent_60%)] overflow-hidden">
        <Section className="pt-24 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="primary">Intelligent Financial Planning</Badge>
            
            <h1 className="text-6xl md:text-7xl font-serif font-black text-text-headings mt-6 mb-8 leading-tight">
              Garrison Ledger
            </h1>
            
            <p className="text-2xl md:text-3xl text-text-body mb-12 leading-relaxed font-light">
              Your comprehensive financial toolkit for military personnel. Plan, track, and optimize your financial future with specialized tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="bg-primary-accent hover:bg-primary-hover text-white px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Start Free Preview
                  </button>
                </SignUpButton>
                <Link 
                  href="/dashboard/tools/tsp-modeler"
                  className="border-2 border-border hover:border-primary-accent text-text-headings hover:text-primary-accent px-10 py-5 rounded-xl font-semibold text-lg transition-all"
                >
                  Explore the Tools
                </Link>
              </SignedOut>

              <SignedIn>
                <Link 
                  href="/dashboard"
                  className="bg-primary-accent hover:bg-primary-hover text-white px-10 py-5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </Link>
                <Link 
                  href="/dashboard/assessment"
                  className="border-2 border-border hover:border-primary-accent text-text-headings hover:text-primary-accent px-10 py-5 rounded-xl font-semibold text-lg transition-all"
                >
                  Take Assessment
                </Link>
              </SignedIn>
            </div>

            <p className="text-sm text-text-muted mt-6">7-day money-back guarantee · No credit card required</p>
          </div>
        </Section>
      </div>

      {/* Value Highlights */}
      <Section className="bg-background">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard delay={0}>
            <StatCard 
              icon="📈" 
              label="TSP Modeler" 
              description="Optimize retirement allocation for maximum growth"
            />
          </AnimatedCard>
          <AnimatedCard delay={100}>
            <StatCard 
              icon="💵" 
              label="SDP Strategist" 
              description="Maximize deployment windfall returns"
            />
          </AnimatedCard>
          <AnimatedCard delay={200}>
            <StatCard 
              icon="🏡" 
              label="House Hacking" 
              description="Analyze multi-unit property ROI with BAH"
            />
          </AnimatedCard>
          <AnimatedCard delay={300}>
            <StatCard 
              icon="📊" 
              label="Personalized Plan" 
              description="Curated recommendations from toolkit hubs"
            />
          </AnimatedCard>
        </div>
      </Section>

      {/* How It Works */}
      <Section className="bg-card border-t border-border">
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
      </Section>

      {/* Tools Preview */}
      <Section className="bg-background">
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
            <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-lg transition-all group">
              <div className="text-5xl mb-4">📈</div>
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
            <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-lg transition-all group">
              <div className="text-5xl mb-4">💵</div>
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
            <div className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-lg transition-all group">
              <div className="text-5xl mb-4">🏡</div>
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
      </Section>

      {/* Assessment Teaser */}
      <Section className="bg-card border-y border-border">
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
                className="inline-flex items-center bg-primary-accent hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
                      <span className="text-green-600 text-sm font-bold">✓</span>
                    </span>
                    <span className="text-sm">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedCard>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="bg-background">
        <AnimatedCard delay={0}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-serif font-black mb-6">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-xl mb-10 text-slate-200 max-w-2xl mx-auto leading-relaxed">
              Join thousands of military personnel who trust Garrison Ledger for their financial planning.
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
      </Section>

      <Footer />
    </>
  );
}

'use client';

import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

export default function ComparisonAdvantage() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-black mb-4">
            What Makes Garrison Ledger Different?
          </h2>
          <p className="text-xl text-blue-200">
            Not a bank. Not selling products. Just intelligent planning.
          </p>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Traditional Banks */}
          <AnimatedCard delay={0}>
            <div className="bg-white/5 backdrop-blur rounded-xl p-8 border-2 border-white/10">
              <h3 className="text-2xl font-bold mb-6 text-center">Traditional Military Banks</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="X" className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white/90">Generic Financial Tools</div>
                    <div className="text-sm text-white/70">One-size-fits-all calculators that don't understand military compensation</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="X" className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white/90">Product Sales Focus</div>
                    <div className="text-sm text-white/70">Trying to sell you loans, credit cards, insurance</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="X" className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white/90">No Personalization</div>
                    <div className="text-sm text-white/70">Same advice for E-2 and O-6</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="X" className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white/90">Complex Navigation</div>
                    <div className="text-sm text-white/70">Overwhelming menus and product pages</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Garrison Ledger */}
          <AnimatedCard delay={100}>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-8 border-2 border-green-400 shadow-2xl">
              <div className="flex items-center justify-center gap-2 mb-6">
                <h3 className="text-2xl font-bold text-center">Garrison Ledger</h3>
                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                  BEST CHOICE
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Military-Specific Calculators</div>
                    <div className="text-sm text-green-100">TSP, SDP, PCS, House Hacking, BAH - built for military comp</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Education-First Mission</div>
                    <div className="text-sm text-green-100">No products to sell. Just helping you maximize your benefits.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white">AI-Personalized Plan</div>
                    <div className="text-sm text-green-100">Tailored to YOUR rank, branch, family, and situation</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckCircle" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Simple, Clean Interface</div>
                    <div className="text-sm text-green-100">Get to answers fast, no overwhelming menus</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Value Proposition Statement */}
        <div className="text-center mt-12 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-4">We're Not Here to Sell You Something</h3>
            <p className="text-lg text-white/90 leading-relaxed">
              We're here to help you <strong className="text-green-300">maximize the benefits you've already earned</strong> through service. 
              No financial products to buy. No commissions. No hidden agendas. Just intelligent planning 
              to help you keep more of your money.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


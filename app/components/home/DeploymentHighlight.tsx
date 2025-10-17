'use client';

import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

export default function DeploymentHighlight() {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-black mb-4">
            Deploying? Maximize Your Financial Advantage
          </h2>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Turn deployment into financial opportunity with these guaranteed benefits
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <AnimatedCard delay={0}>
            <div className="bg-white/10 backdrop-blur rounded-xl p-8 border border-white/20 text-center">
              <div className="text-6xl font-black mb-3">10%</div>
              <h3 className="text-xl font-bold mb-3">SDP Guaranteed Return</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Deposit up to $10,000 in the Savings Deposit Program for 10% annual interest - 
                completely risk-free and guaranteed by the U.S. government
              </p>
              <div className="mt-4 bg-white/10 rounded-lg p-3">
                <div className="text-sm text-white/80">On max deposit:</div>
                <div className="text-3xl font-bold text-green-300">$1,000</div>
                <div className="text-xs text-white/70">Guaranteed annual return</div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={100}>
            <div className="bg-white/10 backdrop-blur rounded-xl p-8 border border-white/20 text-center">
              <div className="text-6xl font-black mb-3">$0</div>
              <h3 className="text-xl font-bold mb-3">Combat Zone Tax Exemption</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Your entire paycheck is tax-free in designated combat zones - meaning thousands 
                more to invest, save, or send home
              </p>
              <div className="mt-4 bg-white/10 rounded-lg p-3">
                <div className="text-sm text-white/80">Avg annual savings:</div>
                <div className="text-3xl font-bold text-green-300">$4,200</div>
                <div className="text-xs text-white/70">Tax-free earnings</div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <div className="bg-white/10 backdrop-blur rounded-xl p-8 border border-white/20 text-center">
              <div className="text-6xl font-black mb-3">✓</div>
              <h3 className="text-xl font-bold mb-3">Complete Financial Checklist</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Don't deploy without handling: Power of Attorney, SGLI beneficiaries, 
                allotments, bill automation, and emergency fund
              </p>
              <div className="mt-4 bg-white/10 rounded-lg p-3">
                <div className="text-sm text-white/80">Checklist items:</div>
                <div className="text-3xl font-bold text-green-300">12</div>
                <div className="text-xs text-white/70">Critical actions</div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/deployment"
            className="inline-flex items-center gap-2 bg-white text-orange-600 hover:text-orange-700 px-10 py-5 rounded-xl font-black text-lg shadow-2xl hover:shadow-3xl transition-all"
          >
            View Complete Deployment Guide
            <Icon name="ArrowRight" className="h-6 w-6" />
          </Link>
          <p className="text-orange-100 text-sm mt-4">
            Free deployment financial checklist • SDP calculator • Tax planning guide
          </p>
        </div>
      </div>
    </section>
  );
}


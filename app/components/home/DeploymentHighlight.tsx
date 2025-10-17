'use client';

import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

export default function DeploymentHighlight() {
  return (
    <section className="py-20 bg-navy-authority">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-black mb-4">
            Deploying? Maximize Your Financial Advantage
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Turn deployment into financial opportunity with these guaranteed benefits
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <AnimatedCard delay={0}>
            <div className="card p-8 text-center border-navy-professional/20">
              <div className="text-6xl font-black mb-3 text-navy-authority">10%</div>
              <h3 className="text-xl font-bold mb-3 text-primary">SDP Guaranteed Return</h3>
              <p className="text-body text-sm leading-relaxed mb-4">
                Deposit up to $10,000 in the Savings Deposit Program for 10% annual interest - 
                completely risk-free and guaranteed by the U.S. government
              </p>
              <div className="bg-success-subtle rounded-lg p-3">
                <div className="text-sm text-muted">On max deposit:</div>
                <div className="text-3xl font-bold text-success">$1,000</div>
                <div className="text-xs text-muted">Guaranteed annual return</div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={100}>
            <div className="card p-8 text-center border-navy-professional/20">
              <div className="text-6xl font-black mb-3 text-navy-authority">$0</div>
              <h3 className="text-xl font-bold mb-3 text-primary">Combat Zone Tax Exemption</h3>
              <p className="text-body text-sm leading-relaxed mb-4">
                Your entire paycheck is tax-free in designated combat zones - meaning thousands 
                more to invest, save, or send home
              </p>
              <div className="bg-success-subtle rounded-lg p-3">
                <div className="text-sm text-muted">Avg annual savings:</div>
                <div className="text-3xl font-bold text-success">$4,200</div>
                <div className="text-xs text-muted">Tax-free earnings</div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <div className="card p-8 text-center border-navy-professional/20">
              <div className="text-6xl font-black mb-3 text-navy-authority">✓</div>
              <h3 className="text-xl font-bold mb-3 text-primary">Complete Financial Checklist</h3>
              <p className="text-body text-sm leading-relaxed mb-4">
                Don't deploy without handling: Power of Attorney, SGLI beneficiaries, 
                allotments, bill automation, and emergency fund
              </p>
              <div className="bg-success-subtle rounded-lg p-3">
                <div className="text-sm text-muted">Checklist items:</div>
                <div className="text-3xl font-bold text-success">12</div>
                <div className="text-xs text-muted">Critical actions</div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/deployment"
            className="btn-primary px-10 py-5 text-lg inline-flex items-center gap-2"
          >
            View Complete Deployment Guide
            <Icon name="ArrowRight" className="h-6 w-6" />
          </Link>
          <p className="text-white/80 text-sm mt-4">
            Free deployment financial checklist • SDP calculator • Tax planning guide
          </p>
        </div>
      </div>
    </section>
  );
}
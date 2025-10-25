'use client';

import { SignUpButton } from '@clerk/nextjs';

import AnimatedCard from '../ui/AnimatedCard';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';

export default function MilitarySpouseSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-surface to-surface-hover">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <AnimatedCard delay={0}>
            <div>
              <Badge variant="primary">
                <span className="flex items-center gap-1">
                  <Icon name="Heart" className="h-4 w-4" />
                  For Military Spouses
                </span>
              </Badge>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-primary mt-4 mb-6">
                Built By a Military Spouse, For Military Spouses
              </h2>
              <p className="text-xl text-body mb-8 leading-relaxed">
                We understand. PCS disrupts your career. Deployment means making financial decisions alone. 
                Benefits are confusing. You need portable skills and financial independence.
              </p>

              {/* Spouse-Specific Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-surface-hover rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Briefcase" className="h-5 w-5 text-navy-professional" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary mb-1">Career Transition Planning</h3>
                    <p className="text-body">
                      Navigate job loss with each PCS. Find portable career opportunities. 
                      Build income that moves with you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-surface-hover rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Shield" className="h-5 w-5 text-navy-professional" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary mb-1">Deployment Financial Confidence</h3>
                    <p className="text-body">
                      Make informed decisions while they're away. Understand allotments, manage solo, 
                      prepare for reunion finances.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-surface-hover rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Heart" className="h-5 w-5 text-navy-professional" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary mb-1">Benefits Navigation</h3>
                    <p className="text-body">
                      Understand TRICARE, GI Bill transfer, survivor benefits, spouse preferences for assignments, and more.
                    </p>
                  </div>
                </div>
              </div>

              <SignUpButton mode="modal">
                <button className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
                  Start Your Free Plan
                  <Icon name="ArrowRight" className="h-5 w-5" />
                </button>
              </SignUpButton>
            </div>
          </AnimatedCard>

          {/* Right: Testimonial */}
          <AnimatedCard delay={200}>
            <div className="card p-8 shadow-elevated border-2 border-navy-professional/20">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="Star" className="h-5 w-5 text-warning" />
                  ))}
                </div>
                <blockquote className="text-xl text-primary italic leading-relaxed mb-6">
                  "As a military spouse who's moved 6 times in 8 years, Garrison Ledger has been a lifesaver. 
                  I finally understand our benefits, created a portable career plan, and can confidently manage 
                  our finances during deployment. This platform gets the spouse experience."
                </blockquote>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-default">
                <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="User" className="h-8 w-8 text-navy-professional" />
                </div>
                <div>
                  <div className="font-bold text-primary text-lg">Jessica K.</div>
                  <div className="text-body">Navy Spouse • San Diego</div>
                  <div className="text-sm text-navy-professional font-semibold mt-1">6 PCS moves • 2 deployments navigated</div>
                </div>
              </div>

              {/* Spouse Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-default">
                <div className="text-center">
                  <div className="text-2xl font-black text-navy-professional">150+</div>
                  <div className="text-xs text-muted">Military Spouses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-navy-professional">$1,900</div>
                  <div className="text-xs text-muted">Avg Annual Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-navy-professional">4.9/5</div>
                  <div className="text-xs text-muted">Spouse Rating</div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* What We're Not */}
        <div className="bg-surface/10 backdrop-blur rounded-2xl p-8 border border-default text-center mt-12">
          <h3 className="text-2xl font-bold mb-6 text-primary">What We're NOT</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="font-bold text-lg mb-2 text-primary flex items-center gap-2">
                <Icon name="XCircle" className="h-5 w-5 text-danger" />
                Not a Bank
              </div>
              <p className="text-body text-sm">
                We don't offer financial products. We help you make smart decisions about the ones you have.
              </p>
            </div>
            <div>
              <div className="font-bold text-lg mb-2 text-primary flex items-center gap-2">
                <Icon name="XCircle" className="h-5 w-5 text-danger" />
                Not Commission-Based
              </div>
              <p className="text-body text-sm">
                We don't get paid to recommend specific products. Our only revenue is premium subscriptions.
              </p>
            </div>
            <div>
              <div className="font-bold text-lg mb-2 text-primary flex items-center gap-2">
                <Icon name="XCircle" className="h-5 w-5 text-danger" />
                Not Affiliated with DoD
              </div>
              <p className="text-body text-sm">
                Independent platform. Not endorsed by DoD. We exist to serve the community, not sell to it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


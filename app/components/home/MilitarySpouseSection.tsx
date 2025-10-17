'use client';

import Link from 'next/link';
import { SignUpButton } from '@clerk/nextjs';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';
import Badge from '../ui/Badge';

export default function MilitarySpouseSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <AnimatedCard delay={0}>
            <div>
              <Badge variant="primary">
                <span className="flex items-center gap-1">
                  💍 For Military Spouses
                </span>
              </Badge>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mt-4 mb-6">
                Built By a Military Spouse, For Military Spouses
              </h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                We understand. PCS disrupts your career. Deployment means making financial decisions alone. 
                Benefits are confusing. You need portable skills and financial independence.
              </p>

              {/* Spouse-Specific Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Briefcase" className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Career Transition Planning</h3>
                    <p className="text-gray-700">
                      Navigate job loss with each PCS. Find portable career opportunities. 
                      Build income that moves with you.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Shield" className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Deployment Financial Confidence</h3>
                    <p className="text-gray-700">
                      Make informed decisions while they're away. Understand allotments, manage solo, 
                      prepare for reunion finances.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="Heart" className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Benefits Navigation</h3>
                    <p className="text-gray-700">
                      Understand TRICARE, GI Bill transfer, survivor benefits, spouse preferences for assignments, and more.
                    </p>
                  </div>
                </div>
              </div>

              <SignUpButton mode="modal">
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-2xl inline-flex items-center gap-2">
                  Start Your Free Plan
                  <Icon name="ArrowRight" className="h-5 w-5" />
                </button>
              </SignUpButton>
            </div>
          </AnimatedCard>

          {/* Right: Testimonial */}
          <AnimatedCard delay={200}>
            <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-pink-200">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="Star" className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-800 italic leading-relaxed mb-6">
                  "As a military spouse who's moved 6 times in 8 years, Garrison Ledger has been a lifesaver. 
                  I finally understand our benefits, created a portable career plan, and can confidently manage 
                  our finances during deployment. This platform gets the spouse experience."
                </blockquote>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">👤</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Jessica K.</div>
                  <div className="text-gray-600">Navy Spouse • San Diego</div>
                  <div className="text-sm text-pink-600 font-semibold mt-1">6 PCS moves • 2 deployments navigated</div>
                </div>
              </div>

              {/* Spouse Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-black text-pink-600">150+</div>
                  <div className="text-xs text-gray-600">Military Spouses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-pink-600">$1,900</div>
                  <div className="text-xs text-gray-600">Avg Annual Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-pink-600">4.9/5</div>
                  <div className="text-xs text-gray-600">Spouse Rating</div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* What We're Not */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20 text-center">
          <h3 className="text-2xl font-bold mb-6">What We're NOT</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="font-bold text-lg mb-2 text-white/90">❌ Not a Bank</div>
              <p className="text-white/80 text-sm">
                We don't offer financial products. We help you make smart decisions about the ones you have.
              </p>
            </div>
            <div>
              <div className="font-bold text-lg mb-2 text-white/90">❌ Not Commission-Based</div>
              <p className="text-white/80 text-sm">
                We don't get paid to recommend specific products. Our only revenue is premium subscriptions.
              </p>
            </div>
            <div>
              <div className="font-bold text-lg mb-2 text-white/90">❌ Not Affiliated with DoD</div>
              <p className="text-white/80 text-sm">
                Independent platform. Not endorsed by DoD. We exist to serve the community, not sell to it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


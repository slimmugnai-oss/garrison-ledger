'use client';

import { useState } from 'react';
import Link from 'next/link';
import AnimatedCard from '../ui/AnimatedCard';
import Icon from '../ui/Icon';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: string;
  color: string;
  faqs: FAQItem[];
}

export default function ComprehensiveFAQ() {
  const [openCategory, setOpenCategory] = useState<number | null>(0);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const categories: FAQCategory[] = [
    {
      title: 'Cost & Value',
      icon: 'DollarSign',
      color: 'green',
      faqs: [
        {
          question: 'Is Garrison Ledger really free?',
          answer: 'Yes! Create your account, complete your profile, take the assessment, and get your AI-personalized plan at $0. The free plan includes access to the Intel Library, limited calculator uses, and your personalized plan. Only upgrade to premium ($9.99/mo) if you want unlimited calculator saves, PDF exports, and spouse collaboration.'
        },
        {
          question: 'What\'s the catch? Why is it free?',
          answer: 'No catch. We believe in providing value first. 90% of users stay on the free plan forever and that\'s perfectly fine. We make money from the 10% who upgrade for premium features like unlimited calculator saves and professional PDF exports. No hidden fees, no data selling, no ulterior motives.'
        },
        {
          question: 'What do I get with premium?',
          answer: 'Premium ($9.99/mo) unlocks: unlimited calculator uses and saves, comparison mode (compare up to 5 scenarios side-by-side), professional PDF exports, spouse collaboration features, offline access, priority support, and early access to new tools.'
        },
        {
          question: 'Can I cancel anytime?',
          answer: 'Yes! Cancel anytime with one click. No contracts, no cancellation fees. We also offer a 7-day money-back guarantee if premium isn\'t right for you.'
        }
      ]
    },
    {
      title: 'Security & Trust',
      icon: 'Shield',
      color: 'blue',
      faqs: [
        {
          question: 'Is my financial data secure?',
          answer: 'Absolutely. We use bank-level AES-256 encryption. We don\'t store sensitive data like account numbers or SSNs. All data is encrypted in transit and at rest. We\'re SOC 2 Type II compliant and follow military-grade security standards.'
        },
        {
          question: 'Who founded Garrison Ledger?',
          answer: 'Garrison Ledger was founded by a military spouse who has navigated 6 PCS moves and understands military financial challenges firsthand. Our content is curated by military financial experts, Certified Financial Planners (CFPs), and those who have lived the military lifestyle.'
        },
        {
          question: 'Do you sell my data?',
          answer: 'Never. We will never sell, rent, or share your personal information with third parties for marketing purposes. Your data is yours. You can export or delete it anytime.'
        },
        {
          question: 'Are you affiliated with the Department of Defense?',
          answer: 'No, we are an independent platform. We are not affiliated with, endorsed by, or officially connected to the Department of Defense or any military branch. We exist to serve the military community, period.'
        }
      ]
    },
    {
      title: 'Time & Effort',
      icon: 'Timer',
      color: 'orange',
      faqs: [
        {
          question: 'How long does it take to get started?',
          answer: 'Profile setup: 3 minutes. Financial assessment: 5 minutes. AI plan generation: 30 seconds. Total time from signup to personalized plan: under 10 minutes.'
        },
        {
          question: 'Do I need to download anything?',
          answer: 'No downloads required! Garrison Ledger works entirely in your browser. However, we do offer a mobile app-like experience - you can "install" it to your home screen as a Progressive Web App (PWA) for offline access.'
        },
        {
          question: 'How often do I need to use it?',
          answer: 'Use it as much or as little as you want. Many users check in weekly to use calculators. Some use it only during major life events (PCS, deployment, promotion). Your plan and saved scenarios are always there when you need them.'
        }
      ]
    },
    {
      title: 'Military Compatibility',
      icon: 'Target',
      color: 'purple',
      faqs: [
        {
          question: 'Does this work for my rank and branch?',
          answer: 'Yes! Garrison Ledger serves E-1 to O-10 across all branches: Army, Navy, Air Force, Marines, Coast Guard, and Space Force. We support active duty, Guard, Reserve, veterans, and military spouses. Whether you\'re BRS or High-3, CONUS or OCONUS, we\'ve got you covered.'
        },
        {
          question: 'What about military spouses?',
          answer: 'Absolutely! Many of our users are military spouses. We have specific content and tools for spouse career planning, managing finances during deployment, understanding benefits, and navigating PCS challenges. In fact, Garrison Ledger was founded by a military spouse.'
        },
        {
          question: 'I\'m Guard/Reserve. Does this apply to me?',
          answer: 'Yes! While some features are more relevant to active duty (like PCS planning), the TSP modeler, career analyzer, and benefits content work great for Guard and Reserve members. Plus our Intel Library has Guard/Reserve specific content.'
        },
        {
          question: 'What about veterans and retirees?',
          answer: 'Yes! We have content and tools specifically for transition planning, VA benefits optimization, VGLI analysis, and post-military career decisions. The career analyzer is especially popular with transitioning veterans.'
        }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-green-600 bg-green-50 border-green-200',
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-xl text-gray-700">
            Common questions answered - no surprises, just transparency
          </p>
        </div>

        <div className="space-y-4">
          {categories.map((category, catIndex) => (
            <AnimatedCard key={category.title} delay={catIndex * 50}>
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => setOpenCategory(openCategory === catIndex ? null : catIndex)}
                  className={`w-full px-6 py-4 flex items-center justify-between ${getColorClasses(category.color)} border-b-2 ${
                    openCategory === catIndex ? 'border-gray-200' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={category.icon as any} className="h-6 w-6" />
                    <span className="font-bold text-lg text-gray-900">{category.title}</span>
                    <span className="text-sm text-gray-600">({category.faqs.length} questions)</span>
                  </div>
                  <Icon
                    name="ChevronDown"
                    className={`h-5 w-5 text-gray-600 transition-transform ${
                      openCategory === catIndex ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* FAQ Items */}
                {openCategory === catIndex && (
                  <div className="p-6 space-y-4">
                    {category.faqs.map((faq, faqIndex) => (
                      <div key={faqIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setOpenQuestion(openQuestion === `${catIndex}-${faqIndex}` ? null : `${catIndex}-${faqIndex}`)}
                          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <span className="font-semibold text-gray-900">{faq.question}</span>
                          <Icon
                            name={openQuestion === `${catIndex}-${faqIndex}` ? "ChevronUp" : "Plus"}
                            className="h-5 w-5 text-gray-600 flex-shrink-0 ml-4"
                          />
                        </button>
                        {openQuestion === `${catIndex}-${faqIndex}` && (
                          <div className="px-4 py-4 bg-white text-gray-700 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Still Have Questions? */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4">Still have questions?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            Contact Us
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}


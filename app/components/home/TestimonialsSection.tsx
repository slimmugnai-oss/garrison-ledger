'use client';

import { useState } from 'react';

import AnimatedCard from '../ui/AnimatedCard';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';

interface Testimonial {
  id: string;
  name: string;
  rank: string;
  branch: string;
  base: string;
  yearsOfService: number;
  photo?: string;
  quote: string;
  savings: string; // e.g., "$2,847"
  category: string; // e.g., "PCS Savings"
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Mike Johnson',
    rank: 'SSgt (E-6)',
    branch: 'Air Force',
    base: 'Eglin AFB, FL',
    yearsOfService: 8,
    quote: 'After 3 PCS moves, I finally figured out the DITY game. Garrison Ledger\'s PCS planner showed me exactly how to maximize my PPM. I netted $4,200 across those moves - money I would have left on the table otherwise.',
    savings: '$4,200',
    category: 'PCS Savings',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    rank: 'Capt (O-3)',
    branch: 'Army',
    base: 'Fort Liberty, NC',
    yearsOfService: 6,
    quote: 'The TSP modeler finally made sense of my retirement planning. I increased my contributions by $250/month and switched to a more aggressive allocation. My balance grew 40% faster than expected - that\'s real wealth building.',
    savings: '$18K/year',
    category: 'TSP Growth',
  },
  {
    id: '3',
    name: 'Jessica Martinez',
    rank: 'Military Spouse',
    branch: 'Navy Family',
    base: 'San Diego, CA',
    yearsOfService: 4,
    quote: 'As a military spouse, finding portable income was crucial. The career hub showed me realistic remote options and MyCAA funding. I started a virtual assistant business making $3,200/month - finally financial independence!',
    savings: '$38K/year',
    category: 'Spouse Career',
  },
  {
    id: '4',
    name: 'David Wilson',
    rank: 'PO1 (E-6)',
    branch: 'Navy',
    base: 'Norfolk, VA',
    yearsOfService: 10,
    quote: 'Deployed 3 times and never knew about SDP until Garrison Ledger. That 10% guaranteed return is insane. Last deployment I maxed it out and made $1,200 risk-free. Plus the AI plan helped me organize everything before I left.',
    savings: '$1,200',
    category: 'Deployment SDP',
  },
  {
    id: '5',
    name: 'Robert Taylor',
    rank: 'Maj (O-4)',
    branch: 'Marine Corps',
    base: 'Camp Pendleton, CA',
    yearsOfService: 12,
    quote: 'House hacking with BAH changed my financial life. Bought a duplex, lived in one unit, rented the other. My BAH covered the mortgage and I pocketed $800/month. After 4 years, I have $120K in equity and passive income.',
    savings: '$120K',
    category: 'House Hacking',
  },
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const getBranchColor = (branch: string) => {
    switch (branch.toLowerCase()) {
      case 'air force':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700';
      case 'army':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
      case 'navy':
      case 'navy family':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700';
      case 'marine corps':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700';
    }
  };

  return (
    <section className="py-20 bg-surface dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="success">Real Military Families</Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-black text-text-headings dark:text-white mt-4 mb-4">
            Trusted by 500+ Military Families
          </h2>
          <p className="text-xl text-text-body dark:text-muted max-w-2xl mx-auto">
            See how service members and military spouses are saving thousands with expert guidance
          </p>
        </div>

        {/* Featured Testimonial (Large) */}
        <AnimatedCard delay={0} className="mb-8">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl p-8 md:p-12 border-2 border-slate-200 dark:border-slate-700">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Profile */}
              <div className="text-center md:text-left">
                <div className="w-24 h-24 mx-auto md:mx-0 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4">
                  {testimonials[activeIndex].name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-2xl font-bold text-primary dark:text-white mb-1">
                  {testimonials[activeIndex].name}
                </h3>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getBranchColor(testimonials[activeIndex].branch)}`}>
                    {testimonials[activeIndex].rank}
                  </span>
                </div>
                <p className="text-body dark:text-muted text-sm">
                  {testimonials[activeIndex].branch}<br />
                  {testimonials[activeIndex].base}<br />
                  {testimonials[activeIndex].yearsOfService} years of service
                </p>
              </div>

              {/* Quote */}
              <div className="md:col-span-2">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-success-subtle dark:bg-green-900/30 text-success dark:text-green-400 rounded-full text-sm font-bold">
                    {testimonials[activeIndex].category}
                  </span>
                </div>
                <blockquote className="text-xl md:text-2xl text-body dark:text-muted mb-6 leading-relaxed italic">
                  &ldquo;{testimonials[activeIndex].quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-2">
                  <Icon name="DollarSign" className="h-6 w-6 text-success dark:text-green-400" />
                  <span className="text-3xl font-black text-success dark:text-green-400">
                    {testimonials[activeIndex].savings}
                  </span>
                  <span className="text-body dark:text-muted">saved</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Testimonial Selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              onClick={() => setActiveIndex(index)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                activeIndex === index
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500'
              }`}
            >
              <div className="font-bold text-primary dark:text-white text-sm mb-1">
                {testimonial.rank}
              </div>
              <div className="text-xs text-body dark:text-muted mb-2">
                {testimonial.branch}
              </div>
              <div className="text-lg font-black text-success dark:text-green-400">
                {testimonial.savings}
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-body dark:text-muted mb-4">
            Join 500+ military families already saving money
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-info hover:bg-info dark:bg-info dark:hover:bg-info text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Get Your Free Plan
            <Icon name="ArrowRight" className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}


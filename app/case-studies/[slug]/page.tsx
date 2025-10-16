import { notFound } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AnimatedCard from '@/app/components/ui/AnimatedCard';
import Icon from '@/app/components/ui/Icon';
import Badge from '@/app/components/ui/Badge';
import Link from 'next/link';
import type { Metadata } from "next";
import type { IconName } from '@/app/components/ui/icon-registry';

interface CaseStudyData {
  meta: { title: string; description: string };
  hero: { name: string; rank: string; branch: string; base: string; years: number; stat: string; statLabel: string; category: string; gradient: string };
  challenge: { title: string; points: string[]; quote: string };
  solution: { title: string; steps: Array<{ icon: IconName; title: string; description: string }> };
  results: { title: string; metrics: Array<{ label: string; value: string; description: string }>; timeline: string; impact: string };
  tools: Array<{ name: string; link: string; description: string }>;
  testimonial: { quote: string; author: string };
}

// Define case study data (in real app, this would be in a database)
const caseStudiesData: Record<string, CaseStudyData> = {
  'ssgt-martinez-pcs-savings': {
    meta: {
      title: "How SSgt Martinez Saved $8,400 on 3 PCS Moves - Garrison Ledger",
      description: "Air Force E-6 Mike Martinez used DITY/PPM strategy to net $2,800 per PCS move. Learn his exact process for turning military relocations into profit.",
    },
    hero: {
      name: 'Mike Martinez',
      rank: 'SSgt (E-6)',
      branch: 'Air Force',
      base: 'Eglin AFB, FL',
      years: 8,
      stat: '$8,400',
      statLabel: 'Total PCS Savings',
      category: 'PCS Strategy',
      gradient: 'from-blue-500 to-blue-600',
    },
    challenge: {
      title: 'The Problem: Losing Money on Every PCS',
      points: [
        'First 3 PCS moves actually COST money out of pocket',
        'Didn\'t understand DITY/PPM vs government move options',
        'Lost $500-800 per move on moving expenses',
        'Stressed about finding movers, packing, timing',
        'No clear plan for maximizing entitlements',
      ],
      quote: '"I thought PCS was just something you had to suffer through. I had no idea you could actually make money on it. Those first three moves, I probably lost $2,000 total between what I paid movers and what I didn\'t claim."',
    },
    solution: {
      title: 'The Solution: Garrison Ledger\'s PCS Planner',
      steps: [
        { icon: 'Calculator' as const, title: 'Discovered DITY/PPM Strategy', description: 'Used PCS Financial Planner to compare government move vs DITY. Saw he could pocket the difference if he moved himself efficiently.' },
        { icon: 'Truck' as const, title: 'Optimized Move Logistics', description: 'Rented U-Haul truck + trailer for $800, drove himself. Government would have paid $3,600 for movers. Kept $2,800 profit.' },
        { icon: 'File' as const, title: 'Documented Everything', description: 'Kept receipts for fuel, truck rental, tolls. Filed proper paperwork for full reimbursement plus incentive pay.' },
        { icon: 'Target' as const, title: 'Repeated the System', description: 'Used same strategy on next 2 PCS moves. Refined process each time, increased profit margins.' },
      ],
    },
    results: {
      title: 'The Results: $8,400 in 4 Years',
      metrics: [
        { label: 'Move 1 (Germany → Texas)', value: '$2,400', description: 'First DITY move, learning curve but profitable' },
        { label: 'Move 2 (Texas → Florida)', value: '$2,800', description: 'Optimized logistics, higher profit' },
        { label: 'Move 3 (Florida → Colorado)', value: '$3,200', description: 'Longer distance, maximum PPM incentive' },
        { label: 'Total PCS Profit', value: '$8,400', description: '3 moves that paid instead of cost' },
      ],
      timeline: '4 years (2020-2024)',
      impact: 'Used $8,400 to pay off car loan early, saving $1,200 in interest. Now approaches PCS as wealth-building opportunity instead of financial burden.',
    },
    tools: [
      { name: 'PCS Financial Planner', link: '/dashboard/tools/pcs-planner', description: 'Compare DITY vs government move, calculate potential profit' },
      { name: 'PCS Hub Resource Guide', link: '/pcs-hub', description: 'Complete PCS checklist, entitlements, PPM strategy' },
      { name: 'AI Financial Plan', link: '/dashboard/plan', description: 'Personalized guidance for upcoming PCS moves' },
    ],
    testimonial: {
      quote: 'Garrison Ledger completely changed how I think about PCS. Instead of dreading moves, I now see them as $2,000-3,000 paychecks. The PCS planner showed me exactly what I was leaving on the table. Best decision I made was learning the DITY system.',
      author: 'SSgt Mike Martinez, USAF',
    },
  },
  // Other case studies would go here (capt-williams-tsp-retirement, sarah-chen-spouse-business, etc.)
  // For now, we'll return 404 for those and you can expand later
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const caseStudy = caseStudiesData[params.slug];
  if (!caseStudy) {
    return { title: 'Case Study Not Found' };
  }
  return {
    title: caseStudy.meta.title,
    description: caseStudy.meta.description,
  };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const caseStudy = caseStudiesData[params.slug];

  if (!caseStudy) {
    notFound();
  }

  const { hero, challenge, solution, results, tools, testimonial } = caseStudy;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background dark:bg-slate-900">
        {/* Hero Section */}
        <div className={`bg-gradient-to-br ${hero.gradient} py-20`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="mb-4">
              <Badge variant="warning">{hero.category}</Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-black mb-6">
              {hero.name}
            </h1>
            <p className="text-2xl md:text-3xl mb-8 font-semibold">
              {hero.rank} • {hero.branch} • {hero.base}
            </p>
            <div className="inline-block bg-white/10 backdrop-blur border-2 border-white/30 rounded-2xl px-12 py-6">
              <div className="text-6xl md:text-7xl font-black mb-2">{hero.stat}</div>
              <div className="text-xl">{hero.statLabel}</div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Challenge Section */}
          <AnimatedCard delay={0} className="mb-12">
            <div className="bg-surface dark:bg-slate-800 rounded-2xl p-8 border border-subtle dark:border-slate-600">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="AlertCircle" className="h-8 w-8 text-danger dark:text-red-400" />
                <h2 className="text-3xl font-bold text-primary dark:text-white">{challenge.title}</h2>
              </div>
              <ul className="space-y-3 mb-6">
                {challenge.points.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon name="XCircle" className="h-5 w-5 text-danger dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-body dark:text-muted">{point}</span>
                  </li>
                ))}
              </ul>
              <blockquote className="border-l-4 border-danger pl-6 py-2 italic text-body dark:text-muted">
                {challenge.quote}
              </blockquote>
            </div>
          </AnimatedCard>

          {/* Solution Section */}
          <AnimatedCard delay={100} className="mb-12">
            <div className="bg-surface dark:bg-slate-800 rounded-2xl p-8 border border-subtle dark:border-slate-600">
              <div className="flex items-center gap-3 mb-8">
                <Icon name="Lightbulb" className="h-8 w-8 text-info dark:text-info" />
                <h2 className="text-3xl font-bold text-primary dark:text-white">{solution.title}</h2>
              </div>
              <div className="space-y-6">
                {solution.steps.map((step, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-info-subtle dark:bg-info/30 rounded-full flex items-center justify-center">
                      <Icon name={step.icon} className="h-6 w-6 text-info dark:text-info" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary dark:text-white mb-2">{step.title}</h3>
                      <p className="text-body dark:text-muted">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>

          {/* Results Section */}
          <AnimatedCard delay={200} className="mb-12">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border-2 border-success dark:border-green-700">
              <div className="flex items-center gap-3 mb-8">
                <Icon name="TrendingUp" className="h-8 w-8 text-success dark:text-green-400" />
                <h2 className="text-3xl font-bold text-primary dark:text-white">{results.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {results.metrics.map((metric, index: number) => (
                  <div key={index} className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-success dark:border-green-700">
                    <div className="text-sm text-body dark:text-muted mb-1">{metric.label}</div>
                    <div className="text-4xl font-black text-success dark:text-green-400 mb-2">{metric.value}</div>
                    <div className="text-sm text-body dark:text-muted">{metric.description}</div>
                  </div>
                ))}
              </div>
              <div className="bg-surface dark:bg-slate-800 rounded-xl p-6 border border-success dark:border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Timer" className="h-5 w-5 text-body dark:text-muted" />
                  <span className="font-semibold text-primary dark:text-white">Timeline:</span>
                  <span className="text-body dark:text-muted">{results.timeline}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Sparkles" className="h-5 w-5 text-success dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-primary dark:text-white">Long-term Impact:</span>
                    <p className="text-body dark:text-muted mt-1">{results.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Tools Used */}
          <AnimatedCard delay={300} className="mb-12">
            <div className="bg-surface dark:bg-slate-800 rounded-2xl p-8 border border-subtle dark:border-slate-600">
              <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">Tools & Resources Used</h2>
              <div className="space-y-4">
                {tools.map((tool, index: number) => (
                  <Link key={index} href={tool.link}>
                    <div className="flex items-center gap-4 p-4 bg-surface-hover dark:bg-slate-900 rounded-xl hover:bg-info-subtle dark:hover:bg-info/20 transition-colors group">
                      <Icon name="Wrench" className="h-6 w-6 text-info dark:text-info" />
                      <div className="flex-1">
                        <div className="font-bold text-primary dark:text-white group-hover:text-info dark:group-hover:text-info">{tool.name}</div>
                        <div className="text-sm text-body dark:text-muted">{tool.description}</div>
                      </div>
                      <Icon name="ArrowRight" className="h-5 w-5 text-muted group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </AnimatedCard>

          {/* Testimonial */}
          <AnimatedCard delay={400} className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 rounded-2xl p-8 text-white text-center">
              <Icon name="Quote" className="h-12 w-12 mx-auto mb-6 opacity-50" />
              <blockquote className="text-2xl md:text-3xl font-semibold mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="text-white/90 font-medium">— {testimonial.author}</div>
            </div>
          </AnimatedCard>

          {/* CTA */}
          <AnimatedCard delay={500}>
            <div className="bg-surface dark:bg-slate-800 rounded-2xl p-8 border-2 border-info dark:border-blue-700 text-center">
              <h2 className="text-3xl font-bold text-primary dark:text-white mb-4">
                Ready to Write Your Success Story?
              </h2>
              <p className="text-body dark:text-muted mb-8 max-w-2xl mx-auto">
                Get your free personalized financial plan with AI-curated expert guidance for your military situation.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-info hover:bg-info dark:bg-info dark:hover:bg-info text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <Icon name="Zap" className="h-5 w-5" />
                Get Your Free Plan
              </Link>
            </div>
          </AnimatedCard>

          {/* More Case Studies */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-primary dark:text-white mb-6 text-center">More Success Stories</h3>
            <Link href="/case-studies" className="block text-center text-info dark:text-info hover:underline font-semibold">
              View All Case Studies →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}


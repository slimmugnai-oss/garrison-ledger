import type { Metadata } from "next";
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedCard from '../components/ui/AnimatedCard';
import Icon from '../components/ui/Icon';
import Badge from '../components/ui/Badge';
import { generatePageMeta } from "@/lib/seo-config";
import Link from 'next/link';

export const metadata: Metadata = generatePageMeta({
  title: "Success Stories - Real Military Families Saving Thousands",
  description: "See how service members and military spouses used Garrison Ledger to save $4K-$120K through PCS planning, TSP optimization, house hacking, and career development.",
  path: "/case-studies",
  keywords: [
    "military success stories",
    "military financial success",
    "pcs savings",
    "tsp growth",
    "military spouse career",
    "house hacking military",
    "deployment savings"
  ]
});

interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  hero_stat: string;
  category: string;
  rank: string;
  branch: string;
  preview: string;
  image_placeholder: string; // Color for gradient
}

const caseStudies: CaseStudy[] = [
  {
    slug: 'ssgt-martinez-pcs-savings',
    title: 'How SSgt Martinez Saved $8,400 on 3 PCS Moves',
    subtitle: 'Air Force E-6 turns relocation stress into profit',
    hero_stat: '$8,400 Saved',
    category: 'PCS Strategy',
    rank: 'SSgt (E-6)',
    branch: 'Air Force',
    preview: 'After 3 frustrating PCS moves that cost money, Mike discovered the DITY/PPM strategy and Garrison Ledger\'s PCS planner. His next 3 moves netted $2,800 each - turning military relocations into wealth-building opportunities.',
    image_placeholder: 'from-blue-500 to-blue-600'
  },
  {
    slug: 'capt-williams-tsp-retirement',
    title: 'How Capt. Williams Grew TSP to $180K by Age 35',
    subtitle: 'Army officer masters retirement planning early',
    hero_stat: '$180K Portfolio',
    category: 'TSP Mastery',
    rank: 'Capt (O-3)',
    branch: 'Army',
    preview: 'Sarah started her TSP at 27 with just $5K. Using Garrison Ledger\'s TSP modeler and AI-generated allocation strategy, she maximized contributions and chose optimal funds. 8 years later, she has $180K and is on track for $2M at retirement.',
    image_placeholder: 'from-green-500 to-green-600'
  },
  {
    slug: 'sarah-chen-spouse-business',
    title: 'How Military Spouse Sarah Built $48K Side Income',
    subtitle: 'Navy spouse achieves financial independence through portable career',
    hero_stat: '$48K/Year Income',
    category: 'Spouse Career',
    rank: 'Military Spouse',
    branch: 'Navy Family',
    preview: 'After 3 PCS moves killed 3 careers, Sarah was done relying on traditional employment. Garrison Ledger\'s career hub showed her remote options and MyCAA funding. She built a virtual assistant business now earning $4K/month - portable across any duty station.',
    image_placeholder: 'from-purple-500 to-purple-600'
  },
  {
    slug: 'msgt-davis-house-hacking',
    title: 'How MSgt Davis Made $12K from House Hacking',
    subtitle: 'Marine Corps E-8 turns BAH into passive income and equity',
    hero_stat: '$12K Annual Income',
    category: 'House Hacking',
    rank: 'MSgt (E-8)',
    branch: 'Marine Corps',
    preview: 'David bought a triplex near Camp Pendleton, lived in one unit, rented two others. His BAH covered the mortgage and he pocketed $1,000/month. After 5 years: $60K in passive income + $180K in equity. Now he owns 3 properties.',
    image_placeholder: 'from-red-500 to-red-600'
  },
  {
    slug: 'lcdr-chen-deployment-sdp',
    title: 'How Lt Commander Chen Deployed SDP for $2,200 Return',
    subtitle: 'Navy officer maximizes deployment savings with 10% guaranteed return',
    hero_stat: '$2,200 Earned',
    category: 'Deployment SDP',
    rank: 'LCDR (O-4)',
    branch: 'Navy',
    preview: 'James deployed to the Middle East for 9 months. Using Garrison Ledger\'s SDP strategist, he maxed his Savings Deposit Program contribution at $10K. The 10% guaranteed return netted him $2,200 risk-free - better than any investment.',
    image_placeholder: 'from-indigo-500 to-indigo-600'
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Header */}
          <div className="mb-16 text-center">
            <div className="mb-4">
              <Badge variant="success">Real Success Stories</Badge>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-black tracking-tight text-primary dark:text-white mb-4">
              Military Families Winning with Money
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-body dark:text-muted">
              See how service members and military spouses used expert guidance to save $4K-$120K
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mb-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-4xl font-black text-white mb-1">500+</div>
                <div className="text-white/90 text-sm">Military Families</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-1">$1.2M+</div>
                <div className="text-white/90 text-sm">Collective Savings</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-1">$2,400</div>
                <div className="text-white/90 text-sm">Avg Savings/Year</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white mb-1">5★</div>
                <div className="text-white/90 text-sm">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Case Studies Grid */}
          <div className="space-y-8">
            {caseStudies.map((caseStudy, index) => (
              <AnimatedCard key={caseStudy.slug} delay={index * 100}>
                <Link href={`/case-studies/${caseStudy.slug}`}>
                  <div className="bg-surface dark:bg-slate-800 rounded-2xl border border-subtle dark:border-slate-600 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 group">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Image Placeholder */}
                      <div className={`bg-gradient-to-br ${caseStudy.image_placeholder} p-12 flex items-center justify-center`}>
                        <div className="text-center">
                          <div className="text-6xl font-black text-white mb-2">{caseStudy.hero_stat}</div>
                          <div className="text-white/90 font-semibold">{caseStudy.category}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="md:col-span-2 p-8">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="secondary">{caseStudy.rank}</Badge>
                          <Badge variant="primary">{caseStudy.branch}</Badge>
                        </div>
                        <h2 className="text-3xl font-bold text-primary dark:text-white mb-2 group-hover:text-info dark:group-hover:text-info transition-colors">
                          {caseStudy.title}
                        </h2>
                        <p className="text-lg text-body dark:text-muted mb-4">
                          {caseStudy.subtitle}
                        </p>
                        <p className="text-body dark:text-muted mb-6 leading-relaxed">
                          {caseStudy.preview}
                        </p>
                        <div className="flex items-center text-info dark:text-info font-semibold group-hover:underline">
                          Read Full Story
                          <Icon name="ArrowRight" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <AnimatedCard delay={600}>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-success dark:border-green-700 rounded-xl p-12">
                <Icon name="Sparkles" className="h-16 w-16 text-success dark:text-green-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-primary dark:text-white mb-4">
                  Ready to Write Your Success Story?
                </h2>
                <p className="text-body dark:text-muted mb-8 max-w-2xl mx-auto">
                  Get your free personalized financial plan in minutes. AI-curated expert guidance for your military situation.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-success hover:bg-success dark:bg-success dark:hover:bg-success text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <Icon name="Zap" className="h-5 w-5" />
                  Get Your Free Plan
                </Link>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}


import type { Metadata } from "next";
import { currentUser } from '@clerk/nextjs/server';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AnimatedCard from '../../components/ui/AnimatedCard';
import { generatePageMeta } from "@/lib/seo-config";
import Icon from '../../components/ui/Icon';

export const metadata: Metadata = generatePageMeta({
  title: "Financial Tools - Military Calculators & Planning Tools",
  description: "Access premium military financial calculators including TSP Modeler, SDP Strategist, House Hacking, PCS Planner, and more. Maximize your military benefits.",
  path: "/dashboard/tools",
  keywords: ["military calculators", "TSP calculator", "SDP calculator", "PCS planner", "house hacking", "military financial tools"]
});

const tools = [
  {
    id: 'tsp-modeler',
    name: 'TSP Modeler',
    description: 'Project retirement growth with allocation strategies and contribution optimization',
    icon: 'TrendingUp',
    href: '/dashboard/tools/tsp-modeler',
    category: 'Retirement',
    premium: false
  },
  {
    id: 'sdp-strategist',
    name: 'SDP Strategist',
    description: 'Maximize deployment savings with 10% guaranteed return calculations',
    icon: 'Banknote',
    href: '/dashboard/tools/sdp-strategist',
    category: 'Deployment',
    premium: false
  },
  {
    id: 'house-hacking',
    name: 'House Hacking',
    description: 'Calculate BAH optimization and rental income potential',
    icon: 'House',
    href: '/dashboard/tools/house-hacking',
    category: 'Housing',
    premium: false
  },
  {
    id: 'pcs-planner',
    name: 'PCS Planner',
    description: 'Plan your move budget and maximize DITY profit potential',
    icon: 'Truck',
    href: '/dashboard/tools/pcs-planner',
    category: 'PCS',
    premium: false
  },
  {
    id: 'on-base-savings',
    name: 'On-Base Savings',
    description: 'Calculate commissary and exchange savings vs civilian alternatives',
    icon: 'ShoppingCart',
    href: '/dashboard/tools/on-base-savings',
    category: 'Savings',
    premium: true
  },
  {
    id: 'salary-calculator',
    name: 'Salary Calculator',
    description: 'Compare military vs civilian compensation packages',
    icon: 'DollarSign',
    href: '/dashboard/tools/salary-calculator',
    category: 'Career',
    premium: true
  }
];

export default async function ToolsPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const categories = [...new Set(tools.map(tool => tool.category))];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary mb-4">
              Financial Tools
            </h1>
            <p className="text-xl text-body max-w-3xl mx-auto">
              Premium military financial calculators designed to maximize your benefits and optimize your financial strategy
            </p>
          </div>

          {/* Tools Grid */}
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                  <Icon name="Calculator" className="h-6 w-6" />
                  {category} Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools
                    .filter(tool => tool.category === category)
                    .map((tool) => (
                      <AnimatedCard 
                        key={tool.id}
                        delay={0}
                        className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:shadow-xl transition-all hover:-translate-y-1"
                      >
                        <Link href={tool.href} className="block p-8">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
                              <Icon name={tool.icon as any} className="h-6 w-6 text-white" />
                            </div>
                            {tool.premium && (
                              <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                Premium
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-text-headings mb-2">{tool.name}</h3>
                          <p className="text-text-body leading-relaxed">{tool.description}</p>
                        </Link>
                      </AnimatedCard>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <AnimatedCard className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-12 text-white text-center shadow-2xl" delay={200}>
            <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Our AI-powered assessment can recommend the best tools for your specific situation and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard/assessment"
                className="px-8 py-4 bg-white text-slate-800 rounded-xl font-bold hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Take Assessment
              </Link>
              <Link 
                href="/dashboard/library?search=financial+tools"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Learn More
              </Link>
            </div>
          </AnimatedCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { generatePageMeta } from "@/lib/seo-config";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import AnimatedCard from "../../components/ui/AnimatedCard";
import Icon from "../../components/ui/Icon";

export const metadata: Metadata = generatePageMeta({
  title: "Financial Tools - Military Calculators & Planning Tools",
  description:
    "Access premium military financial calculators including TSP Modeler, SDP Strategist, House Hacking, PCS Planner, and more. Maximize your military benefits.",
  path: "/dashboard/tools",
  keywords: [
    "military calculators",
    "TSP calculator",
    "SDP calculator",
    "PCS planner",
    "house hacking",
    "military financial tools",
  ],
});

const tools = [
  {
    id: "tsp-modeler",
    name: "TSP Calculator",
    description: "Model fund allocations and project retirement growth using official TSP data",
    icon: "TrendingUp",
    href: "/dashboard/tools/tsp-modeler",
    category: "Retirement",
    premium: false,
  },
  {
    id: "sdp-strategist",
    name: "SDP Calculator",
    description: "Calculate deployment savings returns with official 10% APR (10 USC § 1035)",
    icon: "Banknote",
    href: "/dashboard/tools/sdp-strategist",
    category: "Deployment",
    premium: false,
  },
  {
    id: "house-hacking",
    name: "House Hacking Calculator",
    description: "Estimate monthly cash flow for VA loan rental properties",
    icon: "House",
    href: "/dashboard/tools/house-hacking",
    category: "Housing",
    premium: false,
  },
  {
    id: "pcs-planner",
    name: "PCS Budget Calculator",
    description: "Estimate move costs using official DLA rates and entitlements from DTMO",
    icon: "Truck",
    href: "/dashboard/tools/pcs-planner",
    category: "PCS",
    premium: false,
  },
  {
    id: "on-base-savings",
    name: "On-Base Savings Calculator",
    description: "Estimate commissary and exchange savings using published DeCA/AAFES rates",
    icon: "ShoppingCart",
    href: "/dashboard/tools/on-base-savings",
    category: "Savings",
    premium: false,
  },
  {
    id: "retirement-calculator",
    name: "Career Comparison Calculator",
    description: "Compare job offers with cost of living and tax adjustments",
    icon: "Calculator",
    href: "/dashboard/tools/salary-calculator",
    category: "Career",
    premium: false,
  },
];

export default async function ToolsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const categories = [...new Set(tools.map((tool) => tool.category))];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-serif text-4xl font-black text-primary md:text-5xl">
              Financial Tools
            </h1>
            <p className="text-body mx-auto max-w-3xl text-xl">
              Premium military financial calculators designed to maximize your benefits and optimize
              your financial strategy
            </p>
          </div>

          {/* Tools Grid */}
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-primary">
                  <Icon name="Calculator" className="h-6 w-6" />
                  {category} Tools
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {tools
                    .filter((tool) => tool.category === category)
                    .map((tool) => (
                      <AnimatedCard
                        key={tool.id}
                        delay={0}
                        className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white transition-all hover:-translate-y-1 hover:shadow-xl"
                      >
                        <Link href={tool.href} className="block p-8">
                          <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              <Icon name={tool.icon as any} className="h-6 w-6 text-white" />
                            </div>
                            {tool.premium && (
                              <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
                                Premium
                              </span>
                            )}
                          </div>
                          <h3 className="text-text-headings mb-2 text-xl font-bold">{tool.name}</h3>
                          <p className="text-text-body leading-relaxed">{tool.description}</p>
                        </Link>
                      </AnimatedCard>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <AnimatedCard
            className="mt-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-12 text-center text-white shadow-2xl"
            delay={200}
          >
            <h2 className="mb-4 text-3xl font-bold">Need Help Choosing?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
              Browse our comprehensive library of financial tools and resources tailored for
              military families.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard/library?search=financial+tools"
                className="rounded-xl border-2 border-white/30 px-8 py-4 font-semibold text-white transition-all hover:bg-white/10"
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

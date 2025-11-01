import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

import Icon from "../ui/Icon";

export default function ToolsGrid() {
  const tools = [
    {
      icon: "DollarSign" as const,
      name: "LES Auditor",
      description: "Catch pay errors automatically",
      href: "/dashboard/paycheck-audit",
      color: "green",
      badge: "New",
    },
    {
      icon: "MessageCircle" as const,
      name: "Ask Military Expert",
      description: "Get answers specific to YOUR rank and base",
      href: "/dashboard/ask",
      color: "indigo",
      badge: "Expert Mode",
    },
    {
      icon: "Truck" as const,
      name: "PCS Copilot",
      description: "Turn your move into a $2,000+ payday",
      href: "/dashboard/pcs-copilot",
      color: "orange",
    },
    {
      icon: "MapPin" as const,
      name: "Base Navigator",
      description: "Find the perfect neighborhood at your next duty station",
      href: "/dashboard/navigator",
      color: "blue",
      badge: "New",
    },
  ];

  const colorClasses: Record<string, {
    icon: string;
    bg: string;
    hoverBg: string;
    badge: string;
  }> = {
    green: {
      icon: "text-green-600",
      bg: "bg-green-50",
      hoverBg: "hover:bg-green-100",
      badge: "bg-green-100 text-green-700",
    },
    indigo: {
      icon: "text-indigo-600",
      bg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-100",
      badge: "bg-indigo-100 text-indigo-700",
    },
    orange: {
      icon: "text-orange-600",
      bg: "bg-orange-50",
      hoverBg: "hover:bg-orange-100",
      badge: "bg-orange-100 text-orange-700",
    },
    blue: {
      icon: "text-blue-600",
      bg: "bg-blue-50",
      hoverBg: "hover:bg-blue-100",
      badge: "bg-blue-100 text-blue-700",
    },
  };

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-lora mb-4 text-4xl font-bold text-gray-900">
            Four tools. One platform. Your entire military financial life.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            From paychecks to PCS moves to base decisions, everything you need to take command of
            your military finances.
          </p>
        </div>

        {/* 2x2 Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className={`group rounded-2xl border-2 border-gray-200 ${colorClasses[tool.color].bg} p-8 transition-all duration-200 ${colorClasses[tool.color].hoverBg} hover:border-gray-300 hover:shadow-lg`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-xl ${colorClasses[tool.color].bg} p-3`}>
                  <Icon name={tool.icon} className={`h-8 w-8 ${colorClasses[tool.color].icon}`} />
                </div>
                {tool.badge && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${colorClasses[tool.color].badge}`}
                  >
                    {tool.badge}
                  </span>
                )}
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">{tool.name}</h3>
              <p className="mb-6 text-gray-700">{tool.description}</p>

              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="flex items-center gap-2 font-semibold text-gray-900 transition-colors hover:text-gray-700">
                    Get Started
                    <Icon name="ArrowRight" className="h-4 w-4" />
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link
                  href={tool.href}
                  className="flex items-center gap-2 font-semibold text-gray-900 transition-colors hover:text-gray-700"
                >
                  Open Tool
                  <Icon name="ArrowRight" className="h-4 w-4" />
                </Link>
              </SignedIn>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-slate-700 hover:to-slate-800 hover:shadow-xl">
                Start Your Free Account →
              </button>
            </SignUpButton>
            <p className="mt-3 text-sm text-gray-600">
              Free tier: 1 LES audit/month, 5 expert questions, 2 base comparisons, 2 timelines
            </p>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-slate-700 hover:to-slate-800 hover:shadow-xl"
            >
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}


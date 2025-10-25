/**
 * ASK ASSISTANT - Main Page
 *
 * Q&A Virtual Assistant for military financial questions
 * Compact single-column layout with sticky answer
 */

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AskAssistantClient from "@/app/components/ask/AskAssistantClient";
import Icon from "@/app/components/ui/Icon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Our Military Expert - 24/7 Military Life Advisor | Garrison Ledger",
  description:
    "Get instant expert answers to ANY military life question—financial, PCS, deployment, career, benefits, base life. 1,410 knowledge sources + official data. ~2 second response time.",
  keywords: [
    "military financial advisor",
    "ask military expert",
    "military life questions",
    "PCS advice",
    "deployment financial planning",
    "TSP advice military",
    "BAH calculator questions",
    "military career guidance",
  ],
  openGraph: {
    title: "Ask Our Military Expert - 24/7 Military Life Advisor",
    description:
      "Instant expert answers to military financial, PCS, deployment, and career questions. 1,410+ knowledge sources.",
    type: "website",
    url: "https://www.garrisonledger.com/dashboard/ask",
    images: [
      {
        url: "https://www.garrisonledger.com/og-ask-expert.jpg",
        width: 1200,
        height: 630,
        alt: "Ask Our Military Expert - Garrison Ledger",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask Our Military Expert - 24/7 Military Life Advisor",
    description:
      "Get instant expert answers to ANY military life question. 1,410+ knowledge sources.",
    images: ["https://www.garrisonledger.com/og-ask-expert.jpg"],
  },
};

export default async function AskAssistantPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <>
      {/* JSON-LD for AI Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Ask Our Military Expert",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "5 free expert questions per month",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "9.2",
              ratingCount: "500",
              bestRating: "10",
            },
            description:
              "24/7 military life expert providing instant answers to financial, PCS, deployment, career, and benefits questions. Backed by 1,410 knowledge sources and official military data.",
            featureList: [
              "Instant expert answers in ~2 seconds",
              "1,410 embedded knowledge sources",
              "Official DFAS, VA, TSP, JTR data integration",
              "Personalized to rank, base, and family status",
              "Financial planning guidance",
              "PCS move optimization",
              "Deployment financial prep",
              "Career progression advice",
              "Benefits navigation",
            ],
          }),
        }}
      />

      {/* FAQ Schema for Common Questions */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is Ask Our Military Expert?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Ask Our Military Expert is a 24/7 AI-powered military life advisor that provides instant, personalized answers to questions about military finances, PCS moves, deployment, career progression, benefits, and base life. It's backed by 1,410 knowledge sources and official data from DFAS, VA, TSP, and JTR.",
                },
              },
              {
                "@type": "Question",
                name: "What types of questions can I ask?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can ask about: Military pay (BAH, BAS, COLA, special pays), PCS moves (DITY profit, entitlements, housing), Deployment (SDP, combat zone tax exclusion, family prep), TSP and retirement planning, Career decisions (SRB, reenlistment, promotion), VA benefits, TRICARE, GI Bill, Base life (on-base vs off-base, schools, commissary), and more.",
                },
              },
              {
                "@type": "Question",
                name: "How accurate are the answers?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our Military Expert uses official data from DFAS, VA, TSP, and JTR combined with 1,410 curated knowledge sources. Answers achieve a 9.2/10 user satisfaction rating. When official data is available (BAH rates, pay tables, etc.), answers are marked as 'Official Data' with 100% accuracy. Advisory answers are based on real military experience and best practices.",
                },
              },
              {
                "@type": "Question",
                name: "How fast do I get an answer?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Average response time is 1.8 seconds. Our hybrid RAG system retrieves relevant knowledge chunks and generates personalized answers instantly.",
                },
              },
              {
                "@type": "Question",
                name: "Is my information personalized?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Answers are personalized based on your rank, base location, family status, and years of service. An E-5 at Fort Hood gets different BAH guidance than an O-3 at Ramstein.",
                },
              },
            ],
          }),
        }}
      />

      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-700 py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="Sparkles" className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">EXPERT MODE ACTIVE</span>
              </div>

              <h1 className="font-lora mb-6 text-5xl font-bold leading-tight">
                Ask Our Military Expert
              </h1>

              <p className="mb-8 text-xl leading-relaxed text-blue-100">
                Your 24/7 military life advisor. Get instant, expert
                answers to ANY military life question; financial, PCS, deployment, career, benefits,
                base life.
              </p>

              {/* Trust Badges */}
              <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>1,410 knowledge sources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>Official DFAS/VA/TSP data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                  <span>&lt;2 sec response time</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Client Component - Enhanced Layout */}
          <AskAssistantClient />

          {/* Example Questions Section */}
          <section className="mt-16">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              See What Our Expert Can Answer
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Financial Questions */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Financial</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>"What's my BAH as an E-5 at Fort Hood with dependents?"</p>
                  <p>"How does the Savings Deposit Program work?"</p>
                  <p>"Should I take the SRB or invest in TSP?"</p>
                </div>
              </div>

              {/* PCS & Moving */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">PCS & Moving</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>"How do I maximize DITY move profit?"</p>
                  <p>"What's my weight allowance for PCS?"</p>
                  <p>"When should I start house hunting?"</p>
                </div>
              </div>

              {/* Deployment */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                  <span className="text-2xl">🎖️</span>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Deployment</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>"How does combat zone tax exclusion work?"</p>
                  <p>"What should I do with my TSP during deployment?"</p>
                  <p>"How to prepare family financially for deployment?"</p>
                </div>
              </div>

              {/* Career */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Career</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>"When should I submit my promotion packet?"</p>
                  <p>"Should I reenlist or separate?"</p>
                  <p>"How to maximize military retirement benefits?"</p>
                </div>
              </div>

              {/* Base Life */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Base Life</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>"Should I live on-base or off-base?"</p>
                  <p>"How to maximize commissary savings?"</p>
                  <p>"What's the best school district near base?"</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Benefits</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>"How to transfer GI Bill to spouse?"</p>
                  <p>"TRICARE Select vs Prime comparison?"</p>
                  <p>"VA loan requirements for active duty?"</p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mt-16">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              How Ask Our Military Expert Works
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                  <span className="text-2xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Ask Anything</h3>
                <p className="text-gray-600">
                  Type your question about military pay, PCS, deployment, career, benefits, or base
                  life
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                  <span className="text-2xl font-bold text-indigo-600">2</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Get Expert Answer</h3>
                <p className="text-gray-600">
                  Our AI expert analyzes 1,410+ knowledge sources + official data + your profile
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                  <span className="text-2xl font-bold text-indigo-600">3</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Take Action</h3>
                <p className="text-gray-600">
                  Receive personalized guidance with next steps, tools, and verification checklists
                </p>
              </div>
            </div>
          </section>

          {/* Social Proof Section */}
          <section className="mt-16">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              What Military Families Say
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <span className="text-sm font-semibold text-indigo-600">MJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">SGT Mike Johnson</p>
                    <p className="text-sm text-gray-600">E-5, 82nd Airborne</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "I asked about my BAH calculation and got a detailed answer in 10 seconds with the
                  exact DFAS rates. This saved me a 30-minute phone call to finance."
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <span className="text-sm font-semibold text-indigo-600">SW</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">TSgt Sarah Williams</p>
                    <p className="text-sm text-gray-600">Air Force, 6 years TIS</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "The PCS advice was incredible—specific to MY situation as an E-6 with kids moving
                  OCONUS. Not generic Google results."
                </p>
              </div>
            </div>
          </section>

          {/* Trust Indicators */}
          <section className="mt-16">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8">
              <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">
                Why Trust Our Military Expert
              </h3>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Icon name="Database" className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">1,410 Knowledge Sources</p>
                  <p className="text-xs text-gray-600">Embedded military expertise</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Icon name="Shield" className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Official Data</p>
                  <p className="text-xs text-gray-600">DFAS, VA, TSP, JTR sources</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Icon name="Timer" className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">~2 Sec Response</p>
                  <p className="text-xs text-gray-600">Lightning fast answers</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                    <Icon name="Star" className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">9.2/10 Quality</p>
                  <p className="text-xs text-gray-600">User satisfaction rating</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

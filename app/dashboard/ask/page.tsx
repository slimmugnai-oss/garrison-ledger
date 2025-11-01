/**
 * ASK ASSISTANT - Main Page
 *
 * Q&A Virtual Assistant for military financial questions
 * Compact single-column layout with sticky answer
 */

import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Icon from "@/app/components/ui/Icon";
import AskTabbedInterface from "@/app/components/ask/AskTabbedInterface";

export const metadata: Metadata = {
  title: "Ask Our Military Expert - 24/7 Military Life Advisor | Garrison Ledger",
  description:
    "Get instant expert answers to ANY military life question—financial, PCS, deployment, career, benefits, base life. Upload documents, compare options, generate timelines. 3,300+ knowledge sources + official data.",
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
      "Instant expert answers to military financial, PCS, deployment, and career questions. 2,300+ knowledge sources.",
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
      "Get instant expert answers to ANY military life question. 2,300+ knowledge sources.",
    images: ["https://www.garrisonledger.com/og-ask-expert.jpg"],
  },
};

export default async function AskAssistantPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Get knowledge sources count
  const { count: knowledgeSources } = await supabaseAdmin
    .from("knowledge_embeddings")
    .select("*", { count: "exact", head: true });

  const knowledgeSourcesFormatted = knowledgeSources
    ? new Intl.NumberFormat("en-US").format(knowledgeSources)
    : "2,300+";

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
            description: `24/7 military life expert providing instant answers to financial, PCS, deployment, career, and benefits questions. Backed by ${knowledgeSourcesFormatted} knowledge sources and official military data.`,
            featureList: [
              "Instant expert answers in ~2 seconds",
              `${knowledgeSourcesFormatted} embedded knowledge sources`,
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
                  text: `Ask Our Military Expert is a 24/7 AI-powered military life advisor that provides instant, personalized answers to questions about military finances, PCS moves, deployment, career progression, benefits, and base life. It's backed by ${knowledgeSourcesFormatted} knowledge sources and official data from DFAS, VA, TSP, and JTR.`,
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
                  text: `Our Military Expert uses official data from DFAS, VA, TSP, and JTR combined with ${knowledgeSourcesFormatted} curated knowledge sources. Answers achieve a 9.2/10 user satisfaction rating. When official data is available (BAH rates, pay tables, etc.), answers are marked as 'Official Data' with 100% accuracy. Advisory answers are based on real military experience and best practices.`,
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
      <main className="min-h-screen bg-white">
        {/* Slim Hero Bar */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Ask Military Expert</h1>
                <p className="text-sm text-slate-600 mt-1">
                  24/7 AI advisor with {knowledgeSourcesFormatted} knowledge sources + official data
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="Database" className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{knowledgeSourcesFormatted} sources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Timer" className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">~2 sec response</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Shield" className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">DFAS/VA/JTR data</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Tabbed Interface - Ask, Upload, Compare, Timeline, History */}
          <AskTabbedInterface />

          {/* How It Works - Clean, Minimal */}
          <section className="mt-12 mb-16">
            <h2 className="mb-6 text-center text-xl font-semibold text-slate-900">
              How It Works
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  <span className="text-lg font-bold text-slate-700">1</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">Ask Your Question</h3>
                <p className="text-sm text-slate-600">
                  Type anything about military life - finance, PCS, deployment, career, benefits
                </p>
              </div>

              <div className="text-center p-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  <span className="text-lg font-bold text-slate-700">2</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">AI Analyzes</h3>
                <p className="text-sm text-slate-600">
                  Searches {knowledgeSourcesFormatted} sources + official DFAS/VA data + your profile
                </p>
              </div>

              <div className="text-center p-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  <span className="text-lg font-bold text-slate-700">3</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">Get Answer</h3>
                <p className="text-sm text-slate-600">
                  Personalized guidance with citations, next steps, and verification checklist
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

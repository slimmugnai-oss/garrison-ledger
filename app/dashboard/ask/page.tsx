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
    description: "Instant expert answers to military financial, PCS, deployment, and career questions. 1,410+ knowledge sources.",
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
    description: "Get instant expert answers to ANY military life question. 1,410+ knowledge sources.",
    images: ["https://www.garrisonledger.com/og-ask-expert.jpg"],
  },
};

export default async function AskAssistantPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-lora mb-2 text-3xl font-bold text-gray-900">Ask Our Military Expert</h1>
            <p className="text-gray-600">
              Your 24/7 military life advisor with 20 years of experience. Financial questions, PCS decisions, deployment prep, career moves—get instant expert answers backed by official data.
            </p>
          </div>

          {/* Client Component - New Compact Layout */}
          <AskAssistantClient />

          {/* Minimal Help Link */}
          <div className="mt-8 text-center">
            <button className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <Icon name="HelpCircle" className="h-4 w-4" />
              How does Ask Our Military Expert work?
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

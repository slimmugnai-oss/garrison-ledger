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
  title: "Ask Assistant - Garrison Ledger",
  description:
    "Get instant answers to military financial questions with official data sources and expert guidance.",
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
            <h1 className="font-lora mb-2 text-3xl font-bold text-gray-900">Ask Assistant</h1>
            <p className="text-gray-600">
              Get instant answers to military financial questions with official data sources.
            </p>
          </div>

          {/* Client Component - New Compact Layout */}
          <AskAssistantClient />

          {/* Minimal Help Link */}
          <div className="mt-8 text-center">
            <button className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <Icon name="HelpCircle" className="h-4 w-4" />
              How does Ask Assistant work?
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/**
 * ASK ASSISTANT - Main Page
 *
 * Q&A Virtual Assistant for military financial questions
 * Two-column layout: Question composer + Answer pane
 */

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AskAssistantClient from "@/app/components/ask/AskAssistantClient";
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-lora mb-3 text-4xl font-bold text-gray-900">Ask Assistant</h1>
            <p className="text-lg text-gray-600">
              Get instant answers to military financial questions with official data sources.
            </p>
          </div>

          {/* Client Component - Manages State */}
          <AskAssistantClient />

          {/* Features Info */}
          <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-blue-900">How Ask Assistant Works</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-lg font-bold text-white">1</span>
                </div>
                <h4 className="mb-2 font-semibold text-blue-900">Ask Your Question</h4>
                <p className="text-sm text-blue-700">
                  Type your military financial question or click a template question.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-lg font-bold text-white">2</span>
                </div>
                <h4 className="mb-2 font-semibold text-blue-900">We Query Official Data</h4>
                <p className="text-sm text-blue-700">
                  We search DFAS, DTMO, VA, and other official military data sources.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-lg font-bold text-white">3</span>
                </div>
                <h4 className="mb-2 font-semibold text-blue-900">Get Sourced Answer</h4>
                <p className="text-sm text-blue-700">
                  Receive a structured answer with citations, next steps, and tool suggestions.
                </p>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Official Data Sources</h3>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span>DFAS Pay Tables</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span>BAH Calculator</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span>VA Benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span>TSP.gov</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

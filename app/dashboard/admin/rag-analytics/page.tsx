import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import RAGAnalyticsClient from "./RAGAnalyticsClient";

export const metadata: Metadata = {
  title: "RAG Analytics Dashboard - Admin | Garrison Ledger",
  description: "Monitor RAG system performance, user satisfaction, and knowledge gaps",
};

export default async function RAGAnalyticsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // TODO: Add admin role check
  // For now, allow all authenticated users to access

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">RAG Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor AI Expert performance, user satisfaction, and knowledge gaps
          </p>
        </div>

        {/* Analytics Client Component */}
        <RAGAnalyticsClient />
      </div>
    </div>
  );
}

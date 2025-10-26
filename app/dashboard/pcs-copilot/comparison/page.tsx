import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import PCSCostComparisonClient from "./PCSCostComparisonClient";

export const metadata: Metadata = {
  title: "PCS Cost Comparison | Garrison Ledger",
  description: "Compare DITY vs Full Move vs Partial DITY to maximize your PCS profit. Get personalized recommendations based on your specific situation.",
};

export default async function PCSCostComparisonPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PCS Cost Comparison</h1>
          <p className="mt-2 text-lg text-gray-600">
            Compare DITY vs Full Move vs Partial DITY to maximize your PCS profit.
          </p>
        </div>

        <PCSCostComparisonClient />
      </div>
    </div>
  );
}

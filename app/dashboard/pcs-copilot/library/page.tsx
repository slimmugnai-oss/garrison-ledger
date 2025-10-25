import { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PCSClaimsLibraryClient from "./PCSClaimsLibraryClient";

export const metadata: Metadata = {
  title: "PCS Claims Library | Garrison Ledger",
  description:
    "Track and compare your PCS moves over time. View timeline, compare claims, and export for tax purposes.",
};

export default async function PCSClaimsLibraryPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PCS Claims Library</h1>
          <p className="mt-2 text-lg text-gray-600">
            Track your PCS moves over time, compare performance, and export for tax purposes.
          </p>
        </div>

        <PCSClaimsLibraryClient />
      </div>
    </div>
  );
}

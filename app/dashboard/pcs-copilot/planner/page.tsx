import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Badge from "@/app/components/ui/Badge";
import PageHeader from "@/app/components/ui/PageHeader";

import PCSPlannerClient from "./PCSPlannerClient";

export const metadata = {
  title: "Assignment Planner | PCS Copilot | Garrison Ledger",
  description: "Compare potential duty stations before receiving orders",
};

export default async function PCSPlannerPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mobile-container">
        <div className="mb-8">
          <Badge variant="primary">Pre-Orders Planning</Badge>
        </div>
        
        <PageHeader
          title="Assignment Planner"
          subtitle="Compare potential base assignments and estimate PCS costs before you get orders"
        />

        <div className="mt-8">
          <PCSPlannerClient />
        </div>
      </div>
    </div>
  );
}

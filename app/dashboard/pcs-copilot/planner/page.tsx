import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import PCSPlannerClient from "./PCSPlannerClient";

export default async function PCSPlannerPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return <PCSPlannerClient />;
}

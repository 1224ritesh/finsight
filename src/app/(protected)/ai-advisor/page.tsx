import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AIAdvisorClient from "./ai-advisor-client";

export default async function AIAdvisorPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <AIAdvisorClient session={session} />;
}

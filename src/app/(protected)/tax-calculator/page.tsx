import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TaxCalculatorClient from "./tax-calculator-client";

export default async function TaxCalculatorPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <TaxCalculatorClient />;
}

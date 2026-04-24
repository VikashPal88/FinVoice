import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import InsightsPage from "@/components/pages/InsightsPage";

export default async function InsightsPageRoute() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return <InsightsPage />;
}

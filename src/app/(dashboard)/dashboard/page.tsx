import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardPage from "@/components/pages/DashboardPage";

export default async function DashboardPageRoute() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return <DashboardPage />;
}

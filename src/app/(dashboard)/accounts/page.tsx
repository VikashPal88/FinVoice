import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccountsPage from "@/components/pages/AccountsPage";

export default async function AccountsPageRoute() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return <AccountsPage />;
}

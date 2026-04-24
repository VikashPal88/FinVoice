import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TransactionsPage from "@/components/pages/TransactionsPage";

export default async function TransactionsPageRoute() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return <TransactionsPage />;
}

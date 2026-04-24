import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsPage from "@/components/pages/SettingsPage";

export default async function SettingsPageRoute() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return <SettingsPage />;
}

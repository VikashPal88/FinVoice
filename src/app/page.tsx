// This is a Server Component (No "use client")
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // Adjust path to your auth.ts
import LandingPage from "@/components/pages/LandigPage"; // Your client component

export default async function Page() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard"); // Server-side redirect (instant, no flicker)
  }

  return <LandingPage />;
}

"use client";

import { useEffect } from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useStore } from "@/store/useStore";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

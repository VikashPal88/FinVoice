import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinDash — Finance Dashboard",
  description:
    "A clean, interactive finance dashboard to track and understand your financial activity. Built with Next.js, TypeScript, and Tailwind CSS.",
  keywords: ["finance", "dashboard", "transactions", "budgeting", "analytics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={cn("h-full", inter.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-full font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

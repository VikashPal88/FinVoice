"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import TopCategories from "@/components/insights/TopCategories";
import MonthlyComparison from "@/components/insights/MonthlyComparison";
import SpendingInsights from "@/components/insights/SpendingInsights";
import ExpenseTrendChart from "@/components/insights/ExpenseTrendChart";
import AIInsightsCard from "@/components/insights/AIInsightsCard";
import WeekdaySpendingPattern from "@/components/insights/WeekdaySpendingPattern";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { fetchJsonCached } from "@/lib/client-fetch";
import { Account, Transaction } from "@/types";

export default function InsightsPage() {
  const { accounts, setAccounts, setTransactions } = useStore();
  const [accountId, setAccountId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accData, transData] = await Promise.all([
          fetchJsonCached<Account[]>("/api/accounts"),
          fetchJsonCached<Transaction[]>("/api/transactions"),
        ]);

        setAccounts(accData);
        setTransactions(transData);
      } catch (error) {
        console.error("Failed to fetch insights data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setAccounts, setTransactions]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Insights</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Deep dive into your financial habits and trends.
          </p>
        </div>

        <Select
          value={accountId}
          onValueChange={(val: string) => setAccountId(val)}
        >
          <SelectTrigger
            className="w-[200px] h-[44px] rounded-xl text-sm border bg-[var(--surface)] text-[var(--foreground)]"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <SelectValue placeholder="All Accounts">
              {accountId === "all"
                ? "All Accounts"
                : accounts.find((a) => a.id === accountId)?.name ||
                  "All Accounts"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[var(--dropdown-bg)] border-[var(--glass-border)] text-[var(--foreground)]">
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* AI-Powered Insights Section */}
      <AIInsightsCard />

      <SpendingInsights accountId={accountId} />

      <ExpenseTrendChart accountId={accountId} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeekdaySpendingPattern accountId={accountId} />
        <TopCategories accountId={accountId} />
      </div>
      <MonthlyComparison accountId={accountId} />
    </motion.div>
  );
}

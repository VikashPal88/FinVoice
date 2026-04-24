"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import SummaryCards from "@/components/dashboard/SummaryCards";
import BalanceTrendChart from "@/components/dashboard/BalanceTrendChart";
import SpendingBreakdown from "@/components/dashboard/SpendingBreakdown";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import AccountOverview from "@/components/dashboard/AccountOverview";
import TransactionModal from "@/components/transactions/TransactionModal";
import { fetchJsonCached } from "@/lib/client-fetch";

interface DashboardData {
  id: string;
  name: string;
  email: string;
  financialAccounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    monthlyBudget: number;
    isDefault: boolean;
    icon: string;
    color: string;
    transactions: Array<{
      id: string;
      amount: number;
      type: "INCOME" | "EXPENSE";
      date: string;
      description: string;
      // add other fields you need
    }>;
  }>;
}

interface DashboardResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  useEffect(() => {
    fetchJsonCached<DashboardResponse>("/api/dashboard")
      .then((result) => {
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || "Something went wrong");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading your finance dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>Error: {error || "No data"}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6 w-full"
    >
      {/* Greeting Header */}
      {/* <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Good morning, {data.name.split(' ')[0]} 👋</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Stay on top of your finances, monitor progress, and track status.</p>
      </div> */}

      {/* Row 1: Main Stats (now includes Add Transaction) */}
      <SummaryCards
        accounts={data.financialAccounts}
        onManualAdd={() => setIsTxModalOpen(true)}
      />

      {/* Row 2: Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceTrendChart accounts={data.financialAccounts} />
        <SpendingBreakdown accounts={data.financialAccounts} />
      </div>

      {/* Row 3: Account Carousel */}
      <AccountOverview accounts={data.financialAccounts} />

      {/* Row 5: Recent Transactions Table */}
      <RecentTransactions accounts={data.financialAccounts} />

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />
    </motion.div>
  );
}

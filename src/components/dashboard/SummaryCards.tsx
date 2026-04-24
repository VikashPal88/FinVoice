"use client";

import { motion } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  PiggyBank,
  BarChart3,
} from "lucide-react";
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateSavingsRate,
  getMonthlySummaries,
} from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";

import { Camera, Mic, FileUp } from "lucide-react";
import { useState } from "react";
import { ScanReceiptDrawer } from "@/components/ui/scan-receipt-drawer";
import { VoiceInputDrawer } from "@/components/ui/voice-input-drawer";
import { UploadStatementDrawer } from "@/components/ui/upload-statement-drawer";
import TransactionModal from "@/components/transactions/TransactionModal";

export default function SummaryCards({
  accounts,
  onManualAdd,
}: {
  accounts: any[];
  onManualAdd?: () => void;
}) {
  const [scanOpen, setScanOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);
  const [prefillTx, setPrefillTx] = useState<any>(null);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [importingBulk, setImportingBulk] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  const transactions =
    accounts?.flatMap(
      (a: any) =>
        a.transactions?.map((t: any) => ({
          ...t,
          type: t.type.toLowerCase(),
          accountId: a.id,
        })) || [],
    ) || [];

  const totalBalance =
    accounts?.reduce((sum, a) => sum + (a.balance || 0), 0) || 0;
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const savingsRate = calculateSavingsRate(transactions);
  const netBalance = totalIncome - totalExpenses;

  // Monthly comparison for trend
  const summaries = getMonthlySummaries(transactions);
  const currentMonth = summaries[summaries.length - 1];
  const prevMonth = summaries[summaries.length - 2];
  const incomeChange =
    prevMonth && currentMonth
      ? (
          ((currentMonth.income - prevMonth.income) / (prevMonth.income || 1)) *
          100
        ).toFixed(0)
      : "0";
  const expenseChange =
    prevMonth && currentMonth
      ? (
          ((currentMonth.expenses - prevMonth.expenses) /
            (prevMonth.expenses || 1)) *
          100
        ).toFixed(0)
      : "0";

  // Handle parsed transaction from AI features
  const handleParsedTransaction = (data: any) => {
    setPrefillTx(data);
    setTxModalOpen(true);
  };

  // Handle bulk import from statement
  const handleBulkImport = async (transactions: any[]) => {
    setImportingBulk(true);
    setBulkStatus(null);

    const defaultAccount =
      accounts.find((a: any) => a.isDefault) || accounts[0];
    if (!defaultAccount) {
      setBulkStatus("No account found. Please create an account first.");
      setImportingBulk(false);
      return;
    }

    try {
      const payload = transactions.map((tx) => ({
        description: tx.description,
        amount: Number(tx.amount) || 0,
        category: tx.category || "Other",
        type: tx.type || "EXPENSE",
        date: new Date(tx.date).toISOString(),
        accountId: defaultAccount.id,
      }));

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: payload }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setBulkStatus(json?.error || "Bulk import failed. Please try again.");
        return;
      }

      const createdCount = Number(json.createdCount) || payload.length;
      setBulkStatus(
        `Imported ${createdCount} transaction${createdCount > 1 ? "s" : ""}`,
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("refreshTransactions"));
      }
    } catch {
      setBulkStatus("Bulk import failed. Please try again.");
    } finally {
      setImportingBulk(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Total Balance — Large card (left) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="md:col-span-1 lg:col-span-4 dash-card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-[var(--muted)]">
                Total Balance
              </p>
              <div className="p-2 rounded-xl bg-accent-orange-light">
                <Wallet size={18} className="text-accent-orange" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)] mt-2">
              {formatCurrency(netBalance)}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                <ArrowUp size={12} /> {Math.abs(Number(incomeChange))}%
              </span>
              <span className="text-xs text-[var(--muted)]">
                than last month
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 ">
            <div className="flex-1 text-center py-2 rounded-xl bg-white/10 dash-card">
              <p className="text-[10px] text-gray-400 uppercase">Income</p>
              <p className="text-sm font-bold text-green-400">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="flex-1 text-center py-2 rounded-xl bg-white/10 dash-card">
              <p className="text-[10px] text-gray-400 uppercase">Expenses</p>
              <p className="text-sm font-bold text-red-400">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 2×2 Stat Cards (middle) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 lg:col-span-4 grid grid-cols-2 gap-3 md:gap-4"
        >
          {/* Total Earnings — Orange */}
          <div className="dash-card-orange p-4 flex flex-col justify-between min-h-[110px] sm:min-h-[130px]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Total Earnings
              </p>
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <TrendingUp size={14} />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold mt-2">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-[11px] opacity-70 mt-1">
                ↑{Math.abs(Number(incomeChange))}% This month
              </p>
            </div>
          </div>

          {/* Total Spending */}
          <div className="dash-card p-4 flex flex-col justify-between min-h-[110px] sm:min-h-[130px]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Total Spending
              </p>
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingDown size={14} className="text-red-500" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--foreground)] mt-2">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                {Number(expenseChange) > 0 ? "↑" : "↓"}
                {Math.abs(Number(expenseChange))}% This month
              </p>
            </div>
          </div>

          {/* Total Income */}
          <div className="dash-card p-4 flex flex-col justify-between min-h-[110px] sm:min-h-[130px]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Total Income
              </p>
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign size={14} className="text-green-500" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--foreground)] mt-2">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-1">This month</p>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="dash-card p-4 flex flex-col justify-between min-h-[110px] sm:min-h-[130px]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Savings Rate
              </p>
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <PiggyBank size={14} className="text-violet-500" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--foreground)] mt-2">
                {savingsRate.toFixed(1)}%
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                {savingsRate >= 20 ? "Healthy ✨" : "Needs work"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Add Transaction — Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 lg:col-span-4 flex flex-col gap-4 p-5 dash-card"
        >
          <h1 className="text-xl sm:text-2xl font-bold ">
            Quick Add Transaction
          </h1>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-white/">
            {/* Scan Receipt */}
            <div
              onClick={() => setScanOpen(true)}
              className="dash-card p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent-orange/40 transition-all group min-h-[120px]"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-orange-light flex items-center justify-center text-accent-orange group-hover:scale-110 transition-transform mb-2">
                <Camera size={20} />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Scan Receipt
              </p>
              <p className="text-[9px] text-[var(--muted)] mt-0.5">
                AI-Powered
              </p>
            </div>

            {/* Voice Entry */}
            <div
              onClick={() => setVoiceOpen(true)}
              className="dash-card p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500/40 transition-all group min-h-[120px]"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-2">
                <Mic size={20} />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Voice Entry
              </p>
              <p className="text-[9px] text-[var(--muted)] mt-0.5">
                AI-Powered
              </p>
            </div>
          </div>

          {/* Upload Statement */}
          <div
            onClick={() => setStatementOpen(true)}
            className="dash-card p-5 flex items-center gap-4 cursor-pointer hover:border-violet-500/40 transition-all group flex-1"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform flex-shrink-0">
              <FileUp size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Upload Statement
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-1 leading-tight">
                CSV, Image, Screenshot, or bank message
              </p>
            </div>
          </div>

          {/* Bulk Status Toast */}
          {bulkStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400 font-medium text-center"
            >
              {bulkStatus}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Drawers */}
      <ScanReceiptDrawer
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onTransactionParsed={handleParsedTransaction}
      />
      <VoiceInputDrawer
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onTransactionParsed={handleParsedTransaction}
      />
      <UploadStatementDrawer
        open={statementOpen}
        onClose={() => setStatementOpen(false)}
        onImport={handleBulkImport}
      />

      {/* Pre-filled Transaction Modal */}
      {txModalOpen && (
        <TransactionModal
          isOpen={txModalOpen}
          onClose={() => {
            setTxModalOpen(false);
            setPrefillTx(null);
          }}
          editTransaction={
            prefillTx
              ? {
                  id: "",
                  description: prefillTx.description || "",
                  amount: Number(prefillTx.amount) || 0,
                  category: prefillTx.category || "Other",
                  type: prefillTx.type || "expense",
                  date:
                    prefillTx.date || new Date().toISOString().split("T")[0],
                  accountId:
                    accounts.find((a: any) => a.isDefault)?.id ||
                    accounts[0]?.id ||
                    "",
                }
              : null
          }
        />
      )}
    </>
  );
}

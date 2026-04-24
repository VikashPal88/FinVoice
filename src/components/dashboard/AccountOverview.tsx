"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatters";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccountOverview({
  accounts = [],
}: {
  accounts?: any[];
}) {
  const router = useRouter();

  const accountMetrics = accounts.map((account: any) => {
    const normalizedTransactions = (account.transactions || []).map(
      (transaction: any) => ({
        ...transaction,
        amount: Number(transaction.amount) || 0,
        type: transaction.type?.toLowerCase?.() || "expense",
      }),
    );

    const monthlySpent = normalizedTransactions
      .filter(
        (transaction: any) =>
          transaction.type === "expense" &&
          transaction.date?.substring(0, 7) ===
            new Date().toISOString().substring(0, 7),
      )
      .reduce((sum: number, transaction: any) => sum + transaction.amount, 0);

    const income = normalizedTransactions
      .filter((transaction: any) => transaction.type === "income")
      .reduce((sum: number, transaction: any) => sum + transaction.amount, 0);

    const expenses = normalizedTransactions
      .filter((transaction: any) => transaction.type === "expense")
      .reduce((sum: number, transaction: any) => sum + transaction.amount, 0);

    const monthlyBudget = Number(account.monthlyBudget) || 0;
    const budgetPercent =
      monthlyBudget > 0 ? (monthlySpent / monthlyBudget) * 100 : 0;
    const isWarning = budgetPercent >= 90;
    const isOver = budgetPercent >= 100;

    return {
      ...account,
      income,
      expenses,
      monthlySpent,
      monthlyBudget,
      budgetPercent,
      isWarning,
      isOver,
      txCount: normalizedTransactions.length,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            My Accounts
          </h3>
          <p className="text-xs text-[var(--muted)]">
            A quick overview of balances, budgets, and flows.
          </p>
        </div>
        <button
          onClick={() => router.push("/accounts")}
          className="flex items-center gap-1.5 text-xs font-medium text-accent-orange hover:text-accent-orange-dark transition-colors"
        >
          <Plus size={14} /> Manage
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {accountMetrics.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className="snap-start shrink-0"
          >
            <Card
              className="w-[260px] cursor-pointer border-white/10 bg-[#121215]/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-all hover:border-orange-500/30 hover:shadow-[0_14px_36px_rgba(0,0,0,0.38)]"
              onClick={() =>
                router.push(`/transactions?accountId=${account.id}`)
              }
            >
              <CardHeader className="pb-1 px-5 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base font-semibold capitalize truncate text-white">
                      {account.name}
                    </CardTitle>
                    <p className="mt-1 text-xs text-zinc-400">
                      {account.type?.charAt(0) +
                        account.type?.slice(1).toLowerCase()}{" "}
                      Account
                    </p>
                  </div>
                  {account.isDefault ? (
                    <span className="rounded-full bg-orange-500/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange-400 border border-orange-500/20">
                      Default
                    </span>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="px-5 pt-0 pb-4">
                <div className="text-[2rem] font-bold leading-none text-white">
                  {formatCurrency(Number(account.balance) || 0)}
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  {account.txCount} transaction
                  {account.txCount === 1 ? "" : "s"}
                </p>

                {account.monthlyBudget > 0 ? (
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Budget
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          account.isOver
                            ? "text-red-500"
                            : account.isWarning
                              ? "text-amber-500"
                              : "text-zinc-300"
                        }`}
                      >
                        {formatCurrency(account.monthlySpent)} /{" "}
                        {formatCurrency(account.monthlyBudget)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(account.budgetPercent, 100)}%`,
                          backgroundColor: account.isOver
                            ? "#ef4444"
                            : account.isWarning
                              ? "#f59e0b"
                              : "#22c55e",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-[11px] italic text-zinc-400">
                    No monthly budget set
                  </p>
                )}
              </CardContent>

              <CardFooter className="justify-between border-t border-white/8 px-5 pt-4 pb-4 text-sm">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-500">
                    {formatCurrency(account.income)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-500">
                    {formatCurrency(account.expenses)}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

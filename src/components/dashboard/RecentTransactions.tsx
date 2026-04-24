"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { CATEGORY_COLORS } from "@/data/mockData";
import { useRouter } from "next/navigation";

export default function RecentTransactions({ accounts }: { accounts: any[] }) {
  const transactions =
    accounts?.flatMap(
      (a: any) =>
        a.transactions?.map((t: any) => ({
          ...t,
          type: t.type.toLowerCase(),
          accountId: a.id,
          accountName: a.name,
          accountIcon: a.icon,
        })) || [],
    ) || [];
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(
      (t) =>
        !search || t.description?.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="dash-card p-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">
          Recent Activities
        </h3>
        {/* <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs rounded-xl bg-[var(--input-bg)] border border-[var(--glass-border)] w-full sm:w-[180px] focus:border-accent-orange/50 transition-colors"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--glass-border)] bg-[var(--card-bg)] hover:bg-[var(--surface-hover)] transition-colors text-[var(--muted)]">
            <SlidersHorizontal size={13} /> Filter
          </button>
        </div> */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--glass-border)]">
              <th className="text-left text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider py-3 px-2">
                Description
              </th>
              <th className="text-left text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider py-3 px-2 hidden sm:table-cell">
                Category
              </th>
              <th className="text-right text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider py-3 px-2">
                Amount
              </th>
              <th className="text-center text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider py-3 px-2 hidden md:table-cell">
                Status
              </th>
              <th className="text-right text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider py-3 px-2 hidden lg:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, index) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + index * 0.03 }}
                className="border-b border-[var(--glass-border)] last:border-b-0 hover:bg-[var(--surface-hover)] transition-colors group"
              >
                {/* Description */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        tx.type === "income" ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowUpRight size={14} className="text-green-500" />
                      ) : (
                        <ArrowDownRight size={14} className="text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--foreground)] truncate max-w-[200px]">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-[var(--muted)] sm:hidden">
                        {tx.category}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-2 hidden sm:table-cell">
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[tx.category] || "#6b7280"}15`,
                      color: CATEGORY_COLORS[tx.category] || "#6b7280",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[tx.category] || "#6b7280",
                      }}
                    />
                    {tx.category}
                  </span>
                </td>

                {/* Amount */}
                <td className="py-3 px-2 text-right">
                  <span
                    className={`text-xs font-bold ${
                      tx.type === "income" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3 px-2 text-center hidden md:table-cell">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Completed
                  </span>
                </td>

                {/* Date */}
                <td className="py-3 px-2 text-right hidden lg:table-cell">
                  <span className="text-xs text-[var(--muted)]">
                    {formatDate(tx.date)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--glass-border)]">
        <p className="text-[11px] text-[var(--muted)]">
          Showing {filtered.length} of {transactions.length} transactions
        </p>
        <button
          onClick={() => router.push("/transactions")}
          className="text-xs font-semibold text-accent-orange hover:text-accent-orange-dark transition-colors"
        >
          View all →
        </button>
      </div>
    </motion.div>
  );
}

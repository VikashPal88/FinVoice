"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  getCategoryBreakdown,
  calculateTotalExpenses,
} from "@/utils/calculations";
import { formatCurrency } from "@/utils/formatters";
import { Pencil, Check, X, Loader2 } from "lucide-react";

export default function SpendingBreakdown({ accounts }: { accounts: any[] }) {
  const transactions =
    accounts?.flatMap(
      (a: any) =>
        a.transactions?.map((t: any) => ({
          ...t,
          type: t.type.toLowerCase(),
          accountId: a.id,
        })) || [],
    ) || [];

  const totalBudget =
    accounts?.reduce((sum, a) => sum + (a.monthlyBudget || 0), 0) || 0;
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyExpenses = transactions
    .filter(
      (t: any) =>
        t.type === "expense" && t.date?.substring(0, 7) === currentMonth,
    )
    .reduce((s: number, t: any) => s + t.amount, 0);

  const [displayBudget, setDisplayBudget] = useState(totalBudget);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayBudget(totalBudget);
  }, [totalBudget]);

  const budgetPercent =
    displayBudget > 0
      ? Math.min((monthlyExpenses / displayBudget) * 100, 100)
      : 0;
  const isWarning = budgetPercent >= 80;

  // Save budget — updates the global budget via API
  const handleSaveBudget = async () => {
    const amount = parseFloat(editValue);
    if (isNaN(amount) || amount < 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        setDisplayBudget(amount);
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const breakdown = getCategoryBreakdown(transactions);
  const top6 = breakdown.slice(0, 6);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-gray-800">{data.category}</p>
        <p className="text-sm font-bold mt-1 text-gray-900">
          {formatCurrency(data.amount)}
        </p>
        <p className="text-xs text-gray-400">
          {data.percentage.toFixed(1)}% of total
        </p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className=""
    >
      {/* Monthly Budget Progress */}
      <div className="mb-6 dash-card p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Monthly Spending Limit
          </h3>
          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                setEditValue(displayBudget.toString());
              }}
              className="flex items-center gap-1 text-[10px] font-medium text-accent-orange hover:text-accent-orange-dark transition-colors"
            >
              <Pencil size={10} />
              Edit
            </button>
          )}
        </div>

        {/* Inline Edit */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--surface)] border border-[var(--glass-border)]">
                <span className="text-sm text-[var(--muted)] font-medium pl-1">
                  ₹
                </span>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Enter monthly budget"
                  autoFocus
                  className="flex-1 bg-transparent !bg-none text-sm font-semibold 
             !border-none !outline-none !ring-0 
             focus:!outline-none focus:!ring-0 focus:!border-none focus:!bg-transparent
             appearance-none [appearance:textfield] 
             [&::-webkit-outer-spin-button]:appearance-none 
             [&::-webkit-inner-spin-button]:appearance-none"
                  style={{
                    backgroundColor: "transparent",
                    WebkitAppearance: "none",
                    boxShadow: "none",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveBudget();
                    if (e.key === "Escape") setEditing(false);
                  }}
                />
                <button
                  onClick={handleSaveBudget}
                  disabled={saving}
                  className="p-1.5 rounded-md cursor-pointer bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                >
                  <X size={12} className="text-[var(--muted)]" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-[var(--foreground)]">
              {formatCurrency(monthlyExpenses)}
            </span>
            <span className="text-xs text-[var(--muted)]">spent out of</span>
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {displayBudget > 0
              ? formatCurrency(displayBudget)
              : "No budget set"}
          </span>
        </div>
        {displayBudget > 0 ? (
          <>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetPercent}%` }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: isWarning
                    ? "linear-gradient(90deg, #EF4444, #DC2626)"
                    : "linear-gradient(90deg, #F97316, #EA580C)",
                }}
              />
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-1.5">
              {budgetPercent.toFixed(0)}% of budget used
              {isWarning && " ⚠️"}
            </p>
          </>
        ) : (
          <div className="text-center py-2">
            <button
              onClick={() => {
                setEditing(true);
                setEditValue("");
              }}
              className="text-xs font-medium text-accent-orange hover:text-accent-orange-dark transition-colors"
            >
              + Set Monthly Budget
            </button>
          </div>
        )}
      </div>

      {/* Spending Breakdown */}
      <div className="dash-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Spending Breakdown
          </h3>
          <span className="text-xs text-[var(--muted)]">By category</span>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
          <div className="w-36 h-36 sm:w-40 sm:h-40 flex-shrink-0">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={top6}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    dataKey="amount"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {top6.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={index === 0 ? "#F97316" : entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex-1 w-full space-y-2.5">
            {top6.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: index === 0 ? "#F97316" : item.color,
                  }}
                />
                <span className="text-xs text-[var(--muted)] flex-1 truncate">
                  {item.category}
                </span>
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-[10px] text-[var(--muted)] w-10 text-right">
                  {item.percentage.toFixed(0)}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

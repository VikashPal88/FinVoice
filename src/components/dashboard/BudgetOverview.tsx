"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Pencil,
  Check,
  X,
  Loader2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface BudgetData {
  globalBudget: number | null;
  totalBudget: number;
  totalSpent: number;
  percentage: number;
  accounts: {
    id: string;
    name: string;
    icon: string;
    monthlyBudget: number;
    spent: number;
    percentage: number;
  }[];
}

export default function BudgetOverview() {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountEditValue, setAccountEditValue] = useState("");

  const fetchBudget = async () => {
    try {
      const res = await fetch("/api/budget");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch budget", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const handleSaveGlobalBudget = async () => {
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
        setEditing(false);
        fetchBudget();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccountBudget = async (accountId: string) => {
    const amount = parseFloat(accountEditValue);
    if (isNaN(amount) || amount < 0) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyBudget: amount }),
      });

      if (res.ok) {
        setEditingAccountId(null);
        fetchBudget();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-card p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  if (!data) return null;

  const isWarning = data.percentage >= 90;
  const isOver = data.percentage >= 100;
  const progressColor = isOver ? "#ef4444" : isWarning ? "#f59e0b" : "#f97316";
  const hasBudget = data.totalBudget > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="dash-card p-5 col-span-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-accent-orange" />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Monthly Budget
          </h3>
        </div>
        {!editing && (
          <button
            onClick={() => {
              setEditing(true);
              setEditValue(
                data.globalBudget?.toString() ||
                  data.totalBudget.toString() ||
                  "",
              );
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-accent-orange hover:text-accent-orange-dark transition-colors"
          >
            <Pencil size={12} />
            Edit Budget
          </button>
        )}
      </div>

      {/* Edit Global Budget */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--glass-border)]">
              <span className="text-sm text-[var(--muted)] font-medium">₹</span>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter monthly budget"
                autoFocus
                className="flex-1 bg-transparent text-sm font-semibold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] "
              />
              <button
                onClick={handleSaveGlobalBudget}
                disabled={saving}
                className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                <X size={14} className="text-[var(--muted)]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Budget Progress */}
      {hasBudget ? (
        <div className="mb-5">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-2xl font-extrabold text-[var(--foreground)]">
                {formatCurrency(data.totalSpent)}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                of {formatCurrency(data.totalBudget)} budget
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-bold ${isOver ? "text-red-500" : isWarning ? "text-amber-500" : "text-green-500"}`}
              >
                {data.percentage.toFixed(1)}%
              </p>
              <p className="text-[10px] text-[var(--muted)]">
                {isOver
                  ? "Exceeded!"
                  : `₹${(data.totalBudget - data.totalSpent).toLocaleString("en-IN")} left`}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 rounded-full bg-[var(--surface)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(data.percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: progressColor }}
            />
          </div>

          {/* Warning */}
          {isWarning && (
            <div
              className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-lg ${isOver ? "bg-red-50 dark:bg-red-950/20" : "bg-amber-50 dark:bg-amber-950/20"}`}
            >
              <AlertTriangle
                size={14}
                className={isOver ? "text-red-500" : "text-amber-500"}
              />
              <p
                className={`text-xs font-medium ${isOver ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}
              >
                {isOver
                  ? "You have exceeded your monthly budget!"
                  : "You're approaching your budget limit (90%+)"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 mb-4">
          <Target
            size={32}
            className="mx-auto mb-3 text-[var(--muted)] opacity-40"
          />
          <p className="text-sm text-[var(--muted)]">No budget set yet</p>
          <button
            onClick={() => {
              setEditing(true);
              setEditValue("");
            }}
            className="mt-2 text-xs font-medium text-accent-orange hover:text-accent-orange-dark transition-colors"
          >
            Set Monthly Budget →
          </button>
        </div>
      )}

      {/* Per-Account Budgets */}
      {data.accounts.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
            Account Budgets
          </p>
          {data.accounts.map((acc) => {
            const accIsOver = acc.percentage >= 100;
            const accIsWarning = acc.percentage >= 90;
            const accColor = accIsOver
              ? "#ef4444"
              : accIsWarning
                ? "#f59e0b"
                : "#22c55e";
            const isEditingThis = editingAccountId === acc.id;

            return (
              <div key={acc.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{acc.icon}</span>
                    <span className="text-xs font-medium text-[var(--foreground)]">
                      {acc.name}
                    </span>
                  </div>

                  {isEditingThis ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[var(--muted)]">₹</span>
                      <input
                        type="number"
                        value={accountEditValue}
                        onChange={(e) => setAccountEditValue(e.target.value)}
                        autoFocus
                        className="w-20 bg-[var(--surface)] text-xs font-semibold text-[var(--foreground)] outline-none rounded px-1.5 py-1 border border-[var(--glass-border)]"
                      />
                      <button
                        onClick={() => handleSaveAccountBudget(acc.id)}
                        disabled={saving}
                        className="p-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <Check size={10} />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingAccountId(null)}
                        className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <X size={10} className="text-[var(--muted)]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingAccountId(acc.id);
                        setAccountEditValue(acc.monthlyBudget.toString());
                      }}
                      className="text-xs text-[var(--muted)] hover:text-accent-orange transition-colors flex items-center gap-1"
                    >
                      {formatCurrency(acc.spent)} /{" "}
                      {formatCurrency(acc.monthlyBudget)}
                      <Pencil
                        size={10}
                        className="opacity-0 group-hover:opacity-100"
                      />
                    </button>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(acc.percentage, 100)}%`,
                      backgroundColor: accColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

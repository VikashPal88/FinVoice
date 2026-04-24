"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarIcon } from "lucide-react";
import { Transaction, TransactionType, Category } from "@/types";
import { CategoryItem } from "@/lib/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { fetchJsonCached, invalidateClientFetch } from "@/lib/client-fetch";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  editTransaction,
}: TransactionModalProps) {
  const { data: session } = useSession();
  const isEdit = Boolean(editTransaction?.id);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const defaultAccount = accounts.find((a) => a.isDefault);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Food & Dining" as Category,
    type: "expense" as TransactionType,
    date: new Date().toISOString().split("T")[0],
    accountId: defaultAccount?.id || "",
  });
  const selectedAccount = accounts.find((a) => a.id === form.accountId);

  // Filtered categories based on selected type
  const currentCategories = allCategories.filter((c) => c.type === form.type);

  // Load data when modal opens
  useEffect(() => {
    if (!isOpen || !session) return;

    let isActive = true;

    Promise.all([
      fetchJsonCached<any[]>("/api/accounts"),
      fetchJsonCached<CategoryItem[]>("/api/categories"),
    ])
      .then(([accountsData, categoriesData]) => {
        if (!isActive) return;

        setAccounts(accountsData);
        setAllCategories(categoriesData);
      })
      .catch((err) => {
        console.error("Failed to load transaction modal data", err);
      });

    return () => {
      isActive = false;
    };
  }, [isOpen, session]);

  // Reset form when editTransaction or modal state changes
  useEffect(() => {
    if (!isOpen) return;

    if (editTransaction) {
      setForm({
        description: editTransaction.description,
        amount: editTransaction.amount.toString(),
        category: editTransaction.category,
        type: editTransaction.type,
        date: editTransaction.date,
        accountId: editTransaction.accountId || defaultAccount?.id || "",
      });
    } else {
      const expenseCategories = allCategories.filter(
        (c) => c.type === "expense",
      );
      setForm({
        description: "",
        amount: "",
        category:
          expenseCategories.length > 0
            ? expenseCategories[0].name
            : "Food & Dining",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        accountId: defaultAccount?.id || "",
      });
    }
  }, [editTransaction, isOpen, defaultAccount?.id, allCategories]);

  const readErrorMessage = async (res: Response) => {
    const text = await res.text();
    if (!text) {
      return `Request failed with status ${res.status}`;
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.error === "string") return parsed.error;
      if (typeof parsed?.message === "string") return parsed.message;
    } catch {
      // Some route errors may return an empty/non-JSON response in dev.
    }

    return text;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const data = {
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      type: form.type.toUpperCase(),
      date: new Date(form.date).toISOString(),
      accountId: form.accountId,
    };

    try {
      if (isEdit && editTransaction) {
        // Update existing transaction
        const res = await fetch(`/api/transactions/${editTransaction.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await readErrorMessage(res);
          console.error("Failed to update transaction:", err);
          return;
        }
      } else {
        // Create new transaction
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await readErrorMessage(res);
          console.error("Failed to create transaction:", err);
          return;
        }
      }
      invalidateClientFetch(
        "/api/transactions",
        "/api/accounts",
        "/api/dashboard",
        "/api/budget",
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("refreshTransactions"));
      }
      onClose();
    } catch (err) {
      console.error("Transaction submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "var(--dropdown-bg)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {isEdit ? "Edit Transaction" : "Add Transaction"}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">
                  Type
                </label>
                <div
                  className="flex rounded-lg overflow-hidden border"
                  style={{ borderColor: "var(--glass-border)" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const expenseCats = allCategories.filter(
                        (c) => c.type === "expense",
                      );
                      setForm({
                        ...form,
                        type: "expense",
                        category: expenseCats[0]?.name || "Food & Dining",
                      });
                    }}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                      form.type === "expense"
                        ? "bg-expense text-white"
                        : "bg-[var(--surface)] text-[var(--muted)]"
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const incomeCats = allCategories.filter(
                        (c) => c.type === "income",
                      );
                      setForm({
                        ...form,
                        type: "income",
                        category: incomeCats[0]?.name || "Salary",
                      });
                    }}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                      form.type === "income"
                        ? "bg-income text-white"
                        : "bg-[var(--surface)] text-[var(--muted)]"
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Account Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">
                  Account
                </label>
                <Select
                  value={form.accountId}
                  onValueChange={(val) => setForm({ ...form, accountId: val })}
                >
                  <SelectTrigger
                    className="w-full h-[44px] rounded-xl text-sm border bg-[var(--surface)] text-[var(--foreground)]"
                    style={{ borderColor: "var(--glass-border)" }}
                  >
                    <SelectValue placeholder="Select account">
                      {selectedAccount ? ` ${selectedAccount.name}` : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--dropdown-bg)] border-[var(--glass-border)] text-[var(--foreground)] z-[60] px-2">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="e.g., Swiggy dinner order"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">
                  Category
                </label>
                <Select
                  value={form.category}
                  onValueChange={(val) =>
                    setForm({ ...form, category: val as Category })
                  }
                >
                  <SelectTrigger
                    className="w-full h-[44px] rounded-xl text-sm border bg-[var(--surface)] text-[var(--foreground)] "
                    style={{ borderColor: "var(--glass-border)" }}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--dropdown-bg)] border-[var(--glass-border)] text-[var(--foreground)] z-[60] px-2">
                    {currentCategories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: c.color }}
                          />
                          {c.name}
                          {!c.isDefault && (
                            <span className="text-[9px] text-[var(--muted)] ml-1">
                              (custom)
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date - Custom Calendar Toggle */}
              <div className="space-y-1.5 relative flex flex-col">
                <label className="text-xs font-medium text-[var(--muted)]">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger
                    className="w-full h-[44px] px-4 rounded-xl text-sm text-left border flex items-center justify-between transition-colors hover:bg-[var(--surface-hover)] focus:ring-2 focus:ring-primary/20"
                    style={{
                      borderColor: "var(--glass-border)",
                      backgroundColor: "var(--input-bg)",
                    }}
                  >
                    <span>{formatDisplayDate(form.date)}</span>
                    <CalendarIcon className="text-[var(--muted)] h-4 w-4" />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 z-[60] bg-[var(--dropdown-bg)] border-[var(--glass-border)]"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={new Date(form.date)}
                      onSelect={(date) => {
                        if (date)
                          setForm({
                            ...form,
                            date: format(date, "yyyy-MM-dd"),
                          });
                      }}
                      initialFocus
                      className="text-[var(--foreground)]"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !form.accountId}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Saving..."
                  : isEdit
                    ? "Save Changes"
                    : "Add Transaction"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

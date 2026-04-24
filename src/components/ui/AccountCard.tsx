"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  Target,
  MoreHorizontal,
  AlertTriangle,
  X,
} from "lucide-react";
import { Switch } from "./Switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { motion, AnimatePresence } from "framer-motion";

// Added missing Interface definition
interface AccountCardProps {
  account: any;
  onSetDefault: (id: string) => Promise<void>;
  onEdit: (account: any) => void;
  onDelete: (id: string) => Promise<void>;
  stats: any;
  monthlySpent: number;
}

export function AccountCard({
  account,
  onSetDefault,
  onEdit,
  onDelete,
  stats,
  monthlySpent,
}: AccountCardProps) {
  const { name, type, balance, id, isDefault, monthlyBudget = 0 } = account;
  const [isUpdating, setIsUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDefaultChange = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDefault || isUpdating) return;
    setIsUpdating(true);
    try {
      await onSetDefault(id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCardClick = () => {
    // Navigate to transactions page with this account pre-selected
    router.push(`/transactions?accountId=${id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const budgetPercent =
    monthlyBudget > 0 ? (monthlySpent / monthlyBudget) * 100 : 0;
  const isWarning = budgetPercent >= 90;
  const isOver = budgetPercent >= 100;

  const income = stats?.income || 0;
  const expenses = stats?.expenses || 0;

  return (
    <>
      <Card
        className="hover:shadow-md transition-shadow group relative cursor-pointer bg-[var(--dropdown-bg)]"
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize">
            {name}
          </CardTitle>
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Default toggle */}
            <div
              className="flex items-center gap-1.5"
              onClick={handleDefaultChange}
            >
              <span className="text-[10px] text-muted-foreground font-medium">
                {isDefault ? "Default" : "Set Default"}
              </span>
              <Switch
                checked={isDefault}
                disabled={isUpdating || isDefault}
                onCheckedChange={() => {}}
              />
            </div>
            {/* Actions popover */}
            <Popover open={menuOpen} onOpenChange={setMenuOpen}>
              <PopoverTrigger
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={16} className="text-[var(--muted)]" />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-36 p-1 bg-[var(--dropdown-bg)] border-[var(--glass-border)] z-[60] shadow-xl rounded-xl border"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(account);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--surface-hover)] text-[var(--foreground)]"
                >
                  <Pencil size={14} className="text-[var(--muted)]" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-500/10 text-red-500"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            ₹{parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>

          {/* Budget progress bar */}
          {monthlyBudget > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <Target size={12} className="text-muted-foreground" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Budget
                  </span>
                </div>
                <span
                  className={`text-xs font-bold ${
                    isOver
                      ? "text-red-500"
                      : isWarning
                        ? "text-amber-500"
                        : "text-muted-foreground"
                  }`}
                >
                  ₹{monthlySpent.toLocaleString("en-IN")} / ₹
                  {monthlyBudget.toLocaleString("en-IN")}
                  <span className="ml-1 text-[10px] opacity-70">
                    ({budgetPercent.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(budgetPercent, 100)}%`,
                    backgroundColor: isOver
                      ? "#ef4444"
                      : isWarning
                        ? "#f59e0b"
                        : "#22c55e",
                  }}
                />
              </div>
            </div>
          )}

          {monthlyBudget === 0 && (
            <p className="mt-2 text-[10px] text-muted-foreground italic">
              No budget set
            </p>
          )}
        </CardContent>

        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-green-500">
              ₹{income.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDownRight className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-500">
              ₹{expenses.toLocaleString("en-IN")}
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6 shadow-2xl border"
              style={{
                backgroundColor: "var(--dropdown-bg, #ffffff)",
                borderColor: "var(--glass-border, #e5e7eb)",
              }}
            >
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                  <AlertTriangle size={28} className="text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-center text-[var(--foreground)]">
                Delete Account?
              </h3>

              {/* Description */}
              <p className="text-sm text-center text-[var(--muted)] mt-2 leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-[var(--foreground)]">{name}</strong>?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium">
                  ⚠️ This will permanently delete the account and all its
                  transactions. This action cannot be undone.
                </p>
              </div>

              {/* Account Info */}
              <div className="mt-4 p-3 rounded-xl bg-[var(--surface)] border border-[var(--glass-border)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--muted)]">Balance</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    ₹{parseFloat(balance).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1.5">
                  <span className="text-[var(--muted)]">Transactions</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {stats?.txCount || 0}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[var(--glass-border)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2, Wallet, PiggyBank, X, Plus, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const drawerAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(50),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.coerce.number().min(0, "Balance must be 0 or more"),
  monthlyBudget: z.coerce.number().min(0, "Budget must be 0 or more"),
  isDefault: z.boolean(),
});

interface CreateAccountDrawerProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const ACCOUNT_TYPES = [
  {
    value: "CURRENT" as const,
    label: "Current / Checking",
    description: "For everyday spending",
    icon: <Wallet size={18} />,
  },
  {
    value: "SAVINGS" as const,
    label: "Savings",
    description: "Grow your money",
    icon: <PiggyBank size={18} />,
  },
];

export function CreateAccountDrawer({
  children,
  onSuccess,
}: CreateAccountDrawerProps) {
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<"CURRENT" | "SAVINGS">("CURRENT");
  const [balance, setBalance] = useState("0");
  const [monthlyBudget, setMonthlyBudget] = useState("0");
  const [isDefault, setIsDefault] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setType("CURRENT");
    setBalance("0");
    setMonthlyBudget("0");
    setIsDefault(false);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      name,
      type,
      balance: Number(balance),
      monthlyBudget: Number(monthlyBudget),
      isDefault,
    };

    const result = drawerAccountSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        setIsSubmitting(false);
        return;
      }

      reset();
      setOpen(false);
      onSuccess?.();
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              // CRITICAL: Force light mode variables locally to override global CSS
              style={{
                colorScheme: "light",
                ["--foreground" as any]: "#111827",
                ["--muted" as any]: "#6B7280",
                ["--input-bg" as any]: "#F9FAFB",
              }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] flex flex-col rounded-t-3xl shadow-2xl bg-white border-t border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 rounded-full bg-gray-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-5 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold !text-slate-900">
                    Create New Account
                  </h2>
                  <p className="text-sm !text-slate-500 mt-1">
                    Add a new financial account to track
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} className="!text-slate-400" />
                </button>
              </div>

              {/* Scrollable form */}
              <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
                <form
                  id="create-account-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Account Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold !text-slate-700">
                      Account Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Main Checking, Emergency Fund"
                      className="w-full px-4 py-3 text-sm rounded-xl !bg-slate-50 border border-slate-200 !text-slate-900 !placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:!bg-white transition"
                    />
                    {errors.name && (
                      <p className="text-xs !text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Account Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold !text-slate-700">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {ACCOUNT_TYPES.map((t) => {
                        const selected = type === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setType(t.value)}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                              selected
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-100 bg-slate-50 hover:border-slate-200"
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 border transition-all ${
                                selected
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-slate-400 border-slate-200"
                              }`}
                            >
                              {t.icon}
                            </div>
                            <p className="text-sm font-bold !text-slate-900 leading-tight">
                              {t.label}
                            </p>
                            <p className="text-[11px] !text-slate-500 mt-0.5">
                              {t.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Initial Balance */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold !text-slate-700">
                      Initial Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm !text-slate-400 font-bold">
                        ₹
                      </span>
                      <input
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        type="number"
                        step="1"
                        className="w-full pl-8 pr-4 py-3 text-sm rounded-xl !bg-slate-50 border border-slate-200 !text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:!bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Monthly Budget */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold !text-slate-700 flex items-center gap-1.5">
                      <Target size={14} className="text-blue-600" />
                      Monthly Budget (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm !text-slate-400 font-bold">
                        ₹
                      </span>
                      <input
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(e.target.value)}
                        type="number"
                        className="w-full pl-8 pr-4 py-3 text-sm rounded-xl !bg-slate-50 border border-slate-200 !text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:!bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Set as Default */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isDefault
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-100 bg-slate-50"
                    }`}
                    onClick={() => setIsDefault(!isDefault)}
                  >
                    <div>
                      <p className="text-sm font-bold !text-slate-900">
                        Set as Default
                      </p>
                      <p className="text-[11px] !text-slate-500">
                        Used for new transactions
                      </p>
                    </div>
                    <div
                      className={`w-11 h-6 rounded-full relative transition-colors ${isDefault ? "bg-blue-600" : "bg-slate-300"}`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isDefault ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-gray-100 flex gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold !text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="create-account-form"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-slate-900 !text-white text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

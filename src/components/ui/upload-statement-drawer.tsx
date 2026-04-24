"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  X,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface StatementTransaction {
  amount: number;
  description: string;
  date: string;
  category: string;
  type: string;
  selected?: boolean;
}

interface UploadStatementDrawerProps {
  open: boolean;
  onClose: () => void;
  onImport: (transactions: StatementTransaction[]) => void | Promise<void>;
}

export function UploadStatementDrawer({
  open,
  onClose,
  onImport,
}: UploadStatementDrawerProps) {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [transactions, setTransactions] = useState<StatementTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication
  if (status === "loading") {
    return null; // Don't render until we know auth status
  }

  if (status === "unauthenticated") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600">Please sign in to use this feature</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setResult(null);
    setTransactions([]);
  };

  const handleParse = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setTransactions([]);

    try {
      let res: Response;

      if (file) {
        const formData = new FormData();
        formData.append("statement", file);
        console.log(
          "[UPLOAD_STATEMENT] Uploading file:",
          file.name,
          file.type,
          file.size,
        );
        res = await fetch("/api/ai/parse-statement", {
          method: "POST",
          body: formData,
        });
      } else if (textInput.trim()) {
        console.log(
          "[UPLOAD_STATEMENT] Parsing text content, length:",
          textInput.length,
        );
        res = await fetch("/api/ai/parse-statement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: textInput.trim() }),
        });
      } else {
        setError("Please upload a file or paste statement text");
        setLoading(false);
        return;
      }

      console.log("[UPLOAD_STATEMENT] Response status:", res.status);
      const json = await res.json();
      console.log("[UPLOAD_STATEMENT] Response data:", json);

      if (!res.ok) {
        const errorMsg =
          json.error || `HTTP ${res.status}: Failed to parse statement`;
        console.error("[UPLOAD_STATEMENT] Error:", errorMsg);
        setError(errorMsg);
        return;
      }

      if (!json.success) {
        console.error("[UPLOAD_STATEMENT] API returned success=false:", json);
        setError(json.error || "Failed to parse statement");
        return;
      }

      if (!json.data) {
        console.error("[UPLOAD_STATEMENT] No data in response");
        setError("No data returned from parser");
        return;
      }

      console.log("[UPLOAD_STATEMENT] Parsed data:", json.data);
      setResult(json.data);

      const txList = (json.data.transactions || []).map((tx: any) => ({
        amount: tx.amount || 0,
        description: tx.description || "Unknown",
        date: tx.date || new Date().toISOString().split("T")[0],
        category: tx.category || "Other",
        type: tx.type || "EXPENSE",
        selected: true,
      }));

      console.log("[UPLOAD_STATEMENT] Transaction list:", txList);
      setTransactions(txList);
    } catch (error) {
      console.error("[UPLOAD_STATEMENT] Exception:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleTransaction = (index: number) => {
    setTransactions((prev) =>
      prev.map((tx, i) =>
        i === index ? { ...tx, selected: !tx.selected } : tx,
      ),
    );
  };

  const toggleAll = () => {
    const allSelected = transactions.every((tx) => tx.selected);
    setTransactions((prev) =>
      prev.map((tx) => ({ ...tx, selected: !allSelected })),
    );
  };

  const handleImport = async () => {
    const selected = transactions.filter((tx) => tx.selected);
    if (selected.length === 0) return;

    setImporting(true);
    try {
      await Promise.resolve(onImport(selected));
      handleClose();
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTextInput("");
    setResult(null);
    setTransactions([]);
    setError(null);
    setLoading(false);
    setImporting(false);
    onClose();
  };

  const selectedCount = transactions.filter((t) => t.selected).length;
  const displayedSummary = {
    totalTransactions: transactions.length,
    totalIncome: transactions
      .filter((tx) => tx.type === "INCOME")
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
    totalExpense: transactions
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="statement-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            key="statement-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed -bottom-7 left-0 right-0 z-50 max-h-[92vh] flex flex-col rounded-t-3xl shadow-2xl bg-white dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-neutral-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                  <FileUp size={20} className="text-violet-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Upload Statement
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    Import transactions from CSV, image, or text
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {/* Input Mode */}
              {!result && (
                <>
                  {/* File Upload */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 transition-colors group"
                  >
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText size={24} className="text-violet-500" />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <FileUp size={24} className="text-violet-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Upload Statement
                        </p>
                        <p className="text-xs text-gray-500 dark:text-neutral-500">
                          CSV, Image, or Screenshot • Max 15MB
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-neutral-600">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
                    OR
                    <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-800" />
                  </div>

                  {/* Text Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-wider">
                      Paste Statement Text / CSV
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={
                        "Date,Description,Amount,Type\n2024-01-15,Grocery Store,-500,Debit\n2024-01-16,Salary,50000,Credit"
                      }
                      rows={4}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none font-mono"
                    />
                  </div>

                  {/* Parse Button */}
                  <button
                    onClick={handleParse}
                    disabled={loading || (!file && !textInput.trim())}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Parsing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Parse with Gemini AI
                      </>
                    )}
                  </button>
                </>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <AlertCircle
                    size={18}
                    className="text-red-500 flex-shrink-0"
                  />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {"Something went wrong please try again later."}
                  </p>
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="space-y-4">
                  {/* Summary */}
                  {result.summary && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-900 text-center border border-gray-200 dark:border-neutral-800">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {displayedSummary.totalTransactions}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          Transactions
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 text-center border border-green-200 dark:border-green-800">
                        <p className="text-lg font-bold text-green-600">
                          ₹
                          {displayedSummary.totalIncome.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-green-600 uppercase tracking-wider">
                          Income
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-center border border-red-200 dark:border-red-800">
                        <p className="text-lg font-bold text-red-500">
                          ₹
                          {displayedSummary.totalExpense.toLocaleString(
                            "en-IN",
                          )}
                        </p>
                        <p className="text-[10px] text-red-500 uppercase tracking-wider">
                          Expense
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Select All Toggle */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {selectedCount}/{transactions.length} selected
                    </p>
                    <button
                      onClick={toggleAll}
                      className="text-xs font-medium text-violet-500 hover:text-violet-600 transition-colors"
                    >
                      {transactions.every((t) => t.selected)
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  {/* Transaction List */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {transactions.map((tx, i) => (
                      <div
                        key={i}
                        onClick={() => toggleTransaction(i)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          tx.selected
                            ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/20"
                            : "border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 opacity-60"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${tx.selected ? "bg-violet-500" : "border border-gray-300 dark:border-neutral-700"}`}
                        >
                          {tx.selected && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {tx.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-neutral-500">
                            {tx.category} • {tx.date}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-bold flex-shrink-0 ${tx.type === "INCOME" ? "text-green-500" : "text-red-500"}`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}₹
                          {tx.amount?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer — Import Button */}
            {result && selectedCount > 0 && (
              <div className="px-6 py-5 border-t border-gray-200 dark:border-neutral-800">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Import {selectedCount} Transaction
                      {selectedCount > 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.pdf,application/pdf,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

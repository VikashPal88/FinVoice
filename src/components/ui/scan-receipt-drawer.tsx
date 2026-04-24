"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

interface ScanReceiptDrawerProps {
  open: boolean;
  onClose: () => void;
  onTransactionParsed: (data: any) => void;
}

export function ScanReceiptDrawer({
  open,
  onClose,
  onTransactionParsed,
}: ScanReceiptDrawerProps) {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check authentication
  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600">Please sign in to scan receipts</p>
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

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    console.log("[SCAN_RECEIPT] Starting scan...");

    try {
      const formData = new FormData();
      formData.append("receipt", file);
      console.log("[SCAN_RECEIPT] File size:", file.size, "type:", file.type);

      const res = await fetch("/api/ai/scan-receipt", {
        method: "POST",
        body: formData,
      });

      console.log("[SCAN_RECEIPT] Response status:", res.status);
      const json = await res.json();
      console.log("[SCAN_RECEIPT] Response:", json);

      if (!res.ok) {
        const errorMsg =
          json.error || `HTTP ${res.status}: Failed to scan receipt`;
        console.error("[SCAN_RECEIPT] Error:", errorMsg);
        setError(errorMsg);
        return;
      }

      if (!json.success) {
        console.error("[SCAN_RECEIPT] API returned success=false");
        setError(json.error || "Failed to scan receipt");
        return;
      }

      console.log(
        "[SCAN_RECEIPT] Success! Transactions:",
        json.data?.transactions?.length || 0,
      );
      setResult(json.data);
    } catch (error) {
      console.error("[SCAN_RECEIPT] Exception:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseTransaction = (tx: any) => {
    onTransactionParsed({
      description: tx.description || "",
      amount: tx.amount?.toString() || "",
      category: tx.category || "Other",
      type: tx.type === "INCOME" ? "income" : "expense",
      date: tx.date || new Date().toISOString().split("T")[0],
    });
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scan-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            key="scan-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed -bottom-7 left-0 right-0 z-50 max-h-[90vh] flex flex-col rounded-t-3xl shadow-2xl bg-white dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-neutral-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                  <Camera size={20} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Scan Receipt
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    AI-powered receipt extraction
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
              {/* Upload Zone */}
              {!preview && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-10 text-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={28} className="text-orange-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Upload Receipt Photo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-500">
                    JPEG, PNG, or WebP • Max 10MB
                  </p>
                </div>
              )}

              {/* Preview */}
              {preview && (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="w-full max-h-[200px] object-contain rounded-xl border border-gray-200 dark:border-neutral-800"
                  />
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setResult(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 transition-colors"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              )}

              {/* Scan Button */}
              {preview && !result && (
                <button
                  onClick={handleScan}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Scan with Gemini AI
                    </>
                  )}
                </button>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <AlertCircle
                    size={18}
                    className="text-red-500 flex-shrink-0"
                  />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="space-y-4">
                  {/* Confidence */}
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Parsed with {result.confidence}% confidence
                    </span>
                  </div>

                  {/* Extracted Transactions */}
                  {result.transactions?.map((tx: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {tx.description}
                        </p>
                        <p className="text-sm font-bold text-red-500">
                          ₹{tx.amount?.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                      <button
                        onClick={() => handleUseTransaction(tx)}
                        className="w-full mt-2 py-2 rounded-lg bg-gray-900 dark:bg-blue-500 text-white text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check size={14} />
                        Use This Transaction
                      </button>
                    </div>
                  ))}

                  {result.transactions?.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Could not extract transactions from this receipt.
                    </p>
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

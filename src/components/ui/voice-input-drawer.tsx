"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  X,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  Volume2,
} from "lucide-react";

interface VoiceInputDrawerProps {
  open: boolean;
  onClose: () => void;
  onTransactionParsed: (data: any) => void;
}

export function VoiceInputDrawer({
  open,
  onClose,
  onTransactionParsed,
}: VoiceInputDrawerProps) {
  const { data: session, status } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Check authentication
  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600">Please sign in to use voice input</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(final || interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone access.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setResult(null);
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleParse = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    // Stop listening if still active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      const res = await fetch("/api/ai/voice-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcript.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to parse voice input");
        return;
      }

      setResult(json.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUse = () => {
    if (!result) return;
    onTransactionParsed({
      description: result.description || "",
      amount: result.amount?.toString() || "",
      category: result.category || "Other",
      type: result.type === "INCOME" ? "income" : "expense",
      date: result.date || new Date().toISOString().split("T")[0],
    });
    handleClose();
  };

  const handleClose = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setTranscript("");
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
            key="voice-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            key="voice-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed -bottom-7 left-0 right-0 z-50  flex flex-col rounded-t-3xl shadow-2xl bg-white dark:bg-neutral-950 border-t border-gray-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-neutral-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Mic size={20} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Voice Entry
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    Speak to add a transaction
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
              {!supported ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <AlertCircle
                    size={18}
                    className="text-amber-500 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Speech recognition not supported
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                      Use Chrome or Edge for voice input. You can still type
                      below.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mic Button */}
                  <div className="flex flex-col items-center gap-4">
                    <motion.button
                      onClick={toggleListening}
                      whileTap={{ scale: 0.95 }}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                        isListening
                          ? "bg-red-500 shadow-lg shadow-red-500/30 animate-pulse"
                          : "bg-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                      }`}
                    >
                      {isListening ? (
                        <MicOff size={36} className="text-white" />
                      ) : (
                        <Mic size={36} className="text-white" />
                      )}
                    </motion.button>
                    <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">
                      {isListening
                        ? "Listening... Tap to stop"
                        : "Tap to start speaking"}
                    </p>
                  </div>

                  {/* Live Waveform Visual */}
                  {isListening && (
                    <div className="flex items-center justify-center gap-1 py-2">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-blue-500 rounded-full"
                          animate={{
                            height: [8, 24, 8],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Example Phrases */}
                  {!transcript && !isListening && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-wider">
                        Try saying:
                      </p>
                      {[
                        "Spent 500 on groceries today",
                        "Received 50000 salary",
                        "Paid 2000 for electricity bill",
                        "Got 1500 from freelance work",
                      ].map((ex) => (
                        <button
                          key={ex}
                          onClick={() => setTranscript(ex)}
                          className="w-full text-left px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-neutral-900 text-sm text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors border border-gray-200 dark:border-neutral-800"
                        >
                          <Volume2
                            size={14}
                            className="inline mr-2 opacity-50"
                          />
                          &ldquo;{ex}&rdquo;
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Manual Input / Transcript */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-neutral-500 uppercase tracking-wider">
                  {transcript ? "Transcript" : "Or type manually"}
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="e.g. Spent 500 on groceries today"
                  rows={2}
                  className="w-full px-4 py-3 text-sm rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              {/* Parse Button */}
              {transcript && !result && (
                <button
                  onClick={handleParse}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
              )}

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

              {/* Result */}
              {result && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Parsed with {result.confidence}% confidence
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-neutral-500 mb-0.5">
                          Amount
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          ₹{result.amount?.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-neutral-500 mb-0.5">
                          Type
                        </p>
                        <p
                          className={`font-bold ${result.type === "INCOME" ? "text-green-500" : "text-red-500"}`}
                        >
                          {result.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-neutral-500 mb-0.5">
                          Category
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {result.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-neutral-500 mb-0.5">
                          Date
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {result.date}
                        </p>
                      </div>
                    </div>
                    {result.description && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-neutral-500 mb-0.5">
                          Description
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.description}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={handleUse}
                      className="w-full mt-2 py-2.5 rounded-xl bg-gray-900 dark:bg-blue-500 text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} />
                      Use This Transaction
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

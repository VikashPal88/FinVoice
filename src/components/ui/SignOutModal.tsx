'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignOutModal({ isOpen, onClose }: SignOutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm p-6 rounded-2xl border shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: 'var(--dropdown-bg)', borderColor: 'var(--glass-border)' }}
          >
            {/* Background Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-expense to-rose-400" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-expense/10 flex items-center justify-center mb-4">
                <LogOut size={28} className="text-expense" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">Sign Out</h3>
              <p className="text-sm text-[var(--muted)] mb-6">
                Are you sure you want to sign out of your account? Your unsaved changes might be lost.
              </p>
              
              <div className="flex w-full gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--surface-hover)] border"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={onClose} // Just hides it as requested
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-expense hover:bg-expense/90 transition-colors shadow-lg shadow-expense/25"
                >
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

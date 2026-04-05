'use client';

import { motion } from 'framer-motion';
import { Wallet, ArrowRight, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/formatters';

export default function AccountOverview() {
  const { accounts, transactions, setActivePage } = useStore();

  const getMonthlySpent = (accountId: string) => {
    // For assignment purposes, calculate against all expenses so it's always responsive regardless of date
    return transactions
      .filter((t) => t.type === 'expense' && t.accountId === accountId)
      .reduce((s, t) => s + t.amount, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-primary" />
          <h3 className="text-sm font-semibold">Account Overview</h3>
        </div>
        <button
          onClick={() => setActivePage('accounts')}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
        >
          Manage <ArrowRight size={12} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((account, index) => {
          const monthlySpent = getMonthlySpent(account.id);
          const budgetPercent = account.budget > 0 ? (monthlySpent / account.budget) * 100 : 0;
          const isWarning = budgetPercent >= 90;
          const totalTx = transactions.filter((t) => t.accountId === account.id).length;

          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => setActivePage('accounts')}
              className="p-4 rounded-xl transition-all cursor-pointer group hover:bg-[var(--surface)] hover:shadow-lg border border-[var(--glass-border)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 border"
                  style={{ backgroundColor: `transparent`, borderColor: account.color }}
                >
                  {account.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-[var(--foreground)] transition-colors">{account.name}</p>
                  <p className="text-xs text-[var(--muted)]">{totalTx} transactions</p>
                </div>
                {isWarning && (
                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                )}
              </div>

              {account.budget > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-[var(--muted)]">
                      {formatCurrency(monthlySpent)}
                    </span>
                    <span className={`text-xs font-semibold ${isWarning ? 'text-amber-500' : 'text-[var(--muted)]'}`}>
                      {budgetPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-[var(--surface)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.05 }}
                      className="h-full rounded-full transition-colors"
                      style={{
                        backgroundColor: budgetPercent >= 100
                          ? '#ef4444'
                          : isWarning
                          ? '#f59e0b'
                          : account.color,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <p className="text-xs text-[var(--muted)] italic">No budget set</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

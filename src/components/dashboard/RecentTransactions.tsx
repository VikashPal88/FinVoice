'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDateShort } from '@/utils/formatters';
import { CATEGORY_COLORS } from '@/data/mockData';
import Badge from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

export default function RecentTransactions() {
  const transactions = useStore((s) => s.transactions);
  const router = useRouter();

  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recent Transactions</h3>
        <button
          onClick={() => router.push('/transactions')}
          className="text-xs text-primary hover:text-primary-hover transition-colors"
        >
          View all →
        </button>
      </div>

      <div className="space-y-3">
        {recent.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[var(--surface-hover)]"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                }`}
            >
              {tx.type === 'income' ? (
                <ArrowUpRight size={18} className="text-income" />
              ) : (
                <ArrowDownRight size={18} className="text-expense" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-[var(--muted)]">
                  {formatDateShort(tx.date)}
                </span>
                <Badge color={CATEGORY_COLORS[tx.category]}>{tx.category}</Badge>
              </div>
            </div>

            <p
              className={`text-sm font-semibold flex-shrink-0 ${tx.type === 'income' ? 'text-income' : 'text-expense'
                }`}
            >
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

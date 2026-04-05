'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import TopCategories from '@/components/insights/TopCategories';
import MonthlyComparison from '@/components/insights/MonthlyComparison';
import SpendingInsights from '@/components/insights/SpendingInsights';
import ExpenseTrendChart from '@/components/insights/ExpenseTrendChart';

export default function InsightsPage() {
  const accounts = useStore((s) => s.accounts);
  const [accountId, setAccountId] = useState<string>('all');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Insights</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Deep dive into your financial habits and trends.
          </p>
        </div>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm border bg-[var(--surface)] text-[var(--foreground)] outline-none min-w-[200px]"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <option value="all">All Accounts</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>
          ))}
        </select>
      </div>

      <SpendingInsights accountId={accountId} />

      <ExpenseTrendChart accountId={accountId} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCategories accountId={accountId} />
        <MonthlyComparison accountId={accountId} />
      </div>
    </motion.div>
  );
}

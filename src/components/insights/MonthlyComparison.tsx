'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { getMonthlySummaries } from '@/utils/calculations';
import { formatCurrency, formatMonth } from '@/utils/formatters';

export default function MonthlyComparison({ accountId }: { accountId?: string }) {
  const allTransactions = useStore((s) => s.transactions);
  const transactions = accountId && accountId !== 'all' 
    ? allTransactions.filter(t => t.accountId === accountId)
    : allTransactions;

  const data = getMonthlySummaries(transactions).map((s) => ({
    ...s,
    monthLabel: formatMonth(s.month),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="glass-card-sm p-3 shadow-lg"
        style={{ backgroundColor: 'var(--dropdown-bg)' }}
      >
        <p className="text-xs font-medium mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[var(--muted)] capitalize">{entry.name}:</span>
            <span className="font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold">Monthly Income vs Expenses</h3>
        <span className="text-xs text-[var(--muted)]">6-month comparison</span>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-hover)' }} />
            <Bar
              dataKey="income"
              name="Income"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
              barSize={24}
              fillOpacity={0.85}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#ef4444"
              radius={[6, 6, 0, 0]}
              barSize={24}
              fillOpacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <div className="w-3 h-3 rounded bg-income" />
          Income
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <div className="w-3 h-3 rounded bg-expense" />
          Expenses
        </div>
      </div>
    </motion.div>
  );
}

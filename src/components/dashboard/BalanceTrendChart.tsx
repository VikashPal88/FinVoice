'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { getMonthlySummaries } from '@/utils/calculations';
import { formatCurrency, formatMonth } from '@/utils/formatters';

export default function BalanceTrendChart() {
  const transactions = useStore((s) => s.transactions);
  const theme = useStore((s) => s.theme);
  const summaries = getMonthlySummaries(transactions);

  const data = summaries.map((s) => ({
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
      transition={{ delay: 0.3 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold">Balance Trend</h3>
        <span className="text-xs text-[var(--muted)]">Last 6 months</span>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 12, fill: 'var(--muted)' }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#incomeGradient)"
              dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#expenseGradient)"
              dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <div className="w-3 h-0.5 bg-income rounded" />
          Income
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <div className="w-3 h-0.5 bg-expense rounded" />
          Expenses
        </div>
      </div>
    </motion.div>
  );
}

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
  Cell,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { getCategoryBreakdown } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';

export default function TopCategories({ accountId }: { accountId?: string }) {
  const allTransactions = useStore((s) => s.transactions);
  const transactions = accountId && accountId !== 'all' 
    ? allTransactions.filter(t => t.accountId === accountId)
    : allTransactions;

  const breakdown = getCategoryBreakdown(transactions, 'expense').slice(0, 5);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div
        className="glass-card-sm p-3 shadow-lg"
        style={{ backgroundColor: 'var(--dropdown-bg)' }}
      >
        <p className="text-xs font-medium">{data.category}</p>
        <p className="text-sm font-bold mt-1">{formatCurrency(data.amount)}</p>
        <p className="text-xs text-[var(--muted)]">{data.percentage.toFixed(1)}% of expenses</p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold">Top Spending Categories</h3>
        <span className="text-xs text-[var(--muted)]">By total amount</span>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={breakdown}
            layout="vertical"
            margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 11, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-hover)' }} />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={20}>
              {breakdown.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

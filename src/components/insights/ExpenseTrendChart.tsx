'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatMonth } from '@/utils/formatters';
import { getMonthlySummaries } from '@/utils/calculations';

export default function ExpenseTrendChart({ accountId }: { accountId?: string }) {
  const allTransactions = useStore((s) => s.transactions);
  const transactions = accountId && accountId !== 'all' 
    ? allTransactions.filter(t => t.accountId === accountId)
    : allTransactions;

  const data = getMonthlySummaries(transactions)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(s => ({
      name: formatMonth(s.month),
      expenses: s.expenses,
      income: s.income
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card-sm p-3 border" style={{ borderColor: 'var(--glass-border)' }}>
        <p className="text-xs font-semibold mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[var(--muted)]">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-4 sm:p-6 lg:col-span-2"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Financial Trend</h2>
        <p className="text-sm text-[var(--muted)]">Income and expenses over time</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: 'var(--muted)' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: 'var(--muted)' }} 
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--glass-border)' }} />
            <Line 
              type="Monotone" 
              dataKey="expenses" 
              name="Expenses"
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: 'var(--surface)' }}
              activeDot={{ r: 6, fill: '#ef4444', strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              name="Income"
              stroke="#22c55e" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: 'var(--surface)' }}
              activeDot={{ r: 6, fill: '#22c55e', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

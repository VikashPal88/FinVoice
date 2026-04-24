'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/formatters';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekdaySpendingPattern({ accountId }: { accountId?: string }) {
  const allTransactions = useStore((state) => state.transactions);
  const transactions =
    accountId && accountId !== 'all'
      ? allTransactions.filter((transaction) => transaction.accountId === accountId)
      : allTransactions;

  const expenseTransactions = transactions.filter((transaction) => transaction.type === 'expense');

  const weekdayTotals = WEEKDAY_LABELS.map((day) => ({
    day,
    amount: 0,
    count: 0,
  }));

  for (const transaction of expenseTransactions) {
    const weekdayIndex = new Date(transaction.date).getDay();
    weekdayTotals[weekdayIndex].amount += transaction.amount;
    weekdayTotals[weekdayIndex].count += 1;
  }

  const chartData = weekdayTotals.map((entry) => ({
    ...entry,
    average: entry.count > 0 ? entry.amount / entry.count : 0,
  }));

  const strongestDay = [...chartData].sort((a, b) => b.amount - a.amount)[0];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;

    return (
      <div className="glass-card-sm p-3 border" style={{ borderColor: 'var(--glass-border)' }}>
        <p className="text-xs font-semibold mb-2">{data.day}</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--muted)]">Total spent</span>
            <span className="font-semibold text-[var(--foreground)]">{formatCurrency(data.amount)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--muted)]">Transactions</span>
            <span className="font-semibold text-[var(--foreground)]">{data.count}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--muted)]">Avg. spend</span>
            <span className="font-semibold text-[var(--foreground)]">{formatCurrency(data.average)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-semibold">Weekly Spending Pattern</h3>
          <p className="text-xs text-[var(--muted)]">See which weekdays absorb the most expense</p>
        </div>
        <div className="rounded-xl bg-primary/10 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Highest Day</p>
          <p className="text-sm font-semibold text-primary">{strongestDay?.day || 'N/A'}</p>
        </div>
      </div>

      <div className="h-[320px]">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <RadarChart data={chartData} outerRadius="72%">
              <PolarGrid stroke="var(--glass-border)" />
              <PolarAngleAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
              />
              <PolarRadiusAxis
                tick={{ fontSize: 10, fill: 'var(--muted)' }}
                axisLine={false}
                tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Spending"
                dataKey="amount"
                stroke="#F97316"
                fill="#F97316"
                fillOpacity={0.28}
                strokeWidth={2.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { getCategoryBreakdown } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';

export default function SpendingBreakdown() {
  const transactions = useStore((s) => s.transactions);
  const breakdown = getCategoryBreakdown(transactions);
  const top6 = breakdown.slice(0, 6);

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
        <p className="text-xs text-[var(--muted)]">{data.percentage.toFixed(1)}% of total</p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold">Spending Breakdown</h3>
        <span className="text-xs text-[var(--muted)]">By category</span>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={top6}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="amount"
                paddingAngle={3}
                stroke="none"
              >
                {top6.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 w-full space-y-2">
          {top6.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-[var(--muted)] flex-1 truncate">
                {item.category}
              </span>
              <span className="text-xs font-medium">{formatCurrency(item.amount)}</span>
              <span className="text-[10px] text-[var(--muted)] w-10 text-right">
                {item.percentage.toFixed(0)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

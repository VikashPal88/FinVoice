'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { calculateTotalIncome, calculateTotalExpenses, calculateBalance, calculateSavingsRate } from '@/utils/calculations';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

export default function SummaryCards() {
  const transactions = useStore((s) => s.transactions);

  const totalBalance = calculateBalance(transactions);
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const savingsRate = calculateSavingsRate(transactions);

  const cards = [
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      icon: <Wallet size={22} />,
      trend: totalBalance >= 0 ? '+' : '',
      trendColor: totalBalance >= 0 ? 'text-income' : 'text-expense',
      gradient: 'from-indigo-500/20 to-purple-500/20',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-400',
      border: 'border-indigo-500/20',
    },
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: <ArrowUpRight size={22} />,
      subtitle: `${transactions.filter((t) => t.type === 'income').length} transactions`,
      trendColor: 'text-income',
      gradient: 'from-emerald-500/20 to-green-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: <ArrowDownRight size={22} />,
      subtitle: `${transactions.filter((t) => t.type === 'expense').length} transactions`,
      trendColor: 'text-expense',
      gradient: 'from-rose-500/20 to-red-500/20',
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-400',
      border: 'border-rose-500/20',
    },
    {
      title: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      icon: <PiggyBank size={22} />,
      subtitle: savingsRate >= 20 ? 'Healthy savings' : 'Could improve',
      trendColor: savingsRate >= 20 ? 'text-income' : 'text-amber-400',
      gradient: 'from-violet-500/20 to-fuchsia-500/20',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
      border: 'border-violet-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className={`glass-card p-5 relative overflow-hidden ${card.border}`}
        >
          {/* Background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className={`text-2xl font-bold ${card.trendColor}`}>{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-[var(--muted)]">{card.subtitle}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

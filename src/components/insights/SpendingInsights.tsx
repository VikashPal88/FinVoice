'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Calendar,
  Banknote,
  Scale,
  Activity,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  getMonthlySummaries,
  getHighestSpendingCategory,
  getAverageDailySpend,
  getIncomeExpenseRatio,
  getSpendingTrend,
  getMonthWithHighestExpense,
  getMonthlyChange,
  calculateTotalIncome,
  calculateTotalExpenses,
} from '@/utils/calculations';
import { formatCurrency, formatMonth } from '@/utils/formatters';

export default function SpendingInsights({ accountId }: { accountId?: string }) {
  const allTransactions = useStore((s) => s.transactions);
  const transactions = accountId && accountId !== 'all' 
    ? allTransactions.filter(t => t.accountId === accountId)
    : allTransactions;
    
  const summaries = getMonthlySummaries(transactions);
  const highestCategory = getHighestSpendingCategory(transactions);
  const avgDailySpend = getAverageDailySpend(transactions);
  const ratio = getIncomeExpenseRatio(transactions);
  const trend = getSpendingTrend(summaries);
  const highestMonth = getMonthWithHighestExpense(summaries);
  const monthlyChange = getMonthlyChange(summaries);
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);

  const trendIcon = {
    increasing: <TrendingUp size={20} className="text-expense" />,
    decreasing: <TrendingDown size={20} className="text-income" />,
    stable: <Minus size={20} className="text-amber-400" />,
  };

  const trendLabel = {
    increasing: 'Increasing',
    decreasing: 'Decreasing',
    stable: 'Stable',
  };

  const trendColor = {
    increasing: 'text-expense',
    decreasing: 'text-income',
    stable: 'text-amber-400',
  };

  const insights = [
    {
      title: 'Highest Spending Category',
      value: highestCategory?.category || 'N/A',
      subtitle: highestCategory ? formatCurrency(highestCategory.amount) : '',
      icon: <Crown size={20} className="text-amber-400" />,
      gradient: 'from-amber-500/10 to-orange-500/10',
    },
    {
      title: 'Average Daily Spend',
      value: formatCurrency(Math.round(avgDailySpend)),
      subtitle: 'Across all expense categories',
      icon: <Banknote size={20} className="text-emerald-400" />,
      gradient: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      title: 'Income : Expense Ratio',
      value: `${ratio.toFixed(2)}x`,
      subtitle: ratio >= 1.5 ? 'Healthy ratio ✨' : ratio >= 1 ? 'Room to improve' : 'Spending exceeds income ⚠️',
      icon: <Scale size={20} className="text-blue-400" />,
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      title: 'Spending Trend',
      value: trendLabel[trend],
      subtitle: `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(1)}% vs last month`,
      icon: trendIcon[trend],
      gradient: trend === 'decreasing' ? 'from-green-500/10 to-emerald-500/10' : trend === 'increasing' ? 'from-rose-500/10 to-red-500/10' : 'from-amber-500/10 to-yellow-500/10',
      valueColor: trendColor[trend],
    },
    {
      title: 'Highest Expense Month',
      value: highestMonth ? formatMonth(highestMonth.month) : 'N/A',
      subtitle: highestMonth ? formatCurrency(highestMonth.amount) : '',
      icon: <Calendar size={20} className="text-violet-400" />,
      gradient: 'from-violet-500/10 to-purple-500/10',
    },
    {
      title: 'Total Transactions',
      value: transactions.length.toString(),
      subtitle: `${transactions.filter((t) => t.type === 'income').length} income · ${transactions.filter((t) => t.type === 'expense').length} expense`,
      icon: <Activity size={20} className="text-indigo-400" />,
      gradient: 'from-indigo-500/10 to-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight, i) => (
        <motion.div
          key={insight.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="glass-card p-5 relative overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${insight.gradient} opacity-50`} />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                {insight.title}
              </span>
              <div className="p-2 rounded-xl bg-[var(--surface)]">
                {insight.icon}
              </div>
            </div>
            <div>
              <p className={`text-xl font-bold ${'valueColor' in insight ? insight.valueColor : ''}`}>
                {insight.value}
              </p>
              {insight.subtitle && (
                <p className="text-xs text-[var(--muted)] mt-0.5">{insight.subtitle}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

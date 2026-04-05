import { Transaction, MonthlySummary, CategoryBreakdown } from '@/types';
import { CATEGORY_COLORS } from '@/data/mockData';

export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateBalance(transactions: Transaction[]): number {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
}

export function calculateSavingsRate(transactions: Transaction[]): number {
  const income = calculateTotalIncome(transactions);
  if (income === 0) return 0;
  const expenses = calculateTotalExpenses(transactions);
  return ((income - expenses) / income) * 100;
}

export function getMonthlySummaries(transactions: Transaction[]): MonthlySummary[] {
  const map = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((t) => {
    const month = t.date.substring(0, 7); // YYYY-MM
    const existing = map.get(month) || { income: 0, expenses: 0 };
    if (t.type === 'income') {
      existing.income += t.amount;
    } else {
      existing.expenses += t.amount;
    }
    map.set(month, existing);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses,
    }));
}

export function getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);
  const map = new Map<string, number>();

  expenses.forEach((t) => {
    map.set(t.category, (map.get(t.category) || 0) + t.amount);
  });

  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: CATEGORY_COLORS[category] || '#6b7280',
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getHighestSpendingCategory(transactions: Transaction[]): { category: string; amount: number } | null {
  const breakdown = getCategoryBreakdown(transactions);
  return breakdown.length > 0 ? { category: breakdown[0].category, amount: breakdown[0].amount } : null;
}

export function getMonthlyChange(summaries: MonthlySummary[]): number {
  if (summaries.length < 2) return 0;
  const current = summaries[summaries.length - 1].expenses;
  const previous = summaries[summaries.length - 2].expenses;
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function getAverageDailySpend(transactions: Transaction[]): number {
  const expenses = transactions.filter((t) => t.type === 'expense');
  if (expenses.length === 0) return 0;

  const dates = expenses.map((t) => new Date(t.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const days = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);
  return total / days;
}

export function getIncomeExpenseRatio(transactions: Transaction[]): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  if (expenses === 0) return 0;
  return income / expenses;
}

export function getSpendingTrend(summaries: MonthlySummary[]): 'increasing' | 'decreasing' | 'stable' {
  if (summaries.length < 3) return 'stable';
  const last3 = summaries.slice(-3).map((s) => s.expenses);
  const isIncreasing = last3[2] > last3[1] && last3[1] > last3[0];
  const isDecreasing = last3[2] < last3[1] && last3[1] < last3[0];
  if (isIncreasing) return 'increasing';
  if (isDecreasing) return 'decreasing';
  return 'stable';
}

export function getMonthWithHighestExpense(summaries: MonthlySummary[]): { month: string; amount: number } | null {
  if (summaries.length === 0) return null;
  const max = summaries.reduce((prev, curr) => (curr.expenses > prev.expenses ? curr : prev));
  return { month: max.month, amount: max.expenses };
}

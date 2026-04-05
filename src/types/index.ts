export type TransactionType = 'income' | 'expense';

export type Category = string;

export interface CustomCategory {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: Category;
  type: TransactionType;
  accountId: string;
}

export type Role = 'admin' | 'viewer';
export type Theme = 'dark' | 'light';
export type SortField = 'date' | 'amount' | 'category';
export type SortOrder = 'asc' | 'desc';
export type PageName = 'dashboard' | 'transactions' | 'insights' | 'accounts' | 'settings';

export interface Filters {
  search: string;
  category: Category | 'all';
  type: TransactionType | 'all';
  sortBy: SortField;
  sortOrder: SortOrder;
  accountId: string | 'all';
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
  isDefault: boolean;
}

export interface BudgetAlert {
  id: string;
  accountId: string;
  accountName: string;
  budget: number;
  spent: number;
  percentage: number;
  timestamp: string;
  dismissed: boolean;
}

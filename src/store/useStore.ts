import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Role, Theme, Filters, PageName, Account, BudgetAlert, CustomCategory, TransactionType } from '@/types';
import { defaultTransactions, defaultAccounts, EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_COLORS } from '@/data/mockData';
import { generateId } from '@/utils/formatters';

const initialCategories: CustomCategory[] = [
  ...EXPENSE_CATEGORIES.map((c) => ({ id: `cat-${c}`, name: c, type: 'expense' as TransactionType, color: CATEGORY_COLORS[c] || '#6b7280' })),
  ...INCOME_CATEGORIES.map((c) => ({ id: `cat-${c}`, name: c, type: 'income' as TransactionType, color: CATEGORY_COLORS[c] || '#6b7280' })),
];

interface AppState {
  // Data
  transactions: Transaction[];
  accounts: Account[];
  budgetAlerts: BudgetAlert[];
  categories: CustomCategory[];
  
  // UI State
  role: Role;
  theme: Theme;
  sidebarOpen: boolean;
  
  // Filters
  filters: Filters;
  
  // Actions
  setRole: (role: Role) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Filter Actions
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  
  // Transaction Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Account Actions
  addAccount: (account: Omit<Account, 'id'>) => void;
  editAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  setAccountBudget: (id: string, budget: number) => void;
  setDefaultAccount: (id: string) => void;

  // Category Actions
  addCategory: (category: Omit<CustomCategory, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Budget Alert Actions
  addBudgetAlert: (alert: Omit<BudgetAlert, 'id'>) => void;
  dismissBudgetAlert: (id: string) => void;
  clearAllAlerts: () => void;

  // Computed helper
  checkBudgetAlerts: () => void;
}

const defaultFilters: Filters = {
  search: '',
  category: 'all',
  type: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
  accountId: 'all',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      transactions: defaultTransactions,
      accounts: defaultAccounts,
      budgetAlerts: [],
      categories: initialCategories,
      role: 'admin',
      theme: 'dark',
      sidebarOpen: true,
      filters: defaultFilters,
      
      // UI Actions
      setRole: (role) => set({ role }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Filter Actions
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
      
      // Transaction Actions
      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [
            { ...transaction, id: generateId() },
            ...state.transactions,
          ],
        }));
        // Check budget after adding transaction
        setTimeout(() => get().checkBudgetAlerts(), 0);
      },
      editTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
        setTimeout(() => get().checkBudgetAlerts(), 0);
      },
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        setTimeout(() => get().checkBudgetAlerts(), 0);
      },

      // Account Actions
      addAccount: (account) =>
        set((state) => ({
          accounts: [
            ...state.accounts,
            { ...account, id: `acc-${generateId()}` },
          ],
        })),
      editAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),
      deleteAccount: (id) =>
        set((state) => {
          const account = state.accounts.find((a) => a.id === id);
          if (account?.isDefault) return state; // Can't delete default account
          // Move transactions from deleted account to default
          const defaultAcc = state.accounts.find((a) => a.isDefault);
          return {
            accounts: state.accounts.filter((a) => a.id !== id),
            transactions: state.transactions.map((t) =>
              t.accountId === id ? { ...t, accountId: defaultAcc?.id || 'acc-main' } : t
            ),
          };
        }),
      setAccountBudget: (id, budget) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, budget } : a
          ),
        })),
      setDefaultAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        })),

      // Category Actions
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, { ...category, id: `cat-${generateId()}` }],
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      // Budget Alert Actions
      addBudgetAlert: (alert) =>
        set((state) => ({
          budgetAlerts: [
            { ...alert, id: generateId() },
            ...state.budgetAlerts,
          ],
        })),
      dismissBudgetAlert: (id) =>
        set((state) => ({
          budgetAlerts: state.budgetAlerts.map((a) =>
            a.id === id ? { ...a, dismissed: true } : a
          ),
        })),
      clearAllAlerts: () => set({ budgetAlerts: [] }),

      // Check if any account budget crosses 90%
      checkBudgetAlerts: () => {
        const state = get();
        const currentMonth = new Date().toISOString().substring(0, 7);
        
        state.accounts.forEach((account) => {
          if (account.budget <= 0) return;
          
          const monthlyExpenses = state.transactions
            .filter(
              (t) =>
                t.type === 'expense' &&
                t.accountId === account.id &&
                t.date.substring(0, 7) === currentMonth
            )
            .reduce((sum, t) => sum + t.amount, 0);

          const percentage = (monthlyExpenses / account.budget) * 100;
          
          if (percentage >= 90) {
            // Check if alert already exists for this account this month
            const existingAlert = state.budgetAlerts.find(
              (a) =>
                a.accountId === account.id &&
                a.timestamp.substring(0, 7) === currentMonth &&
                !a.dismissed
            );
            
            if (!existingAlert) {
              set((s) => ({
                budgetAlerts: [
                  {
                    id: generateId(),
                    accountId: account.id,
                    accountName: account.name,
                    budget: account.budget,
                    spent: monthlyExpenses,
                    percentage,
                    timestamp: new Date().toISOString(),
                    dismissed: false,
                  },
                  ...s.budgetAlerts,
                ],
              }));
            }
          }
        });
      },
    }),
    {
      name: 'finance-dashboard-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        accounts: state.accounts,
        budgetAlerts: state.budgetAlerts,
        categories: state.categories,
        role: state.role,
        theme: state.theme,
      }),
    }
  )
);

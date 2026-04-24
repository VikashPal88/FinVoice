import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, Theme, Filters, Transaction, Account, CustomCategory, BudgetAlert, TransactionType } from '@/types';
import { generateId } from '@/utils/formatters';

// ─── Auth State ──────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
  is_admin: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));

// ─── App UI & Minimal Data Store ─────────────────────────────────────────────

interface AppStoreState {
  // UI State
  theme: Theme;
  sidebarOpen: boolean;
  isMobileNavOpen: boolean;

  // Filters
  filters: Filters;

  // Data (Minimal - will be populated from APIs)
  transactions: Transaction[];
  accounts: Account[];
  categories: CustomCategory[];
  budgetAlerts: BudgetAlert[];

  // UI Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setIsMobileNavOpen: (open: boolean) => void;

  // Filter Actions
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;

  // Data Setters (from API responses - Bulk)
  setTransactions: (transactions: Transaction[]) => void;
  setAccounts: (accounts: Account[]) => void;
  setCategories: (categories: CustomCategory[]) => void;
  setBudgetAlerts: (alerts: BudgetAlert[]) => void;

  // Reset Store
  resetStore: () => void;

  // Legacy temporary actions (Left here so components don't crash before API integration)
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  editAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  setAccountBudget: (id: string, budget: number) => void;
  setDefaultAccount: (id: string) => void;
  addCategory: (category: Omit<CustomCategory, 'id'>) => void;
  deleteCategory: (id: string) => void;
  dismissBudgetAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

const defaultFilters: Filters = {
  search: '',
  category: 'all',
  type: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
  accountId: 'all',
};

// Aliased as useStore to match existing component imports safely
export const useStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      // Initial State
      theme: 'dark',
      sidebarOpen: true,
      isMobileNavOpen: false,
      filters: defaultFilters,

      transactions: [],
      accounts: [],
      categories: [],
      budgetAlerts: [],

      // UI Actions
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setIsMobileNavOpen: (open) => set({ isMobileNavOpen: open }),

      // Filter Actions
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),

      // Data Setters (Call these after successful API calls)
      setTransactions: (transactions) => set({ transactions }),
      setAccounts: (accounts) => set({ accounts }),
      setCategories: (categories) => set({ categories }),
      setBudgetAlerts: (budgetAlerts) => set({ budgetAlerts }),

      // Full Reset
      resetStore: () =>
        set({
          transactions: [],
          accounts: [],
          categories: [],
          budgetAlerts: [],
          filters: defaultFilters,
        }),

      // Legacy stub actions to prevent TS compilation errors in old components
      addTransaction: (transaction) => set((s) => ({ transactions: [{ ...transaction, id: generateId() }, ...s.transactions] })),
      editTransaction: (id, updates) => set((s) => ({ transactions: s.transactions.map((t) => t.id === id ? { ...t, ...updates } : t) })),
      deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      addAccount: (account) => set((s) => ({ accounts: [...s.accounts, { ...account, id: `acc-${generateId()}` }] })),
      editAccount: (id, updates) => set((s) => ({ accounts: s.accounts.map((a) => a.id === id ? { ...a, ...updates } : a) })),
      deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),
      setAccountBudget: (id, budget) => set((s) => ({ accounts: s.accounts.map((a) => a.id === id ? { ...a, budget } : a) })),
      setDefaultAccount: (id) => set((s) => ({ accounts: s.accounts.map((a) => ({ ...a, isDefault: a.id === id })) })),
      addCategory: (category) => set((s) => ({ categories: [...s.categories, { ...category, id: `cat-${generateId()}` }] })),
      deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
      dismissBudgetAlert: (id) => set((s) => ({ budgetAlerts: s.budgetAlerts.map((a) => a.id === id ? { ...a, dismissed: true } : a) })),
      clearAllAlerts: () => set({ budgetAlerts: [] }),
    }),
    {
      name: 'finance-app-storage',
      partialize: (state) => ({
        // Only persist UI preferences, not heavy data
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        filters: state.filters,
      }),
    }
  )
);

// Add the alias they requested (useAppStore) so their manual edits don't break either
export const useAppStore = useStore;
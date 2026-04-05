'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Wallet,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  X,
  Check,
  Star,
  Mail,
  Bell,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Account } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { ACCOUNT_ICONS, ACCOUNT_COLORS } from '@/data/mockData';
import EmptyState from '@/components/ui/EmptyState';

export default function AccountsPage() {
  const { accounts, transactions, addAccount, editAccount, deleteAccount, role, budgetAlerts, dismissBudgetAlert, setDefaultAccount } = useStore();
  const isAdmin = role === 'admin';
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form, setForm] = useState({
    name: '',
    icon: '💰',
    color: '#6366f1',
    budget: '',
  });

  const activeAlerts = budgetAlerts.filter((a) => !a.dismissed);

  const openCreate = () => {
    setEditingAccount(null);
    setForm({ name: '', icon: '💰', color: '#6366f1', budget: '' });
    setShowModal(true);
  };

  const openEdit = (account: Account) => {
    setEditingAccount(account);
    setForm({
      name: account.name,
      icon: account.icon,
      color: account.color,
      budget: account.budget.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      icon: form.icon,
      color: form.color,
      budget: parseFloat(form.budget) || 0,
      isDefault: false,
    };

    if (editingAccount) {
      editAccount(editingAccount.id, data);
    } else {
      addAccount(data);
    }
    setShowModal(false);
  };

  const getAccountStats = (accountId: string) => {
    const accountTxs = transactions.filter((t) => t.accountId === accountId);
    const income = accountTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = accountTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const txCount = accountTxs.length;
    return { income, expenses, balance: income - expenses, txCount };
  };

  const getMonthlySpent = (accountId: string) => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return transactions
      .filter((t) => t.type === 'expense' && t.accountId === accountId && t.date.substring(0, 7) === currentMonth)
      .reduce((s, t) => s + t.amount, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Budget Alerts Banner */}
      <AnimatePresence>
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {activeAlerts.map((alert) => {
              const isOver = alert.percentage >= 100;
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`glass-card p-4 border-l-4 ${isOver ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500 bg-amber-500/5'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isOver ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                      {isOver ? (
                        <AlertTriangle size={18} className="text-red-400" />
                      ) : (
                        <Bell size={18} className="text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-semibold ${isOver ? 'text-red-400' : 'text-amber-400'}`}>
                          {isOver ? '🚨 Budget Exceeded!' : '⚠️ Budget Alert — 90% Reached'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--surface)]">
                          {alert.accountName}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted)]">
                        You&apos;ve spent <span className="font-semibold text-[var(--foreground)]">{formatCurrency(alert.spent)}</span> of your{' '}
                        <span className="font-semibold text-[var(--foreground)]">{formatCurrency(alert.budget)}</span> budget ({alert.percentage.toFixed(1)}%).
                        {isOver
                          ? ' Consider reviewing your expenses to stay on track.'
                          : ' You are close to your budget limit this month.'}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                          <Mail size={12} />
                          <span>Email alert would be sent to your registered email</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissBudgetAlert(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <X size={14} className="text-[var(--muted)]" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage your financial accounts and budgets. Create separate accounts for different uses.
          </p>
        </div>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
          >
            <Plus size={16} />
            New Account
          </motion.button>
        )}
      </div>

      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs"
        >
          <span>👁️</span>
          <span>You are in <strong>Viewer</strong> mode. Switch to Admin to manage accounts.</span>
        </motion.div>
      )}

      {/* Account Cards Grid */}
      {accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          description="Create your first account to start tracking expenses by category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {accounts.map((account, index) => {
            const stats = getAccountStats(account.id);
            const monthlySpent = getMonthlySpent(account.id);
            const budgetPercent = account.budget > 0 ? (monthlySpent / account.budget) * 100 : 0;
            const isWarning = budgetPercent >= 90;
            const isOver = budgetPercent >= 100;

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="glass-card p-5 relative overflow-hidden group"
              >
                {/* Gradient accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: account.color }}
                />

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${account.color}15` }}
                    >
                      {account.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{account.name}</h3>
                        {account.isDefault && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-primary/10 text-primary">
                            <Star size={8} /> DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted)]">{stats.txCount} transactions</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {isAdmin && !account.isDefault && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDefaultAccount(account.id)}
                        className="px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/10 text-primary transition-colors whitespace-nowrap hidden sm:block"
                        title="Set as Default Account"
                      >
                        Make Default
                      </button>
                      <button
                        onClick={() => openEdit(account)}
                        className="p-1.5 rounded-lg hover:bg-[var(--surface)] transition-colors"
                        title="Edit Account"
                      >
                        <Pencil size={13} className="text-[var(--muted)]" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${account.name}" account? Transactions will be moved to your default account.`)) {
                            deleteAccount(account.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-expense/10 transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 size={13} className="text-expense" />
                      </button>
                    </div>
                  )}
                  {isAdmin && account.isDefault && (
                    <button
                      onClick={() => openEdit(account)}
                      className="p-1.5 rounded-lg hover:bg-[var(--surface)] opacity-0 group-hover:opacity-100 transition-all"
                      title="Edit Budget"
                    >
                      <Pencil size={13} className="text-[var(--muted)]" />
                    </button>
                  )}
                </div>

                {/* Balance */}
                <div className="mb-4">
                  <p className="text-xs text-[var(--muted)] mb-0.5">Account Balance</p>
                  <p className={`text-xl font-bold ${stats.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                    {formatCurrency(stats.balance)}
                  </p>
                </div>

                {/* Income / Expense Row */}
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-income/10 flex items-center justify-center">
                      <TrendingUp size={12} className="text-income" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted)]">Income</p>
                      <p className="text-xs font-semibold text-income">+{formatCurrency(stats.income)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-expense/10 flex items-center justify-center">
                      <TrendingDown size={12} className="text-expense" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted)]">Expenses</p>
                      <p className="text-xs font-semibold text-expense">-{formatCurrency(stats.expenses)}</p>
                    </div>
                  </div>
                </div>

                {/* Budget Progress */}
                {account.budget > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Monthly Budget
                      </p>
                      <p className={`text-xs font-bold ${isOver ? 'text-expense' : isWarning ? 'text-amber-400' : 'text-income'}`}>
                        {formatCurrency(monthlySpent)} / {formatCurrency(account.budget)}
                      </p>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--surface)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                        className="h-full rounded-full transition-colors"
                        style={{
                          backgroundColor: isOver
                            ? '#ef4444'
                            : isWarning
                              ? '#f59e0b'
                              : account.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-[var(--muted)]">
                        {budgetPercent.toFixed(0)}% used this month
                      </p>
                      {isWarning && (
                        <p className={`text-[10px] font-semibold ${isOver ? 'text-expense' : 'text-amber-400'}`}>
                          {isOver ? '⚠️ Over budget' : '⚠️ Near limit'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Account Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md p-6"
              style={{ backgroundColor: 'var(--dropdown-bg)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingAccount ? 'Edit Account' : 'Create Account'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Account Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)]">Account Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Food & Dining"
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                {/* Icon Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)]">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ACCOUNT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setForm({ ...form, icon })}
                        className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${form.icon === icon
                            ? 'bg-primary/20 ring-2 ring-primary scale-110'
                            : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)]'
                          }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)]">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {ACCOUNT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, color })}
                        className={`w-8 h-8 rounded-lg transition-all ${form.color === color ? 'ring-2 ring-white scale-110' : ''
                          }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Monthly Budget */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)]">Monthly Budget (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="e.g., 5000 (0 for no budget)"
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                  />
                  <p className="text-[10px] text-[var(--muted)]">
                    You&apos;ll receive an alert when 90% of the budget is used. Set to 0 for no budget tracking.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
                >
                  {editingAccount ? 'Save Changes' : 'Create Account'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

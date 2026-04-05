'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Transaction, TransactionType, Category } from '@/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/mockData';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

// Simple custom calendar component
function MiniCalendar({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const [viewing, setViewing] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const daysInMonth = new Date(viewing.year, viewing.month + 1, 0).getDate();
  const firstDay = new Date(viewing.year, viewing.month, 1).getDay();
  const today = new Date().toISOString().split('T')[0];
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => {
    setViewing((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 };
      return { ...v, month: v.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewing((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 };
      return { ...v, month: v.month + 1 };
    });
  };

  const selectDay = (day: number) => {
    const m = String(viewing.month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewing.year}-${m}-${d}`);
  };

  const selectedStr = value;

  return (
    <div className="rounded-xl border bg-[var(--surface)] p-3 absolute z-10 w-full mt-2 shadow-xl" style={{ borderColor: 'var(--glass-border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
          <ChevronLeft size={16} className="text-[var(--muted)]" />
        </button>
        <span className="text-xs font-semibold">
          {monthNames[viewing.month]} {viewing.year}
        </span>
        <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
          <ChevronRight size={16} className="text-[var(--muted)]" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-[9px] font-semibold text-[var(--muted)] uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const m = String(viewing.month + 1).padStart(2, '0');
          const d = String(day).padStart(2, '0');
          const dateStr = `${viewing.year}-${m}-${d}`;
          const isSelected = dateStr === selectedStr;
          const isToday = dateStr === today;

          return (
            <button
              key={day}
              type="button"
              onClick={() => selectDay(day)}
              className={`w-full aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
                isSelected
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : isToday
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-[var(--surface-hover)] text-[var(--foreground)]'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TransactionModal({ isOpen, onClose, editTransaction }: TransactionModalProps) {
  const { addTransaction, editTransaction: updateTransaction, accounts, categories: allCategories } = useStore();
  const isEdit = !!editTransaction;

  const defaultAccount = accounts.find((a) => a.isDefault);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Food & Dining' as Category,
    type: 'expense' as TransactionType,
    date: new Date().toISOString().split('T')[0],
    accountId: defaultAccount?.id || 'acc-main',
  });

  const [showCalendar, setShowCalendar] = useState(false);

  // Close calendar if clicking outside could be added, but user wants toggle to close on select
  const currentCategories = allCategories.filter(c => c.type === form.type);

  useEffect(() => {
    if (editTransaction) {
      setForm({
        description: editTransaction.description,
        amount: editTransaction.amount.toString(),
        category: editTransaction.category,
        type: editTransaction.type,
        date: editTransaction.date,
        accountId: editTransaction.accountId || defaultAccount?.id || 'acc-main',
      });
    } else {
      setForm({
        description: '',
        amount: '',
        category: currentCategories.length > 0 ? currentCategories[0].name : 'Food & Dining',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        accountId: defaultAccount?.id || 'acc-main',
      });
    }
    setShowCalendar(false);
  }, [editTransaction, isOpen, defaultAccount?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      type: form.type,
      date: form.date,
      accountId: form.accountId,
    };

    if (isEdit && editTransaction) {
      updateTransaction(editTransaction.id, data);
    } else {
      addTransaction(data);
    }
    onClose();
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--dropdown-bg)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {isEdit ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Type</label>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--glass-border)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, type: 'expense', category: 'Food & Dining' });
                    }}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                      form.type === 'expense'
                        ? 'bg-expense text-white'
                        : 'bg-[var(--surface)] text-[var(--muted)]'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, type: 'income', category: 'Salary' });
                    }}
                    className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                      form.type === 'income'
                        ? 'bg-income text-white'
                        : 'bg-[var(--surface)] text-[var(--muted)]'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Account Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Account</label>
                <select
                  value={form.accountId}
                  onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border bg-[var(--surface)] text-[var(--foreground)]"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.icon} {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Description</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g., Swiggy dinner order"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>

              {/* Category - styled as dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border bg-[var(--surface)] text-[var(--foreground)]"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  {currentCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date - Custom Calendar Toggle */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-medium text-[var(--muted)]">Date</label>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-left border flex items-center justify-between transition-colors hover:bg-[var(--surface-hover)] focus:ring-2 focus:ring-primary/20"
                  style={{ borderColor: 'var(--glass-border)', backgroundColor: 'var(--input-bg)' }}
                >
                  <span>{formatDisplayDate(form.date)}</span>
                  <span className="text-[var(--muted)] text-xs">📅</span>
                </button>
                <AnimatePresence>
                  {showCalendar && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 w-full"
                    >
                      <MiniCalendar
                        value={form.date}
                        onChange={(date) => {
                          setForm({ ...form, date });
                          setShowCalendar(false);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
              >
                {isEdit ? 'Save Changes' : 'Add Transaction'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

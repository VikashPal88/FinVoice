'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Pencil,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Building2,
  SlidersHorizontal,
  Search,
  X,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { calculateTotalIncome, calculateTotalExpenses } from '@/utils/calculations';
import { CATEGORY_COLORS, CATEGORIES } from '@/data/mockData';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import TransactionModal from './TransactionModal';

const ITEMS_PER_PAGE = 10;

function RowOptions({
  onEdit,
  onDelete,
  alignMenu = 'right',
}: {
  onEdit: () => void;
  onDelete: () => void;
  alignMenu?: 'right' | 'left';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative isolate" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal size={16} className="text-[var(--muted)]" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 top-full mt-1 w-32 rounded-xl border shadow-xl bg-[var(--dropdown-bg)] ${alignMenu === 'left' ? 'left-0' : 'right-0'
              }`}
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <div className="p-1 min-w-[120px]">
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--surface-hover)] text-[var(--foreground)]"
              >
                <Pencil size={14} className="text-[var(--muted)]" />
                Edit
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-expense/10 text-expense"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TransactionList() {
  const { transactions, filters, setFilters, resetFilters, role, deleteTransaction, accounts } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = role === 'admin';
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);

  // Listen for custom event from sidebar/header "Add Transaction" button
  useEffect(() => {
    const handler = () => {
      if (isAdmin) {
        setEditTx(null);
        setModalOpen(true);
      }
    };
    window.addEventListener('openAddTransaction', handler);
    return () => window.removeEventListener('openAddTransaction', handler);
  }, [isAdmin]);

  const hasActiveFilters = filters.category !== 'all' || filters.type !== 'all' || filters.search !== '' || filters.accountId !== 'all';

  // Filter & sort
  const filtered = useMemo(() => {
    let result = [...transactions];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    if (filters.category !== 'all') {
      result = result.filter((t) => t.category === filters.category);
    }
    if (filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters.accountId !== 'all') {
      result = result.filter((t) => t.accountId === filters.accountId);
    }
    result.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case 'date': cmp = a.date.localeCompare(b.date); break;
        case 'amount': cmp = a.amount - b.amount; break;
        case 'category': cmp = a.category.localeCompare(b.category); break;
      }
      return filters.sortOrder === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [transactions, filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Export CSV
  const handleExport = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Type'];
    const rows = filtered.map((t) => [
      t.date, `"${t.description}"`, t.amount.toString(), t.category, t.type,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        {/* Left - Title & Stats */}
        <div className="flex-1 glass-card p-6">
          <h2 className="text-xl font-bold mb-1">Transaction Ledger</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Review and manage your capital flows across all accounts.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-income/10 border border-income/20">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Total Inflow</p>
              <p className="text-lg font-bold text-income">+{formatCurrency(totalIncome)}</p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-expense/10 border border-expense/20">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Total Outflow</p>
              <p className="text-lg font-bold text-expense">-{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Right - Active Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 lg:w-72 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-primary/20 flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Building2 size={24} className="text-primary" />
          </div>
          <p className="text-xs text-[var(--muted)] font-medium">Active Reserves</p>
          <p className="text-[10px] text-[var(--muted)]">Main Account</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalIncome - totalExpenses)}</p>
        </motion.div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-3"
      >
        {/* Account Filter Pill */}
        <select
          value={filters.accountId || 'all'}
          onChange={(e) => { setFilters({ accountId: e.target.value as any }); setCurrentPage(1); }}
          className="px-4 py-2.5 rounded-xl text-sm border bg-transparent cursor-pointer"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <option value="all">All Accounts</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
        </select>

        {/* Category Filter Pill */}
        <select
          value={filters.category}
          onChange={(e) => { setFilters({ category: e.target.value as any }); setCurrentPage(1); }}
          className="px-4 py-2.5 rounded-xl text-sm border bg-transparent cursor-pointer"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Type Filter Pill */}
        <select
          value={filters.type}
          onChange={(e) => { setFilters({ type: e.target.value as any }); setCurrentPage(1); }}
          className="px-4 py-2.5 rounded-xl text-sm border bg-transparent cursor-pointer"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => { setFilters({ search: e.target.value }); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => { resetFilters(); setCurrentPage(1); }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-expense border border-expense/20 hover:bg-expense/10 transition-all"
          >
            <X size={14} /> Clear
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted)] uppercase tracking-wider hidden sm:inline">Sort By</span>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
              setFilters({ sortBy, sortOrder });
            }}
            className="px-3 py-2.5 rounded-xl text-sm border bg-transparent cursor-pointer"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (High)</option>
            <option value="amount-asc">Amount (Low)</option>
            <option value="category-asc">Category (A-Z)</option>
          </select>
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-[var(--surface-hover)]"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <Download size={14} />
          Export
        </button>
      </motion.div>

      {/* Admin / Viewer Indicator */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs"
        >
          <span>👁️</span>
          <span>You are in <strong>Viewer</strong> mode. Switch to Admin to add or edit transactions.</span>
        </motion.div>
      )}

      {/* Table Header */}
      {paginated.length > 0 && (
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[10px] uppercase tracking-widest font-semibold text-[var(--muted)]">
          <div className="col-span-2">Date</div>
          <div className="col-span-4">Recipient / Source</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2 text-right pr-8">Amount</div>
        </div>
      )}

      {/* Transactions */}
      {paginated.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description={
            hasActiveFilters
              ? 'Try adjusting your filters or search query.'
              : 'Start by adding your first transaction.'
          }
        />
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {paginated.map((tx, index) => (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: index * 0.02 }}
                className="glass-card-sm grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center p-4 md:px-5 md:py-4 hover:bg-[var(--surface-hover)] transition-all group cursor-default"
              >
                {/* Date */}
                <div className="md:col-span-2 flex md:block items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{formatDate(tx.date)}</p>
                    <p className="text-[11px] text-[var(--muted)] hidden md:block">
                      {new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                  {/* Mobile amount */}
                  <p className={`text-sm font-bold md:hidden ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>

                {/* Description */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                      }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight size={16} className="text-income" />
                    ) : (
                      <ArrowDownRight size={16} className="text-expense" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-[11px] text-[var(--muted)] truncate">Ref: {tx.id.toUpperCase().slice(0, 10)}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="md:col-span-2 hidden md:block">
                  <Badge color={CATEGORY_COLORS[tx.category]}>{tx.category}</Badge>
                </div>

                {/* Type */}
                <div className="md:col-span-2 hidden md:block">
                  <span className={`text-xs font-medium ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? 'Credit' : 'Debit'}
                  </span>
                </div>

                {/* Amount + Actions */}
                <div className="md:col-span-2 hidden md:flex items-center justify-end gap-3">
                  <p className={`text-sm font-bold text-right flex-1 ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <div className="w-8 flex items-center justify-center">
                    {isAdmin && (
                      <RowOptions
                        onEdit={() => { setEditTx(tx); setModalOpen(true); }}
                        onDelete={() => { if (confirm('Delete this transaction?')) deleteTransaction(tx.id); }}
                      />
                    )}
                  </div>
                </div>

                {/* Mobile: Category badge + actions row */}
                <div className="flex items-center gap-2 md:hidden">
                  <Badge color={CATEGORY_COLORS[tx.category]}>{tx.category}</Badge>
                  <span className={`text-[11px] font-medium ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? 'Credit' : 'Debit'}
                  </span>
                  {isAdmin && (
                    <div className="ml-auto">
                      <RowOptions
                        alignMenu="right"
                        onEdit={() => { setEditTx(tx); setModalOpen(true); }}
                        onDelete={() => { if (confirm('Delete?')) deleteTransaction(tx.id); }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[var(--muted)]">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, i, arr) => (
                <span key={page} className="flex items-center">
                  {i > 0 && arr[i - 1] !== page - 1 && (
                    <span className="px-1 text-xs text-[var(--muted)]">…</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === currentPage
                        ? 'bg-primary text-white'
                        : 'hover:bg-[var(--surface-hover)] text-[var(--muted)]'
                      }`}
                  >
                    {page}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-income flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-income">
              {totalExpenses > 0 ? Math.round((1 - totalExpenses / totalIncome) * 100) : 0}%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold">Budget Adherence</p>
            <p className="text-xs text-[var(--muted)]">Your expenses are within target margins.</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <p className="text-sm font-semibold">Audit Ready</p>
            <p className="text-xs text-[var(--muted)]">All {transactions.length} transactions are reconciled and categorized.</p>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTx(null); }}
        editTransaction={editTx}
      />
    </div>
  );
}

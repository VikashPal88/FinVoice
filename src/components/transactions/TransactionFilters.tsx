'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CATEGORIES } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function TransactionFilters() {
  const { filters, setFilters, resetFilters } = useStore();
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.category !== 'all' || filters.type !== 'all';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-all ${
            hasActiveFilters
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-[var(--glass-border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <SlidersHorizontal size={18} />
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={resetFilters}
            className="p-2.5 rounded-xl border border-[var(--glass-border)] text-[var(--muted)] hover:bg-[var(--surface-hover)] transition-all"
          >
            <X size={18} />
          </motion.button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-[var(--surface)]">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ category: e.target.value as any })}
                  className="px-3 py-2 rounded-lg text-sm min-w-[160px]"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ type: e.target.value as any })}
                  className="px-3 py-2 rounded-lg text-sm min-w-[140px]"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* Sort */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ sortBy: e.target.value as any })}
                  className="px-3 py-2 rounded-lg text-sm min-w-[120px]"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters({ sortOrder: e.target.value as any })}
                  className="px-3 py-2 rounded-lg text-sm min-w-[120px]"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

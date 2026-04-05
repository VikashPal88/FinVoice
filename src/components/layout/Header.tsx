'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bell,
  Search,
  Plus,
  ChevronDown,
  User,
  Settings,
  LogOut,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import RoleToggle from '@/components/common/RoleToggle';
import SignOutModal from '@/components/common/SignOutModal';

const pageLabels: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your financial activity' },
  '/transactions': { title: 'Transaction Ledger', subtitle: 'Review and manage your capital flows' },
  '/insights': { title: 'Analytics & Insights', subtitle: 'Understand your spending patterns' },
  '/accounts': { title: 'Accounts', subtitle: 'Manage your financial accounts and budgets' },
  '/settings': { title: 'Account Settings', subtitle: 'Manage your profile and preferences' },
};

export default function Header() {
  const { toggleSidebar, budgetAlerts, dismissBudgetAlert } = useStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const page = pageLabels[pathname] || pageLabels['/'];

  const activeAlerts = budgetAlerts.filter((a) => !a.dismissed);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const openAddTransaction = () => {
    if (pathname !== '/transactions') {
      router.push('/transactions');
      setTimeout(() => {
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('openAddTransaction'));
      }, 100);
    } else {
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('openAddTransaction'));
    }
  };

  return (
    <header
      className="h-16 flex items-center gap-4 px-4 md:px-6 border-b sticky top-0 z-20"
      style={{
        backgroundColor: 'var(--background)',
        borderColor: 'var(--glass-border)',
      }}
    >
      {/* Mobile Menu */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg transition-colors hover:bg-[var(--surface-hover)] md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Search Bar */}
      <div className={`hidden md:flex items-center flex-1 max-w-md relative transition-all duration-300 ${searchFocused ? 'max-w-lg' : ''}`}>
        <Search size={16} className="absolute left-3.5 text-[var(--muted)]" />
        <input
          type="text"
          placeholder="Search transactions, categories..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-[var(--surface)] border border-transparent focus:border-primary/30 transition-all"
        />
      </div>

      {/* Mobile Title */}
      <div className="md:hidden flex-1">
        <h2 className="text-base font-semibold">{page.title}</h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Role Toggle - Desktop */}
        <div className="hidden lg:block">
          <RoleToggle />
        </div>

        {/* Add Transaction (Quick) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddTransaction}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-shadow"
        >
          <Plus size={14} />
          <span className="hidden md:inline">Add Transaction</span>
        </motion.button>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
          >
            <Bell size={18} className="text-[var(--muted)]" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-expense rounded-full ring-2 ring-[var(--background)] flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{activeAlerts.length}</span>
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--dropdown-bg)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--glass-border)' }}>
                  <h4 className="text-sm font-semibold">Notifications</h4>
                  <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                    {activeAlerts.length} active
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {activeAlerts.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-xs text-[var(--muted)]">No new notifications</p>
                    </div>
                  ) : (
                    activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-2.5 p-3 border-b hover:bg-[var(--surface-hover)] transition-colors"
                        style={{ borderColor: 'var(--glass-border)' }}
                      >
                        <div className="p-1.5 rounded-lg bg-amber-500/10 mt-0.5">
                          <AlertTriangle size={12} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">
                            Budget Alert — {alert.accountName}
                          </p>
                          <p className="text-[10px] text-[var(--muted)] mt-0.5">
                            {alert.percentage.toFixed(0)}% of budget used ({new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(alert.spent)})
                          </p>
                        </div>
                        <button
                          onClick={() => dismissBudgetAlert(alert.id)}
                          className="p-1 rounded hover:bg-[var(--surface)] transition-colors"
                        >
                          <X size={12} className="text-[var(--muted)]" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-[var(--glass-border)]">
              VP
            </div>
            <ChevronDown size={14} className="text-[var(--muted)] hidden md:block" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--dropdown-bg)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                {/* Profile Header */}
                <div className="p-4 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      VP
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Vikash Pal</p>
                      <p className="text-xs text-[var(--muted)]">vs700034@gmail.com</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Role Toggle */}
                <div className="p-3 border-b lg:hidden" style={{ borderColor: 'var(--glass-border)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">Role</p>
                  <RoleToggle />
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      router.push('/settings');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      router.push('/settings');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                </div>

                <div className="border-t p-1.5" style={{ borderColor: 'var(--glass-border)' }}>
                  <button
                    onClick={() => {
                      setShowSignOut(true);
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-expense hover:bg-expense/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SignOutModal isOpen={showSignOut} onClose={() => setShowSignOut(false)} />
    </header>
  );
}

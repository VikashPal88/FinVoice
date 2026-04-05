'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Eye,
  User,
  Mail,
  Bell,
  ShieldCheck,
  History,
  ChevronRight,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const { role, setRole, categories, addCategory, deleteCategory } = useStore();
  const isAdmin = role === 'admin';
  const [name, setName] = useState('Vikash Pal');
  const [email, setEmail] = useState('vs700034@gmail.com');
  const [txDigests, setTxDigests] = useState(true);
  const [secAlerts, setSecAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  // Custom Category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatColor, setNewCatColor] = useState('#84cc16');

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), type: newCatType, color: newCatColor });
    setNewCatName('');
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Account Identity</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage your profile, permissions, and security settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setName('Vikash Pal');
              setEmail('vs700034@gmail.com');
            }}
            className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-all hover:bg-[var(--surface-hover)]"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            Discard Changes
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow flex items-center gap-2"
          >
            {saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Permissions */}
        <div className="lg:col-span-3 space-y-6">
          {/* Institutional Permissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Role & Permissions</h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Adjust your operational scope. Administrators hold full transactional authority while Viewers maintain read-only audit capabilities.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-primary/10">
                <ShieldCheck size={22} className="text-primary" />
              </div>
            </div>

            {/* Active Role Card */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[var(--surface)] mb-5">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {role === 'admin' ? (
                    <Shield size={22} className="text-white" />
                  ) : (
                    <Eye size={22} className="text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Active Role: {role === 'admin' ? 'Administrator' : 'Viewer'}
                  </p>
                  <p className={`text-xs font-medium ${role === 'admin' ? 'text-income' : 'text-amber-500'}`}>
                    {role === 'admin' ? 'Full Transactional Access Enabled' : 'Read-Only Audit Mode'}
                  </p>
                </div>
              </div>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--glass-border)' }}>
                <button
                  onClick={() => setRole('admin')}
                  className={`px-5 py-2 text-sm font-medium transition-all ${role === 'admin'
                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                    : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => setRole('viewer')}
                  className={`px-5 py-2 text-sm font-medium transition-all ${role === 'viewer'
                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                    : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                >
                  Viewer
                </button>
              </div>
            </div>

            {/* Privileges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--surface)]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                  Admin Privileges
                </h4>
                <ul className="space-y-2">
                  {[
                    'Create/Edit Transactions',
                    'Delete Records',
                    'Export Data (CSV/JSON)',
                    'Full Dashboard Access',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface)]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                  Viewer Mode (Audit)
                </h4>
                <ul className="space-y-2">
                  {[
                    'Read-only transaction logs',
                    'View analytics & insights',
                    'Export PDF reports',
                    'Dashboard overview',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Security Protocols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-1">Security Protocols</h2>
            <p className="text-sm text-[var(--muted)] mb-5">
              Protect your financial data with authentication and session monitoring.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <h4 className="text-sm font-semibold mb-1">Multi-Factor Auth (2FA)</h4>
                <p className="text-xs text-[var(--muted)] mb-3">
                  Authenticator app configured. Security hardware keys recommended for extra protection.
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                  Manage Credentials <ChevronRight size={12} />
                </span>
              </div>

              <div className="p-5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                  <History size={20} className="text-violet-400" />
                </div>
                <h4 className="text-sm font-semibold mb-1">Session History</h4>
                <p className="text-xs text-[var(--muted)] mb-3">
                  Last active from 192.168.1.1. Review all active terminal sessions for security.
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-violet-400 font-medium group-hover:gap-2 transition-all">
                  Audit Logs <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-5">Personal Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] block mb-2">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>
          </motion.div>

          {/* Notification Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-5">Notifications</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Transaction Digests</p>
                    <p className="text-xs text-[var(--muted)]">Weekly summary emails</p>
                  </div>
                </div>
                <ToggleSwitch checked={txDigests} onChange={setTxDigests} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10">
                    <Bell size={16} className="text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Security Alerts</p>
                    <p className="text-xs text-[var(--muted)]">Login & session alerts</p>
                  </div>
                </div>
                <ToggleSwitch checked={secAlerts} onChange={setSecAlerts} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <AlertTriangle size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Budget Alerts</p>
                    <p className="text-xs text-[var(--muted)]">Email when 90% budget reached</p>
                  </div>
                </div>
                <ToggleSwitch checked={budgetAlerts} onChange={setBudgetAlerts} activeColor="#f59e0b" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold">Custom Categories</h2>
            <p className="text-sm text-[var(--muted)] mt-0.5">Add or remove transaction categories used in filters and forms.</p>
          </div>
        </div>

        {/* Add New Category */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[var(--surface)] border mb-4" style={{ borderColor: 'var(--glass-border)' }}>
          <Select value={newCatType} onValueChange={(val) => setNewCatType(val as any)}>
            <SelectTrigger className="w-[120px] h-[40px] rounded-lg text-sm border bg-[var(--background)] text-[var(--foreground)]" style={{ borderColor: 'var(--glass-border)' }}>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--dropdown-bg)] border-[var(--glass-border)] text-[var(--foreground)] z-[60]">
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
            placeholder="New category name..."
            className="flex-1 min-w-[180px] px-4 py-2.5 rounded-lg text-sm bg-[var(--background)] border"
            style={{ borderColor: 'var(--glass-border)' }}
          />
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            className="w-10 h-10 rounded-lg shrink-0 cursor-pointer border-0 p-0.5"
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCatName.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        {/* Category List (Dropdown Management) */}
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)] bg-[var(--surface)] text-[var(--foreground)]"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              View & Manage Categories
              <ChevronRight size={16} className="text-[var(--muted)] rotate-90" />
            </PopoverTrigger>
            <PopoverContent
              className="w-[280px] sm:w-[320px] p-2 bg-[var(--dropdown-bg)] border-[var(--glass-border)] text-[var(--foreground)] z-[60] shadow-xl rounded-xl"
              align="start"
            >
              <div className="max-h-72 overflow-y-auto pr-1 custom-scrollbar space-y-1">
                {categories.length === 0 && (
                  <p className="text-xs text-center p-4 text-[var(--muted)]">No categories found.</p>
                )}
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium truncate">{cat.name}</span>
                      <span className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${cat.type === 'income' ? 'text-income bg-income/10' : 'text-expense bg-expense/10'
                        }`}>
                        {cat.type}
                      </span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => { if (confirm('Delete this category?')) deleteCategory(cat.id); }}
                        className="p-1.5 rounded-md text-[var(--muted)] hover:text-expense hover:bg-expense/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        title="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-4 py-6 border-t text-xs text-[var(--muted)]"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <p>© 2026 FinDash. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <button className="hover:text-[var(--foreground)] transition-colors underline">Privacy Policy</button>
          <button className="hover:text-[var(--foreground)] transition-colors underline">Terms of Service</button>
          <button className="hover:text-[var(--foreground)] transition-colors underline">Security</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
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
  Loader2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import { CategoryItem } from '@/lib/categories';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [txDigests, setTxDigests] = useState(true);
  const [secAlerts, setSecAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  // Category state
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatColor, setNewCatColor] = useState('#84cc16');
  const [addingCategory, setAddingCategory] = useState(false);
  const [catError, setCatError] = useState('');
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  // Load user info from session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCategories();
    }
  }, [session]);

  // Custom categories only (for the management list)
  const customCategories = categories.filter(c => !c.isDefault);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatError('');
    setAddingCategory(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          type: newCatType,
          color: newCatColor,
        }),
      });

      if (res.ok) {
        setNewCatName('');
        await fetchCategories(); // Refresh the list
      } else {
        const data = await res.json();
        setCatError(data.error || 'Failed to add category');
      }
    } catch (err) {
      setCatError('Network error');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteCatId }),
      });

      if (res.ok) {
        await fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setDeleteCatId(null);
    }
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
              if (session?.user) {
                setName(session.user.name || '');
                setEmail(session.user.email || '');
              }
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
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow flex items-center gap-2"
          >
            {saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Permissions */}
        <div className="lg:col-span-3 space-y-6">


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
            onChange={(e) => { setNewCatName(e.target.value); setCatError(''); }}
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
            disabled={!newCatName.trim() || addingCategory}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {addingCategory ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>

        {/* Error message */}
        {catError && (
          <p className="text-xs text-expense mb-3 px-1">{catError}</p>
        )}

        {/* Category List (Dropdown Management) */}
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)] bg-[var(--surface)] text-[var(--foreground)]"
              style={{ borderColor: 'var(--glass-border)' }}
            >
              View & Manage Categories ({customCategories.length} custom)
              <ChevronRight size={16} className="text-[var(--muted)] rotate-90" />
            </PopoverTrigger>
            <PopoverContent
              className="w-[280px] sm:w-[320px] p-2 bg-[var(--dropdown-bg)] border-[var(--glass-border)] text-[var(--foreground)] z-[60] shadow-xl rounded-xl"
              align="start"
            >
              <div className="max-h-72 overflow-y-auto pr-1 custom-scrollbar space-y-1">
                {loadingCategories && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 size={16} className="animate-spin text-[var(--muted)]" />
                  </div>
                )}

                {!loadingCategories && customCategories.length === 0 && (
                  <p className="text-xs text-center p-4 text-[var(--muted)]">No custom categories yet. Add one above!</p>
                )}

                {customCategories.map((cat) => (
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
                    <button
                      onClick={() => setDeleteCatId(cat.id)}
                      className="p-1.5 rounded-md text-[var(--muted)] hover:text-expense hover:bg-expense/10 transition-colors shrink-0"
                      title="Delete category"
                    >
                      <Trash2 size={14} />
                    </button>
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
        <p>© 2026 RupeeTrack. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <button className="hover:text-[var(--foreground)] transition-colors underline">Privacy Policy</button>
          <button className="hover:text-[var(--foreground)] transition-colors underline">Terms of Service</button>
          <button className="hover:text-[var(--foreground)] transition-colors underline">Security</button>
        </div>
      </motion.div>

      <ConfirmDeleteModal
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        description="Are you sure you want to delete this custom category? This action cannot be undone."
      />
    </motion.div>
  );
}

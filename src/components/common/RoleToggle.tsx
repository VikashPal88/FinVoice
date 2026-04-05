'use client';

import { motion } from 'framer-motion';
import { Shield, Eye } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function RoleToggle() {
  const { role, setRole } = useStore();
  const isAdmin = role === 'admin';

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface)] border border-[var(--glass-border)]">
      <button
        onClick={() => setRole('viewer')}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
          !isAdmin ? 'text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
        }`}
      >
        {!isAdmin && (
          <motion.div
            layoutId="roleToggleBg"
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <Eye size={13} />
          Viewer
        </span>
      </button>
      <button
        onClick={() => setRole('admin')}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
          isAdmin ? 'text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
        }`}
      >
        {isAdmin && (
          <motion.div
            layoutId="roleToggleBg"
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <Shield size={13} />
          Admin
        </span>
      </button>
    </div>
  );
}

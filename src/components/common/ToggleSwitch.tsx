'use client';

import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  activeColor?: string;
  disabled?: boolean;
  labels?: { on: string; off: string };
}

export default function ToggleSwitch({
  checked,
  onChange,
  size = 'md',
  activeColor,
  disabled = false,
  labels,
}: ToggleSwitchProps) {
  const sizes = {
    sm: { track: 'w-9 h-5', thumb: 'w-3.5 h-3.5', translate: checked ? 17 : 3 },
    md: { track: 'w-11 h-6', thumb: 'w-4 h-4', translate: checked ? 24 : 4 },
    lg: { track: 'w-14 h-7', thumb: 'w-5 h-5', translate: checked ? 32 : 4 },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      {labels && (
        <span className={`text-xs font-medium transition-colors ${!checked ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
          {labels.off}
        </span>
      )}
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`${s.track} rounded-full relative transition-all duration-300 ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{
          backgroundColor: checked
            ? activeColor || 'var(--color-primary)'
            : 'var(--glass-border)',
          boxShadow: checked ? `0 0 12px ${activeColor || 'rgba(99, 102, 241, 0.4)'}` : 'none',
        }}
        aria-checked={checked}
        role="switch"
      >
        <motion.div
          animate={{ x: s.translate }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-1 ${s.thumb} rounded-full bg-white shadow-md`}
        />
      </button>
      {labels && (
        <span className={`text-xs font-medium transition-colors ${checked ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
          {labels.on}
        </span>
      )}
    </div>
  );
}

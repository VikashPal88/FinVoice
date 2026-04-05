'use client';

import { motion } from 'framer-motion';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="empty-state-icon w-20 h-20 flex items-center justify-center mb-4">
        {icon || <FileX size={32} className="text-[var(--muted)]" />}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[var(--muted)] text-center max-w-sm">{description}</p>
    </motion.div>
  );
}

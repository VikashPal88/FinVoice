'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useStore } from '@/store/useStore';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, sidebarOpen } = useStore();
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-grid">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

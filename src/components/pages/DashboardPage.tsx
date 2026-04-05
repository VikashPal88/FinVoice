'use client';

import { motion } from 'framer-motion';
import SummaryCards from '@/components/dashboard/SummaryCards';
import BalanceTrendChart from '@/components/dashboard/BalanceTrendChart';
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AccountOverview from '@/components/dashboard/AccountOverview';

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceTrendChart />
        <SpendingBreakdown />
      </div>

      <AccountOverview />

      <RecentTransactions />
    </motion.div>
  );
}

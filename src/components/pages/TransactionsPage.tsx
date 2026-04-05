'use client';

import { motion } from 'framer-motion';
import TransactionList from '@/components/transactions/TransactionList';

export default function TransactionsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto"
    >
      <TransactionList />
    </motion.div>
  );
}

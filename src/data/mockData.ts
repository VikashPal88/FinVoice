import { Transaction, Category, Account } from '@/types';

export const CATEGORIES: Category[] = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Salary',
  'Freelance',
  'Investments',
  'Rent',
  'Travel',
  'Groceries',
  'Other',
];

export const EXPENSE_CATEGORIES: Category[] = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Rent',
  'Travel',
  'Groceries',
  'Other',
];

export const INCOME_CATEGORIES: Category[] = [
  'Salary',
  'Freelance',
  'Investments',
  'Other',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#f97316',
  'Transportation': '#3b82f6',
  'Shopping': '#ec4899',
  'Entertainment': '#8b5cf6',
  'Bills & Utilities': '#ef4444',
  'Healthcare': '#14b8a6',
  'Education': '#6366f1',
  'Salary': '#22c55e',
  'Freelance': '#06b6d4',
  'Investments': '#eab308',
  'Rent': '#f43f5e',
  'Travel': '#a855f7',
  'Groceries': '#84cc16',
  'Other': '#6b7280',
};

export const ACCOUNT_ICONS = ['💰', '🍕', '✈️', '🏠', '🎮', '📚', '🏥', '🛒', '💼', '🎯'];
export const ACCOUNT_COLORS = [
  '#6366f1', '#22c55e', '#f97316', '#ec4899', '#8b5cf6',
  '#14b8a6', '#eab308', '#ef4444', '#06b6d4', '#84cc16',
];

export const defaultAccounts: Account[] = [
  { id: 'acc-main', name: 'Main Account', icon: '💰', color: '#6366f1', budget: 50000, isDefault: true },
  { id: 'acc-food', name: 'Food & Dining', icon: '🍕', color: '#f97316', budget: 8000, isDefault: false },
  { id: 'acc-travel', name: 'Travel', icon: '✈️', color: '#a855f7', budget: 15000, isDefault: false },
  { id: 'acc-bills', name: 'Bills & Utilities', icon: '🏠', color: '#ef4444', budget: 25000, isDefault: false },
];

export const defaultTransactions: Transaction[] = [
  // October 2025
  { id: '1', date: '2025-10-01', description: 'Monthly Salary - TCS', amount: 85000, category: 'Salary', type: 'income', accountId: 'acc-main' },
  { id: '2', date: '2025-10-03', description: 'House Rent Payment', amount: 18000, category: 'Rent', type: 'expense', accountId: 'acc-bills' },
  { id: '3', date: '2025-10-05', description: 'Swiggy - Dinner Order', amount: 450, category: 'Food & Dining', type: 'expense', accountId: 'acc-food' },
  { id: '4', date: '2025-10-07', description: 'Metro Card Recharge', amount: 500, category: 'Transportation', type: 'expense', accountId: 'acc-main' },
  { id: '5', date: '2025-10-10', description: 'Amazon - Headphones', amount: 2999, category: 'Shopping', type: 'expense', accountId: 'acc-main' },
  { id: '6', date: '2025-10-12', description: 'Electricity Bill', amount: 1850, category: 'Bills & Utilities', type: 'expense', accountId: 'acc-bills' },
  { id: '7', date: '2025-10-15', description: 'Freelance Web Dev Project', amount: 25000, category: 'Freelance', type: 'income', accountId: 'acc-main' },
  { id: '8', date: '2025-10-18', description: 'Netflix Subscription', amount: 649, category: 'Entertainment', type: 'expense', accountId: 'acc-main' },
  { id: '9', date: '2025-10-20', description: 'BigBasket Groceries', amount: 3200, category: 'Groceries', type: 'expense', accountId: 'acc-food' },
  { id: '10', date: '2025-10-25', description: 'Doctor Visit - General', amount: 800, category: 'Healthcare', type: 'expense', accountId: 'acc-main' },
  
  // November 2025
  { id: '11', date: '2025-11-01', description: 'Monthly Salary - TCS', amount: 85000, category: 'Salary', type: 'income', accountId: 'acc-main' },
  { id: '12', date: '2025-11-02', description: 'House Rent Payment', amount: 18000, category: 'Rent', type: 'expense', accountId: 'acc-bills' },
  { id: '13', date: '2025-11-04', description: 'Zomato - Lunch', amount: 380, category: 'Food & Dining', type: 'expense', accountId: 'acc-food' },
  { id: '14', date: '2025-11-06', description: 'Uber Rides', amount: 1200, category: 'Transportation', type: 'expense', accountId: 'acc-main' },
  { id: '15', date: '2025-11-08', description: 'Myntra - Winter Jacket', amount: 3499, category: 'Shopping', type: 'expense', accountId: 'acc-main' },
  { id: '16', date: '2025-11-10', description: 'Internet Bill - Airtel', amount: 999, category: 'Bills & Utilities', type: 'expense', accountId: 'acc-bills' },
  { id: '17', date: '2025-11-12', description: 'SIP - Mutual Fund', amount: 10000, category: 'Investments', type: 'expense', accountId: 'acc-main' },
  { id: '18', date: '2025-11-15', description: 'Freelance UI Design', amount: 15000, category: 'Freelance', type: 'income', accountId: 'acc-main' },
  { id: '19', date: '2025-11-18', description: 'Movie Tickets - PVR', amount: 700, category: 'Entertainment', type: 'expense', accountId: 'acc-main' },
  { id: '20', date: '2025-11-22', description: 'DMart Groceries', amount: 2800, category: 'Groceries', type: 'expense', accountId: 'acc-food' },
  { id: '21', date: '2025-11-25', description: 'Coursera Subscription', amount: 3200, category: 'Education', type: 'expense', accountId: 'acc-main' },
  
  // December 2025
  { id: '22', date: '2025-12-01', description: 'Monthly Salary - TCS', amount: 85000, category: 'Salary', type: 'income', accountId: 'acc-main' },
  { id: '23', date: '2025-12-02', description: 'House Rent Payment', amount: 18000, category: 'Rent', type: 'expense', accountId: 'acc-bills' },
  { id: '24', date: '2025-12-05', description: 'Dominos Pizza Party', amount: 1200, category: 'Food & Dining', type: 'expense', accountId: 'acc-food' },
  { id: '25', date: '2025-12-07', description: 'Ola Rides', amount: 950, category: 'Transportation', type: 'expense', accountId: 'acc-main' },
  { id: '26', date: '2025-12-10', description: 'Flipkart Sale - Electronics', amount: 8999, category: 'Shopping', type: 'expense', accountId: 'acc-main' },
  { id: '27', date: '2025-12-12', description: 'Gas Bill', amount: 650, category: 'Bills & Utilities', type: 'expense', accountId: 'acc-bills' },
  { id: '28', date: '2025-12-15', description: 'Year-End Bonus', amount: 40000, category: 'Salary', type: 'income', accountId: 'acc-main' },
  { id: '29', date: '2025-12-18', description: 'Spotify Premium', amount: 119, category: 'Entertainment', type: 'expense', accountId: 'acc-main' },
  { id: '30', date: '2025-12-20', description: 'Christmas Gifts', amount: 5500, category: 'Shopping', type: 'expense', accountId: 'acc-main' },
  { id: '31', date: '2025-12-22', description: 'Goa Trip - Flight', amount: 6500, category: 'Travel', type: 'expense', accountId: 'acc-travel' },
  { id: '32', date: '2025-12-24', description: 'Goa Trip - Hotel', amount: 8000, category: 'Travel', type: 'expense', accountId: 'acc-travel' },
  { id: '33', date: '2025-12-28', description: 'Pharmacy - Medicines', amount: 450, category: 'Healthcare', type: 'expense', accountId: 'acc-main' },
  
  // January 2026
  { id: '34', date: '2026-01-01', description: 'Monthly Salary - TCS', amount: 90000, category: 'Salary', type: 'income', accountId: 'acc-main' },
  { id: '35', date: '2026-01-03', description: 'House Rent Payment', amount: 18000, category: 'Rent', type: 'expense', accountId: 'acc-bills' },
  { id: '36', date: '2026-01-05', description: 'Starbucks Coffee', amount: 550, category: 'Food & Dining', type: 'expense', accountId: 'acc-food' },
  { id: '37', date: '2026-01-08', description: 'Petrol Fill-up', amount: 3000, category: 'Transportation', type: 'expense', accountId: 'acc-main' },
  { id: '38', date: '2026-01-10', description: 'Amazon - Books', amount: 1200, category: 'Shopping', type: 'expense', accountId: 'acc-main' },
  { id: '39', date: '2026-01-12', description: 'Mobile Recharge', amount: 599, category: 'Bills & Utilities', type: 'expense', accountId: 'acc-bills' },
  { id: '40', date: '2026-01-15', description: 'Freelance API Project', amount: 30000, category: 'Freelance', type: 'income', accountId: 'acc-main' },
  { id: '41', date: '2026-01-18', description: 'SIP - Mutual Fund', amount: 10000, category: 'Investments', type: 'expense', accountId: 'acc-main' },
  { id: '42', date: '2026-01-20', description: 'Zepto Groceries', amount: 2500, category: 'Groceries', type: 'expense', accountId: 'acc-food' },
  { id: '43', date: '2026-01-22', description: 'Gym Membership', amount: 2000, category: 'Healthcare', type: 'expense', accountId: 'acc-main' },
  { id: '44', date: '2026-01-25', description: 'Udemy Course - React', amount: 499, category: 'Education', type: 'expense', accountId: 'acc-main' },
  
  // February 2026
  { id: '45', date: '2026-02-01', description: 'Monthly Salary - TCS', amount: 90000, category: 'Salary', type: 'income', accountId: 'acc-main' },
  { id: '46', date: '2026-02-02', description: 'House Rent Payment', amount: 18000, category: 'Rent', type: 'expense', accountId: 'acc-bills' },
  { id: '47', date: '2026-02-05', description: 'Cafe Coffee Day', amount: 320, category: 'Food & Dining', type: 'expense', accountId: 'acc-food' },
  { id: '48', date: '2026-02-07', description: 'Rapido Bike Taxi', amount: 150, category: 'Transportation', type: 'expense', accountId: 'acc-main' },
  { id: '49', date: '2026-02-10', description: 'Meesho - Clothes', amount: 1800, category: 'Shopping', type: 'expense', accountId: 'acc-main' },
  { id: '50', date: '2026-02-12', description: 'Electricity Bill', amount: 2100, category: 'Bills & Utilities', type: 'expense', accountId: 'acc-bills' },
  { id: '51', date: '2026-02-14', description: 'Valentine Dinner', amount: 3500, category: 'Food & Dining', type: 'expense', accountId: 'acc-food' },
  { id: '52', date: '2026-02-16', description: 'Dividend Income', amount: 5000, category: 'Investments', type: 'income', accountId: 'acc-main' },
  { id: '53', date: '2026-02-18', description: 'Disney+ Hotstar', amount: 299, category: 'Entertainment', type: 'expense', accountId: 'acc-main' },
  { id: '54', date: '2026-02-20', description: 'BigBasket Groceries', amount: 3100, category: 'Groceries', type: 'expense', accountId: 'acc-food' },
  { id: '55', date: '2026-02-25', description: 'Dental Checkup', amount: 1500, category: 'Healthcare', type: 'expense', accountId: 'acc-main' },
  
  // March 2026
  { id: '56', date: '2026-03-01', description: 'Monthly Salary - TCS', amount: 90000, category: 'Salary', type: 'income', accountId: 'acc-main' },
  { id: '57', date: '2026-03-02', description: 'House Rent Payment', amount: 18000, category: 'Rent', type: 'expense', accountId: 'acc-bills' },
  { id: '58', date: '2026-03-05', description: 'Blinkit Quick Commerce', amount: 850, category: 'Groceries', type: 'expense', accountId: 'acc-food' },
  { id: '59', date: '2026-03-07', description: 'Auto Rickshaw', amount: 200, category: 'Transportation', type: 'expense', accountId: 'acc-main' },
  { id: '60', date: '2026-03-10', description: 'Ajio - Shoes', amount: 2499, category: 'Shopping', type: 'expense', accountId: 'acc-main' },
  { id: '61', date: '2026-03-12', description: 'Water Bill', amount: 350, category: 'Bills & Utilities', type: 'expense', accountId: 'acc-bills' },
  { id: '62', date: '2026-03-15', description: 'Freelance Mobile App', amount: 35000, category: 'Freelance', type: 'income', accountId: 'acc-main' },
  { id: '63', date: '2026-03-18', description: 'SIP - Mutual Fund', amount: 10000, category: 'Investments', type: 'expense', accountId: 'acc-main' },
  { id: '64', date: '2026-03-20', description: 'Concert Tickets', amount: 2500, category: 'Entertainment', type: 'expense', accountId: 'acc-main' },
  { id: '65', date: '2026-03-22', description: 'Eye Checkup + Glasses', amount: 4500, category: 'Healthcare', type: 'expense', accountId: 'acc-main' },
  { id: '66', date: '2026-03-25', description: 'Chai Point - Office', amount: 180, category: 'Food & Dining', type: 'expense', accountId: 'acc-food' },
  { id: '67', date: '2026-03-28', description: 'Weekend Trip - Manali', amount: 12000, category: 'Travel', type: 'expense', accountId: 'acc-travel' },

  // April 2026 (Added for tracker visibility)
  { id: '68', date: '2026-04-01', description: 'Monthly Salary - TCS', amount: 90000, category: 'Salary', type: 'income', accountId: 'acc-main' },
  { id: '69', date: '2026-04-02', description: 'House Rent Payment', amount: 18000, category: 'Rent', type: 'expense', accountId: 'acc-bills' },
  { id: '70', date: '2026-04-04', description: 'Zomato Delivery', amount: 450, category: 'Food & Dining', type: 'expense', accountId: 'acc-food' },
];

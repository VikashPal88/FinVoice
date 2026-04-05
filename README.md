# FinDash — Finance Dashboard UI

A clean, interactive, and visually premium finance dashboard built for the **Zorvyn Frontend Developer Intern** assignment. Track financial activity, explore transactions, manage multiple accounts, and gain spending insights — all from a beautiful, responsive interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-purple?logo=framer)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

> **Note:** If you see stale data from a previous version, clear localStorage: open browser DevTools → Application → Local Storage → delete `finance-dashboard-storage`.

---

## ✨ Features

### 📊 Dashboard Overview
- **Summary Cards** — Total Balance, Income, Expenses, and Savings Rate with animated glassmorphism design
- **Balance Trend Chart** — Area chart showing income vs expenses over 6 months (Recharts)
- **Spending Breakdown** — Interactive donut chart categorizing expenses
- **Account Overview** — Quick view of all accounts with budget progress bars
- **Recent Transactions** — Quick view of the latest 5 transactions

### 💳 Transactions Section
- Full list of 67 realistic transactions (Indian context)
- **Search** by description or category
- **Filter** by account, category, type (income/expense)
- **Sort** by date, amount, or category (asc/desc)
- **Pagination** with 10 items per page
- **Add / Edit / Delete** transactions (Admin role only)
- **Custom Calendar Picker** — Custom-built date picker replacing native HTML input
- **Category Pill Selector** — Visual pill-based category selection in transaction form
- **Account Selector** — Choose which account to associate with each transaction
- **CSV Export** — Download filtered transactions as CSV

### 🏦 Accounts System (NEW)
- **Multiple Accounts** — Create accounts for different uses (Bills, Food, Travel, etc.)
- **Default Account** — One account is always marked as default
- **Account-Level Budgets** — Set monthly budget per account
- **Budget Progress Tracking** — Visual progress bars showing budget usage
- **90% Budget Alert** — Simulated email alert notification when spending reaches 90% of budget
- **Budget Exceeded Warning** — Warning when budget is over 100%
- **Notification Bell** — Real-time notification badge in header with budget alerts
- **CRUD Operations** — Create, edit, and delete accounts (Admin only)

### 🔐 Role-Based UI (RBAC Simulation)
- **Admin**: Full CRUD access — add, edit, delete transactions and accounts
- **Viewer**: Read-only mode with informational banner
- **Animated Toggle Switch** — Beautiful role toggle component in the header with sliding pill animation
- **Mobile Support** — Role toggle available in profile dropdown on mobile
- No backend required — roles are simulated on the frontend

### 📈 Insights Section
- **Highest Spending Category** — Identifies where most money goes
- **Average Daily Spend** — Calculated across all expense data
- **Income : Expense Ratio** — Financial health indicator
- **Spending Trend** — Detects increasing/decreasing/stable patterns
- **Highest Expense Month** — Month with maximum outflow
- **Top Categories Chart** — Horizontal bar chart of spending
- **Monthly Comparison** — Grouped bar chart (income vs expenses)

### 🎨 UI/UX Highlights
- **Dark/Light Mode** — Toggle from sidebar, persisted in localStorage
- **Glassmorphism Design** — Premium card aesthetics with blur effects
- **Framer Motion Animations** — Page transitions, card hover effects, list animations
- **Custom UI Components** — Toggle switches, role toggles, calendar picker, pill selectors
- **Responsive Design** — Works on mobile (375px), tablet (768px), and desktop (1440px+)
- **Collapsible Sidebar** — Maximizes content area on smaller screens
- **Empty State Handling** — Graceful fallbacks when no data/no results
- **Custom Scrollbars** — Styled to match the theme
- **Notification System** — Budget alerts appear as notifications in the header bell

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Framework & routing |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Zustand** | State management (with persist middleware) |
| **Recharts** | Data visualizations (charts) |
| **Framer Motion** | Animations & transitions |
| **Lucide React** | Icon library |
| **Inter** (Google Fonts) | Typography |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Design system (themes, animations, utilities)
│   ├── layout.tsx           # Root layout with font + metadata
│   └── page.tsx             # Main page with SPA-style routing
├── components/
│   ├── layout/              # AppShell, Sidebar, Header
│   ├── dashboard/           # SummaryCards, Charts, AccountOverview, RecentTransactions
│   ├── transactions/        # TransactionList, Filters, Modal (with Calendar)
│   ├── insights/            # TopCategories, MonthlyComparison, SpendingInsights
│   ├── pages/               # DashboardPage, TransactionsPage, AccountsPage, InsightsPage, SettingsPage
│   └── common/              # EmptyState, Badge, ToggleSwitch, RoleToggle
├── store/
│   └── useStore.ts          # Zustand store (transactions, accounts, budgetAlerts, role, theme, filters)
├── types/
│   └── index.ts             # TypeScript interfaces (Account, BudgetAlert, etc.)
├── data/
│   └── mockData.ts          # 67 realistic mock transactions + 4 default accounts
└── utils/
    ├── formatters.ts        # Currency, date, percentage formatters
    └── calculations.ts      # Financial aggregations & analytics
```

---

## 🧠 Approach & Design Decisions

### State Management
- **Zustand** with `persist` middleware stores transactions, accounts, budget alerts, role, and theme in `localStorage`
- Accounts support full CRUD with budget tracking per account
- Budget alerts are auto-generated when monthly expenses reach 90% of an account's budget
- Filters include account-based filtering alongside category and type

### UI Architecture
- Single-page app feel using Zustand's `activePage` state instead of Next.js file-based routing
- Components are organized by feature domain (dashboard, transactions, insights, accounts)
- Custom reusable UI components: `ToggleSwitch`, `RoleToggle`, `MiniCalendar`, `Badge`, `EmptyState`
- Role toggle uses Framer Motion `layoutId` for smooth sliding animation

### Accounts System
- Users can create multiple accounts for different spending purposes (food, travel, bills, etc.)
- Each account has an icon, color, and optional monthly budget
- Transactions are linked to accounts via `accountId`
- The default account cannot be deleted; if a non-default account is deleted, its transactions are moved to the default account
- Budget alerts simulate email notifications (frontend-only) with dismiss functionality

### Budget Alert System
- When monthly expenses for any account reach 90% of its budget, a visual alert is triggered
- Alerts appear as notification badges in the header bell icon
- Alerts also appear as banner notifications on the Accounts page
- Shows simulated "email alert would be sent" message
- Users can dismiss alerts individually

### Responsiveness
- Mobile-first approach with Tailwind responsive breakpoints
- Sidebar collapses to icon-only on toggle, hamburger menu on mobile
- Cards stack vertically on small screens, grid on larger screens
- Role toggle moves to profile dropdown on mobile

### Data
- 67 realistic transactions in Indian context (INR currency)
- Spans 6 months (Oct 2025 – Mar 2026)
- Diverse categories covering income and expenses
- 4 default accounts (Main, Food & Dining, Travel, Bills & Utilities)

### RBAC
- Frontend-only simulation — no auth/backend needed
- Role stored in Zustand and persisted
- UI conditionally renders add/edit/delete controls based on role
- Admin vs Viewer toggle with premium animated switch component

---

## 📋 Assumptions

1. This is a frontend-only project — no backend or API integration required
2. Data is seeded via mock data; new data persists in localStorage
3. Currency is Indian Rupee (₹) formatted with en-IN locale
4. Role switching is a demonstration feature — no actual authentication
5. Charts use Recharts for React-native integration support
6. Budget email alerts are simulated on the frontend — no actual emails are sent
7. Account budgets are monthly (resets conceptually each month)

---

## 🔮 Optional Enhancements Implemented

- ✅ Dark/Light mode with persistence
- ✅ Data persistence via localStorage (Zustand persist)
- ✅ Smooth animations & transitions (Framer Motion)
- ✅ CSV export for transactions
- ✅ Empty state handling
- ✅ Responsive across all screen sizes
- ✅ Custom calendar component (replaces native date picker)
- ✅ Account-based budget tracking with 90% threshold alerts
- ✅ Notification system for budget alerts
- ✅ Multiple financial accounts management

---

## 👤 Author

**Vikash Pal**  
📧 vs700034@gmail.com

Built for the Zorvyn Finance Dashboard UI Assignment — Frontend Developer Intern.

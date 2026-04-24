"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Lightbulb,
  Settings,
  ChevronLeft,
  Moon,
  Sun,
  Plus,
  HelpCircle,
  LogOut,
  Wallet,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import SignOutModal from "@/components/ui/SignOutModal";

const navItems: { route: string; label: string; icon: React.ReactNode }[] = [
  {
    route: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    route: "/transactions",
    label: "Transactions",
    icon: <ArrowLeftRight size={20} />,
  },
  { route: "/accounts", label: "Accounts", icon: <Wallet size={20} /> },
  { route: "/insights", label: "Insights", icon: <Lightbulb size={20} /> },
  { route: "/settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    theme,
    toggleTheme,
    budgetAlerts,
  } = useStore();
  const [showSignOut, setShowSignOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const activeAlerts = budgetAlerts.filter((a) => !a.dismissed);

  const handleNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setSidebarOpen(false);
  };

  const openAddTransaction = () => {
    if (pathname !== "/transactions") {
      router.push("/transactions");
      setTimeout(() => {
        if (typeof window !== "undefined")
          window.dispatchEvent(new CustomEvent("openAddTransaction"));
      }, 100);
    } else {
      if (typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("openAddTransaction"));
    }
    if (typeof window !== "undefined" && window.innerWidth < 768)
      toggleSidebar();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full flex flex-col border-r transition-all duration-300 bg-[var(--dropdown-bg)] md:bg-[var(--sidebar-bg)] ${
          sidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full w-64 md:translate-x-0 md:w-20"
        }`}
        style={{
          borderColor: "var(--glass-border)",
        }}
      >
        {/* Logo */}
        <div
          className={`relative flex items-center h-16 border-b transition-all duration-300 ${sidebarOpen ? "px-4" : "justify-center"}`}
          style={{ borderColor: "var(--glass-border)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
              <span className="text-white font-bold text-sm">₹</span>
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap cursor-pointer"
                  onClick={() => router.push(`dashboard`)}
                >
                  <h1 className="text-lg font-bold gradient-text tracking-tight">
                    RupeeTrack
                  </h1>
                  <p className="text-[10px] text-[var(--muted)] -mt-0.5 tracking-widest uppercase">
                    Personal Finance
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={toggleSidebar}
            className="absolute -right-[13px] p-1 rounded-full border bg-[var(--background)] transition-colors hover:bg-[var(--surface-hover)] hidden md:flex z-50 shadow-sm"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft size={16} className="text-[var(--muted)]" />
            </motion.div>
          </button>
        </div>

        {/* New Transaction Button */}
        {/* <div className="px-3 pt-4 pb-2">
          {sidebarOpen ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openAddTransaction}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
            >
              <Plus size={18} />
              New Transaction
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddTransaction}
              className="w-full flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
              title="New Transaction"
            >
              <Plus size={18} />
            </motion.button>
          )}
        </div> */}

        {/* Navigation */}
        <nav className="flex-1 py-2 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.route;
            const hasAlert =
              item.route === "/accounts" && activeAlerts.length > 0;
            return (
              <Link
                key={item.route}
                href={item.route}
                onClick={handleNavClick}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute left-0 w-[3px] h-6 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="flex-shrink-0 relative">
                  {item.icon}
                  {hasAlert && !sidebarOpen && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-expense rounded-full ring-2 ring-[var(--sidebar-bg)]" />
                  )}
                </span>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap flex-1 text-left"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {hasAlert && sidebarOpen && (
                  <span className="w-5 h-5 rounded-full bg-expense/10 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-expense">
                      {activeAlerts.length}
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Controls */}
        <div
          className="p-3 border-t space-y-1"
          style={{ borderColor: "var(--glass-border)" }}
        >
          {/* Theme Toggle */}
          <button
            onClick={() => {
              toggleTheme();
              if (typeof window !== "undefined" && window.innerWidth < 768)
                setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--surface-hover)] ${
              sidebarOpen ? "w-full" : "w-full justify-center"
            }`}
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-amber-400 flex-shrink-0" />
            ) : (
              <Moon size={18} className="text-orange-400 flex-shrink-0" />
            )}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap text-[var(--muted)] text-sm"
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Support */}
          <button
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--surface-hover)] text-[var(--muted)] ${
              sidebarOpen ? "w-full" : "w-full justify-center"
            }`}
          >
            <HelpCircle size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Support
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Sign Out */}
          <button
            onClick={() => {
              setShowSignOut(true);
              if (typeof window !== "undefined" && window.innerWidth < 768)
                setSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-expense/10 text-[var(--muted)] hover:text-expense ${
              sidebarOpen ? "w-full" : "w-full justify-center"
            }`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>

      {/* Sign Out Modal */}
      <SignOutModal
        isOpen={showSignOut}
        onClose={() => setShowSignOut(false)}
      />
    </>
  );
}

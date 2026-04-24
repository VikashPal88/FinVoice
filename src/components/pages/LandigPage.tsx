"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Camera,
  Mic,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
  IndianRupee,
  PieChart,
  Bell,
  Lock,
  Brain,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";

// Helper Button component to resolve missing component error
const Button = ({
  className = "",
  variant = "default",
  size = "default",
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-muted text-foreground",
    outline:
      "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      {...props}
    />
  );
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features2 = [
  {
    icon: <Wallet className="w-6 h-6" />,
    title: "Manual Entry",
    description:
      "Quick forms optimized for UPI, card, and cash transactions with smart category detection.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: <Camera className="w-6 h-6" />,
    title: "Receipt Scanner",
    description:
      "Snap a photo of any receipt — AI extracts amount, vendor, and category automatically.",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "Voice Input",
    description:
      '"Spent 450 on Swiggy dinner" — just speak naturally and we\'ll log it for you.',
    gradient: "from-amber-500 to-orange-400",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Advanced Analytics",
    description:
      "Monthly trends, category breakdowns, savings rate, and spending predictions at a glance.",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Budget Alerts",
    description:
      "Set monthly budgets and get notified at 50%, 75%, and 90% thresholds before overspending.",
    gradient: "from-red-500 to-rose-400",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Bank-Grade Security",
    description:
      "End-to-end encryption, Arcjet protection against bots & attacks, and secure authentication.",
    gradient: "from-orange-500 to-amber-400",
  },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Tracking",
    description:
      "Our intelligent system learns your spending patterns and automatically categorizes transactions for effortless money management.",
    color: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/20",
  },
  {
    icon: Smartphone,
    title: "Multi-Input Methods",
    description:
      "Add transactions via voice commands, receipt scanning, manual entry, or bulk import from bank statements. Tracking money has never been easier.",
    color: "from-blue-500 to-cyan-600",
    bgGlow: "bg-blue-500/20",
  },
  {
    icon: TrendingUp,
    title: "Smart Analytics",
    description:
      "Get powerful insights into your spending habits with beautiful charts, trend analysis, and personalized recommendations to save more.",
    color: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/20",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "Your financial data is encrypted with AES-256 and protected with multi-layer security. We never store your banking credentials.",
    color: "from-orange-500 to-red-600",
    bgGlow: "bg-orange-500/20",
  },
];

const stats = [
  { label: "Active Users", value: "2M+", icon: Sparkles },
  { label: "Transactions Tracked", value: "500M+", icon: Zap },
  { label: "Money Saved", value: "Rs 2,000Cr+", icon: TrendingUp },
  { label: "UPI Payments", value: "1B+", icon: BarChart3 },
];

export default function LandingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <motion.div
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          animate={{
            x: [0, 100, 200, 100, 0],
            y: [0, 150, 50, 200, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute right-20 w-3 h-3 bg-primary/20 rounded-full"
          animate={{
            x: [0, -100, -50, -150, 0],
            y: [0, 100, 250, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-6 lg:px-12 h-16"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg  bg-gradient-to-br from-orange-500 to-orange-600  text-white font-bold text-lg">
            Rs
          </div>
          <span className="font-bold text-lg tracking-tight">RupeeTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant=""
            onClick={() => router.push("/sign-in")}
            className="bg-none bg-transparent text-white hover:bg-white hover:text-black cursor-pointer"
          >
            Sign In
          </Button>
          <Button
            onClick={() => router.push("/sign-up")}
            className=" bg-gradient-to-br from-orange-500 to-orange-600  hover:from-orange-600 hover:to-orange-700 text-white cursor-pointer"
          >
            Get Started
          </Button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Made for India
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Track Every{" "}
                <span className=" bg-gradient-to-br from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Rupee
                </span>
                , <br />
                Master Your{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  Money
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                The smartest way to track your UPI payments, expenses, and
                savings. Built for millions of Indians who use digital payments
                every day.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => router.push("/sign-up")}
                  className="gap-2 bg-gradient-to-br from-orange-500 to-orange-600  hover:from-orange-600 hover:to-orange-700 text-white cursor-pointer"
                >
                  Start Tracking Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/sign-in")}
                  className="gap-2 hover:bg-gray-800 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Secure Login
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-primary/10 mb-2">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Feature Carousel */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative"
            >
              {/* Phone Mockup */}
              <div className="relative mx-auto w-[280px] h-[560px] bg-card rounded-[2.5rem] border-4 border-border shadow-2xl overflow-hidden">
                {/* Phone Screen Content */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#121212] to-[#1E1E1E]">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-6 pt-3 pb-2">
                    <span className="text-xs font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full bg-primary/20" />
                      <div className="w-4 h-4 rounded-full bg-primary/20" />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600  flex items-center justify-center text-white text-xs font-bold">
                        Rs
                      </div>
                      <span className="font-semibold text-sm">RupeeTrack</span>
                    </div>

                    {/* Balance Card */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600  text-white mb-3">
                      <p className="text-xs opacity-80">Total Balance</p>
                      <p className="text-2xl font-bold">Rs 1,24,500</p>
                      <div className="flex gap-4 mt-2">
                        <div>
                          <p className="text-[10px] opacity-80">Income</p>
                          <p className="text-sm font-semibold">+Rs 85,000</p>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-80">Expense</p>
                          <p className="text-sm font-semibold">-Rs 32,400</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mb-3">
                      {["Add", "Scan", "Voice", "Stats"].map((action) => (
                        <div
                          key={action}
                          className="flex-1 p-2 rounded-lg bg-card border border-border text-center"
                        >
                          <div className="w-8 h-8 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-1">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          </div>
                          <p className="text-[10px]">{action}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recent Transactions */}
                    <div className="px-1">
                      <p className="text-xs font-medium mb-2">Recent</p>
                      {[
                        {
                          name: "Swiggy",
                          amt: "-Rs 450",
                          color: "bg-orange-500",
                        },
                        {
                          name: "Amazon",
                          amt: "-Rs 2,399",
                          color: "bg-blue-500",
                        },
                        {
                          name: "Salary",
                          amt: "+Rs 85,000",
                          color: "bg-emerald-500",
                        },
                      ].map((tx) => (
                        <div
                          key={tx.name}
                          className="flex items-center justify-between py-2 border-b border-border/50"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-full ${tx.color} flex items-center justify-center`}
                            >
                              <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                            </div>
                            <span className="text-xs">{tx.name}</span>
                          </div>
                          <span className="text-xs font-medium">{tx.amt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -right-4 top-20 px-3 py-2 rounded-lg bg-card border border-border shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <p className="text-[10px] text-muted-foreground">
                    Saved this month
                  </p>
                  <p className="text-sm font-bold text-emerald-500">
                    Rs 12,500
                  </p>
                </motion.div>

                <motion.div
                  className="absolute -left-8 bottom-32 px-3 py-2 rounded-lg bg-card border border-border shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        AI Insight
                      </p>
                      <p className="text-xs font-medium">Spending up 12%</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20 bg-[#111111]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-br from-orange-500 to-orange-600  bg-clip-text text-transparent">
                RupeeTrack
              </span>
              ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Indian users who make UPI payments daily.
              Track, analyze, and optimize your finances effortlessly.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer`}
                onClick={() => setCurrentSlide(i)}
              >
                <div
                  className={`absolute inset-0 rounded-2xl ${feature.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
                <div
                  className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="relative font-semibold mb-2">{feature.title}</h3>
                <p className="relative text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Active Feature Detail */}
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-8 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-start gap-6">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${features[currentSlide].color} flex items-center justify-center shrink-0`}
              >
                {(() => {
                  const Icon = features[currentSlide].icon;
                  return <Icon className="w-8 h-8 text-white" />;
                })()}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {features[currentSlide].title}
                </h3>
                <p className="text-muted-foreground">
                  {features[currentSlide].description}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[var(--glass-border)]">
        <h1 className="text-center text-5xl font-bold">How It Works</h1>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4 text-gray-100/60 mt-2">
              Simple as <span className="gradient-text">1-2-3</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up with email, Google, or GitHub in seconds.",
                icon: <Wallet className="w-8 h-8 text-orange-400" />,
              },
              {
                step: "02",
                title: "Add Transactions",
                desc: "Use form, scan receipts, or speak — whichever is fastest.",
                icon: <TrendingUp className="w-8 h-8 text-amber-400" />,
              },
              {
                step: "03",
                title: "Get Insights",
                desc: "View trends, category breakdowns, and budget status instantly.",
                icon: <PieChart className="w-8 h-8 text-cyan-400" />,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative text-center p-8 rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-5xl font-black text-[var(--surface-hover)] absolute top-4 right-6 select-none">
                  {item.step}
                </div>
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-[var(--muted-foreground)] text-sm">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-[var(--muted-foreground)] text-lg mb-8 max-w-xl mx-auto">
              Join thousands of Indians who are tracking every UPI payment,
              every card swipe, and every cash expense — effortlessly.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:scale-[1.02]"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--glass-border)] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">₹</span>
            </div>
            <span className="font-semibold text-[var(--foreground)]">
              RupeeTrack
            </span>
          </div>
          <p>© {new Date().getFullYear()} RupeeTrack. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span>Protected by Arcjet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

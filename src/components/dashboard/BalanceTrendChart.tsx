"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getMonthlySummaries } from "@/utils/calculations";
import { formatCurrency, formatMonth } from "@/utils/formatters";

export default function BalanceTrendChart({ accounts }: { accounts: any[] }) {
  const transactions =
    accounts?.flatMap(
      (a: any) =>
        a.transactions?.map((t: any) => ({
          ...t,
          type: t.type.toLowerCase(),
          accountId: a.id,
        })) || [],
    ) || [];

  const summaries = getMonthlySummaries(transactions);
  const data = summaries.slice(-8).map((s) => ({
    ...s,
    monthLabel: formatMonth(s.month),
    profit: s.income,
    loss: s.expenses,
  }));

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-500">{entry.name}:</span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="dash-card p-5"
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Total Income
          </h3>
          <p className="text-xs text-[var(--muted)]">
            View your income in a certain period of time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <div className="w-2.5 h-2.5 rounded-sm bg-accent-orange" />
            Profit
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            Loss
          </div>
        </div>
      </div>

      <div className="h-[200px] sm:h-[240px] md:h-[280px] lg:h-[300px] mt-4">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: -10 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(249, 115, 22, 0.05)" }}
              />
              <Bar
                dataKey="profit"
                name="Profit"
                fill="#F97316"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="loss"
                name="Loss"
                fill="#1F2937"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

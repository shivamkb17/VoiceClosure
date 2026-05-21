"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  gradient: string;
  index?: number;
}

export default function StatsCard({ label, value, change, icon: Icon, gradient, index = 0 }: StatsCardProps) {
  const isPositive = change.startsWith("+");
  const isNeutral = change === "+0%" || change === "0%";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.1 + index * 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
      className="group relative rounded-2xl glass border-glow p-5 hover:bg-white/[0.06] transition-all duration-500 overflow-hidden"
    >
      {/* Hover glow */}
      <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {!isNeutral && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              isPositive
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-red-400 bg-red-500/10"
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </span>
          )}
        </div>
        <div className="text-2xl font-bold mb-1 tracking-tight">{value}</div>
        <div className="text-sm text-muted">{label}</div>
      </div>
    </motion.div>
  );
}

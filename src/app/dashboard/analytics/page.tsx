"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Phone,
  Users,
  CalendarCheck,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

export default function AnalyticsPage() {
  const mockData = {
    callsThisWeek: [12, 8, 15, 10, 18, 22, 14],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  };
  const maxVal = Math.max(...mockData.callsThisWeek);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">Analytics</span>
        </h1>
        <p className="text-muted text-sm">Deep insights into your AI performance</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Avg. Call Duration", value: "2m 34s", icon: Clock, gradient: "from-blue-500 to-cyan-400" },
          { label: "Lead Conversion", value: "0%", icon: TrendingUp, gradient: "from-emerald-500 to-teal-400" },
          { label: "Response Rate", value: "100%", icon: Zap, gradient: "from-indigo-500 to-blue-400" },
          { label: "Satisfaction", value: "—", icon: Users, gradient: "from-violet-500 to-purple-400" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="rounded-xl glass border-glow p-4"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${kpi.gradient} flex items-center justify-center mb-3`}>
              <kpi.icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-bold">{kpi.value}</div>
            <div className="text-xs text-muted">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl glass border-glow p-6 mb-8"
      >
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-indigo" />
          Calls This Week
        </h3>
        <div className="flex items-end gap-3 h-48">
          {mockData.callsThisWeek.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(val / maxVal) * 100}%` }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                className="w-full rounded-t-lg bg-gradient-to-t from-brand-indigo to-brand-purple min-h-[4px] relative group"
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-2 py-0.5 rounded">
                  {val}
                </div>
              </motion.div>
              <span className="text-[10px] text-muted-foreground">{mockData.days[i]}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl glass border-glow p-6 text-center"
      >
        <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-1">More Analytics Coming Soon</h3>
        <p className="text-sm text-muted max-w-md mx-auto">
          Detailed conversion funnels, sentiment analysis breakdowns, peak hour reports, and agent performance comparisons.
        </p>
      </motion.div>
    </div>
  );
}

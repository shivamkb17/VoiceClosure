"use client";

import { motion } from "framer-motion";
import { Phone, Users, Clock, Zap, TrendingUp, BarChart3 } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

interface Conversation {
  id: string;
  duration: number;
  sentiment: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  status: string;
  created_at: string;
}

interface VoiceAgent {
  id: string;
  is_active: boolean;
  total_calls: number;
}

export default function AdminAnalyticsView({
  conversations,
  leads,
  agents,
}: {
  conversations: Conversation[];
  leads: Lead[];
  agents: VoiceAgent[];
}) {
  const avgDuration = conversations.length > 0 
    ? Math.round(conversations.reduce((sum, c) => sum + (c.duration || 0), 0) / conversations.length)
    : 0;

  const activeAgents = agents.filter(a => a.is_active).length;

  const qualifiedLeads = leads.filter(l => l.status === "qualified" || l.status === "converted").length;
  const leadConvRate = leads.length > 0 ? ((qualifiedLeads / leads.length) * 100).toFixed(0) : "0";

  const stats = [
    { label: "Global AI Calls Handled", value: String(conversations.length), change: "Lifetime system volume", icon: Phone, gradient: "from-blue-500 to-cyan-400" },
    { label: "Global Lead Conversion", value: `${leadConvRate}%`, change: "Qualified/converted pipeline status", icon: TrendingUp, gradient: "from-emerald-500 to-teal-400" },
    { label: "Average Call Duration", value: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`, change: "AI response session length", icon: Clock, gradient: "from-indigo-500 to-blue-400" },
    { label: "Active Voice Agents", value: `${activeAgents} / ${agents.length}`, change: "Currently active receiver configurations", icon: Zap, gradient: "from-violet-500 to-purple-400" },
  ];

  // System usage distribution mock data
  const hours = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);
  const mockCallsDistribution = [8, 12, 19, 25, 45, 60, 52, 40, 30, 20, 15, 5];
  const maxCalls = Math.max(...mockCallsDistribution);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">System Analytics</span>
        </h1>
        <p className="text-muted text-sm">Real-time global system utilization metrics, session charts, and agent activities</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, i) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            gradient={stat.gradient}
            index={i}
          />
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
          Hourly Traffic Distribution (UTC)
        </h3>
        <div className="flex items-end gap-2.5 h-48">
          {mockCallsDistribution.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(val / maxCalls) * 100}%` }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                className="w-full rounded-t bg-gradient-to-t from-brand-indigo to-brand-purple min-h-[4px] relative group"
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-2 py-0.5 rounded whitespace-nowrap">
                  {val} calls
                </div>
              </motion.div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                {hours[i]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

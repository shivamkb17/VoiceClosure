"use client";

import { motion } from "framer-motion";
import {
  Users,
  Bot,
  Phone,
  CreditCard,
  TrendingUp,
  Crown,
  CalendarCheck,
  BarChart3,
  Activity,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

interface AdminDashboardProps {
  users: Array<{
    id: string;
    email: string | null;
    full_name: string | null;
    subscription_status: string | null;
    stripe_customer_id: string | null;
    created_at: string;
  }>;
  agents: Array<{
    id: string;
    user_id: string;
    name: string;
    is_active: boolean;
    total_calls: number;
    created_at: string;
  }>;
  leads: Array<{
    id: string;
    status: string;
    created_at: string;
  }>;
  appointments: Array<{
    id: string;
    status: string;
    deposit_amount: number;
    payment_status: string;
    created_at: string;
  }>;
  conversations: Array<{
    id: string;
    duration: number;
    created_at: string;
  }>;
}

function getRecentCount(items: Array<{ created_at: string }>, days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return items.filter((i) => new Date(i.created_at) >= cutoff).length;
}

function formatRevenue(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

export default function AdminDashboard({ users, agents, leads, appointments, conversations }: AdminDashboardProps) {
  const paidUsers = users.filter((u) => u.subscription_status && u.subscription_status !== "free");
  const activeAgents = agents.filter((a) => a.is_active);
  const totalRevenue = appointments
    .filter((a) => a.payment_status === "paid")
    .reduce((sum, a) => sum + (a.deposit_amount || 0), 0);
  const totalCalls = conversations.length;
  const newUsersThisWeek = getRecentCount(users, 7);
  const newLeadsThisWeek = getRecentCount(leads, 7);

  const stats = [
    { label: "Total Users", value: String(users.length), change: `+${newUsersThisWeek} this week`, icon: Users, gradient: "from-blue-500 to-cyan-400" },
    { label: "Paid Subscribers", value: String(paidUsers.length), change: `${users.length > 0 ? ((paidUsers.length / users.length) * 100).toFixed(0) : 0}% conversion`, icon: Crown, gradient: "from-amber-500 to-orange-400" },
    { label: "Voice Agents", value: String(agents.length), change: `${activeAgents.length} active`, icon: Bot, gradient: "from-indigo-500 to-blue-400" },
    { label: "Total Calls", value: String(totalCalls), change: `+${getRecentCount(conversations, 7)} this week`, icon: Phone, gradient: "from-purple-500 to-indigo-400" },
    { label: "Revenue", value: formatRevenue(totalRevenue), change: `${appointments.length} bookings`, icon: CreditCard, gradient: "from-emerald-500 to-teal-400" },
    { label: "Total Leads", value: String(leads.length), change: `+${newLeadsThisWeek} this week`, icon: TrendingUp, gradient: "from-violet-500 to-purple-400" },
  ];

  // Subscription distribution
  const subscriptionCounts: Record<string, number> = {};
  users.forEach((u) => {
    const status = u.subscription_status || "free";
    subscriptionCounts[status] = (subscriptionCounts[status] || 0) + 1;
  });

  // Lead status distribution
  const leadStatusCounts: Record<string, number> = {};
  leads.forEach((l) => {
    leadStatusCounts[l.status] = (leadStatusCounts[l.status] || 0) + 1;
  });

  // Recent signups
  const recentUsers = [...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">Admin Dashboard</span>
        </h1>
        <p className="text-muted text-sm">Platform overview and metrics</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 mb-10">
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

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Subscription Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl glass border-glow p-6"
        >
          <h3 className="font-semibold mb-5 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            Subscription Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(subscriptionCounts).map(([status, count]) => {
              const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
              const colors: Record<string, string> = {
                free: "bg-gray-500",
                starter: "bg-blue-500",
                pro: "bg-purple-500",
                agency: "bg-amber-500",
                active: "bg-emerald-500",
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="capitalize font-medium">{status}</span>
                    <span className="text-muted-foreground">{count} users ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${colors[status] || "bg-brand-indigo"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Lead Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl glass border-glow p-6"
        >
          <h3 className="font-semibold mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-indigo" />
            Lead Pipeline
          </h3>
          {leads.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted">No leads data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {["new", "contacted", "qualified", "converted", "lost"].map((status) => {
                const count = leadStatusCounts[status] || 0;
                const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
                const colors: Record<string, string> = {
                  new: "bg-blue-500",
                  contacted: "bg-amber-500",
                  qualified: "bg-purple-500",
                  converted: "bg-emerald-500",
                  lost: "bg-red-500",
                };
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="capitalize font-medium">{status}</span>
                      <span className="text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${colors[status]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="rounded-2xl glass border-glow overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-indigo" />
            Recent Signups
          </h3>
          <a href="/admin/users" className="text-xs text-brand-indigo hover:text-brand-purple transition-colors">
            View All →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-medium">{u.full_name || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      u.subscription_status === "free"
                        ? "text-gray-400 bg-gray-500/10"
                        : "text-emerald-400 bg-emerald-500/10"
                    }`}>
                      {u.subscription_status || "free"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

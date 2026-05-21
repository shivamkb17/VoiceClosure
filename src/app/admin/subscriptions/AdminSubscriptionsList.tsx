"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Search, Users, ExternalLink } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

const PLAN_INFO: Record<string, { name: string; price: string; color: string }> = {
  free: { name: "Free Tier", price: "₹0/mo", color: "from-gray-500 to-slate-400" },
  starter: { name: "Starter Plan", price: "₹1,999/mo", color: "from-blue-500 to-cyan-400" },
  pro: { name: "Pro Plan", price: "₹4,999/mo", color: "from-purple-500 to-indigo-400" },
  agency: { name: "Agency Plan", price: "₹9,999/mo", color: "from-amber-500 to-orange-400" },
};

export default function AdminSubscriptionsList({ users }: { users: UserProfile[] }) {
  const [search, setSearch] = useState("");

  const planCounts = users.reduce((acc, u) => {
    const status = u.subscription_status || "free";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeSubscribersCount = users.filter((u) => u.subscription_status && u.subscription_status !== "free").length;

  const stats = [
    { label: "Active Subscriptions", value: String(activeSubscribersCount), change: `${users.length > 0 ? ((activeSubscribersCount / users.length) * 100).toFixed(0) : 0}% of all users`, icon: Crown, gradient: "from-purple-500 to-indigo-400" },
    { label: "Starter Tiers", value: String(planCounts.starter || 0), change: "Basic usage profiles", icon: Users, gradient: "from-blue-500 to-cyan-400" },
    { label: "Pro / Agency Tiers", value: String((planCounts.pro || 0) + (planCounts.agency || 0)), change: "High volume businesses", icon: Crown, gradient: "from-amber-500 to-orange-400" },
  ];

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const name = u.full_name?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";
    const plan = u.subscription_status?.toLowerCase() || "free";
    return name.includes(term) || email.includes(term) || plan.includes(term);
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">Subscription Plans</span>
        </h1>
        <p className="text-muted text-sm">Monitor subscribers, plans distribution, and subscription tiers</p>
      </motion.div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
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

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or plan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 transition-all"
          />
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass border-glow p-12 text-center">
          <Crown className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No matching subscribers</h2>
          <p className="text-sm text-muted">Try a different search query.</p>
        </motion.div>
      ) : (
        <div className="rounded-2xl glass border-glow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">User</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Email</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Plan Name</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Rate</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Stripe Customer ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((u, i) => {
                  const plan = u.subscription_status || "free";
                  const info = PLAN_INFO[plan] || PLAN_INFO.free;
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4 font-medium text-white">{u.full_name || "—"}</td>
                      <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${info.color}`}>
                          {info.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted font-medium">{info.price}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                        {u.stripe_customer_id ? (
                          <span className="flex items-center gap-1">
                            {u.stripe_customer_id}
                            <ExternalLink className="w-3 h-3 text-brand-indigo" />
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

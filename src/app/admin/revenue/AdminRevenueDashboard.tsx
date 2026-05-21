"use client";

import { motion } from "framer-motion";
import { CreditCard, DollarSign, CalendarCheck, TrendingUp, Search, Calendar } from "lucide-react";
import { useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";

interface AppointmentTransaction {
  id: string;
  deposit_amount: number;
  payment_status: string;
  stripe_payment_id: string | null;
  service_type: string | null;
  created_at: string;
  leads?: {
    customer_name: string | null;
    email: string | null;
  } | null;
}

interface ProfilePlan {
  subscription_status: string | null;
}

const PLAN_PRICES: Record<string, number> = {
  starter: 1999, // ₹1,999/mo
  pro: 4999,    // ₹4,999/mo
  agency: 9999,  // ₹9,999/mo
  free: 0,
};

export default function AdminRevenueDashboard({
  appointments,
  profiles,
}: {
  appointments: AppointmentTransaction[];
  profiles: ProfilePlan[];
}) {
  const [search, setSearch] = useState("");

  const totalDeposits = appointments
    .filter((a) => a.payment_status === "paid")
    .reduce((sum, a) => sum + (a.deposit_amount || 0), 0);

  const totalBookings = appointments.length;
  const successfulBookings = appointments.filter((a) => a.payment_status === "paid").length;

  // Estimated SaaS MRR calculation
  const estimatedMRR = profiles.reduce((sum, p) => {
    const plan = p.subscription_status || "free";
    return sum + (PLAN_PRICES[plan] || 0);
  }, 0);

  const stats = [
    { label: "Estimated SaaS MRR", value: `₹${estimatedMRR.toLocaleString("en-IN")}`, change: "Recurrent subscriptions", icon: DollarSign, gradient: "from-blue-500 to-cyan-400" },
    { label: "Booking Deposits Collected", value: `₹${totalDeposits.toLocaleString("en-IN")}`, change: "One-off client payments", icon: CreditCard, gradient: "from-emerald-500 to-teal-400" },
    { label: "Successful Bookings", value: String(successfulBookings), change: `Out of ${totalBookings} total attempts`, icon: CalendarCheck, gradient: "from-indigo-500 to-blue-400" },
  ];

  const filtered = appointments.filter((a) => {
    const query = search.toLowerCase();
    const leadName = a.leads?.customer_name?.toLowerCase() || "";
    const leadEmail = a.leads?.email?.toLowerCase() || "";
    const stripeId = a.stripe_payment_id?.toLowerCase() || "";
    const serviceType = a.service_type?.toLowerCase() || "";
    return leadName.includes(query) || leadEmail.includes(query) || stripeId.includes(query) || serviceType.includes(query);
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">Revenue & Billing</span>
        </h1>
        <p className="text-muted text-sm">Platform subscription metrics and booking payment receipts</p>
      </motion.div>

      {/* KPI Cards */}
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

      {/* Search & Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-indigo" />
          Transaction History
        </h3>
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 transition-all"
          />
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass border-glow p-12 text-center">
          <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No matching transactions</h2>
          <p className="text-sm text-muted">Try adjusting your filter search.</p>
        </motion.div>
      ) : (
        <div className="rounded-2xl glass border-glow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Lead</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Service Type</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Stripe Charge ID</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-medium text-white">{item.leads?.customer_name || "—"}</div>
                        {item.leads?.email && (
                          <div className="text-xs text-muted-foreground mt-0.5">{item.leads.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">{item.service_type || "Deposit"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {item.stripe_payment_id || "—"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      ₹{(item.deposit_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        item.payment_status === "paid"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-amber-400 bg-amber-500/10"
                      }`}>
                        {item.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(item.created_at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

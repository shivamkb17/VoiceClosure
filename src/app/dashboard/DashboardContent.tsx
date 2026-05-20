"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Phone,
  CalendarCheck,
  CreditCard,
  Users,
  TrendingUp,
  LogOut,
  ArrowRight,
  Mic,
  Clock,
  BarChart3,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";

interface DashboardUser {
  email: string;
  fullName: string;
  businessName: string | null;
  avatarUrl: string | null;
  subscriptionStatus: string;
}

const stats = [
  {
    label: "Total Calls",
    value: "0",
    change: "+0%",
    icon: Phone,
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    label: "Appointments",
    value: "0",
    change: "+0%",
    icon: CalendarCheck,
    gradient: "from-indigo-500 to-blue-400",
  },
  {
    label: "Revenue",
    value: "₹0",
    change: "+0%",
    icon: CreditCard,
    gradient: "from-purple-500 to-indigo-400",
  },
  {
    label: "Leads",
    value: "0",
    change: "+0%",
    icon: Users,
    gradient: "from-violet-500 to-purple-400",
  },
];

export default function DashboardContent({ user }: { user: DashboardUser }) {
  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="border-b border-border px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Voice<span className="gradient-text-static">Closer</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted hidden sm:block">{user.email}</span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text-static">{user.fullName.split(" ")[0]}</span>
          </h1>
          <p className="text-muted">
            {user.businessName
              ? `Managing ${user.businessName}`
              : "Here's your AI receptionist overview."}
          </p>
        </motion.div>

        {/* Plan Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass border-glow">
            <TrendingUp className="w-4 h-4 text-brand-indigo" />
            <span className="text-sm">
              Plan:{" "}
              <span className="font-semibold text-brand-indigo capitalize">
                {user.subscriptionStatus}
              </span>
            </span>
            {user.subscriptionStatus === "free" && (
              <Link
                href="/pricing"
                className="ml-2 text-xs text-brand-purple hover:text-brand-violet transition-colors"
              >
                Upgrade →
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2 + i * 0.1,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              className="rounded-2xl glass border-glow p-6 hover:bg-white/[0.06] transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-emerald-400 font-medium">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/demo"
              className="group rounded-2xl glass border-glow p-6 hover:bg-white/[0.06] transition-all duration-500 hover:scale-[1.02]"
            >
              <Mic className="w-8 h-8 text-brand-indigo mb-4" />
              <h3 className="font-semibold mb-2 group-hover:text-white transition-colors">
                Try AI Demo
              </h3>
              <p className="text-sm text-muted mb-4">
                Test your AI receptionist with live voice scenarios.
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-brand-indigo group-hover:text-brand-purple transition-colors">
                Start Demo
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <div className="rounded-2xl glass border-glow p-6 opacity-60">
              <Clock className="w-8 h-8 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Appointments</h3>
              <p className="text-sm text-muted mb-4">
                View and manage your upcoming appointments.
              </p>
              <span className="text-sm text-muted-foreground">Coming soon</span>
            </div>

            <div className="rounded-2xl glass border-glow p-6 opacity-60">
              <BarChart3 className="w-8 h-8 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted mb-4">
                Deep insights into your AI conversations and conversions.
              </p>
              <span className="text-sm text-muted-foreground">Coming soon</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

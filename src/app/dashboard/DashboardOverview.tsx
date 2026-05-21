"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Phone,
  CalendarCheck,
  Users,
  Bot,
  ArrowRight,
  Mic,
  MessageSquare,
  Clock,
  TrendingUp,
  Plus,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

interface DashboardOverviewProps {
  user: {
    fullName: string;
    businessName: string | null;
    subscriptionStatus: string;
  };
  stats: {
    totalCalls: number;
    totalLeads: number;
    totalAppointments: number;
    totalAgents: number;
    activeAgents: number;
  };
  recentConversations: Array<{
    id: string;
    ai_summary: string | null;
    duration: number;
    scenario: string | null;
    sentiment: string | null;
    created_at: string;
  }>;
  recentLeads: Array<{
    id: string;
    customer_name: string | null;
    email: string | null;
    intent: string | null;
    status: string;
    created_at: string;
  }>;
}

const statCards = [
  { label: "Total Calls", key: "totalCalls" as const, icon: Phone, gradient: "from-blue-500 to-cyan-400" },
  { label: "Voice Agents", key: "totalAgents" as const, icon: Bot, gradient: "from-indigo-500 to-blue-400" },
  { label: "Leads Captured", key: "totalLeads" as const, icon: Users, gradient: "from-purple-500 to-indigo-400" },
  { label: "Appointments", key: "totalAppointments" as const, icon: CalendarCheck, gradient: "from-violet-500 to-purple-400" },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sentimentColor(sentiment: string | null): string {
  if (sentiment === "positive") return "text-emerald-400 bg-emerald-500/10";
  if (sentiment === "negative") return "text-red-400 bg-red-500/10";
  return "text-amber-400 bg-amber-500/10";
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "text-blue-400 bg-blue-500/10",
    contacted: "text-amber-400 bg-amber-500/10",
    qualified: "text-purple-400 bg-purple-500/10",
    converted: "text-emerald-400 bg-emerald-500/10",
    lost: "text-red-400 bg-red-500/10",
  };
  return colors[status] || "text-muted bg-white/5";
}

export default function DashboardOverview({ user, stats, recentConversations, recentLeads }: DashboardOverviewProps) {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          Welcome back, <span className="gradient-text-static">{user.fullName.split(" ")[0]}</span>
        </h1>
        <p className="text-muted text-sm lg:text-base">
          {user.businessName ? `Managing ${user.businessName}` : "Here's your AI receptionist overview."}
        </p>
      </motion.div>

      {/* Plan badge */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }} className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass border-glow">
          <TrendingUp className="w-4 h-4 text-brand-indigo" />
          <span className="text-sm">
            Plan:{" "}
            <span className="font-semibold text-brand-indigo capitalize">{user.subscriptionStatus}</span>
          </span>
          {user.subscriptionStatus === "free" && (
            <Link href="/pricing" className="ml-2 text-xs text-brand-purple hover:text-brand-violet transition-colors">
              Upgrade →
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-10">
        {statCards.map((card, i) => (
          <StatsCard
            key={card.label}
            label={card.label}
            value={String(stats[card.key])}
            change="+0%"
            icon={card.icon}
            gradient={card.gradient}
            index={i}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-10"
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/agents/new"
            className="group rounded-2xl glass border-glow p-5 hover:bg-white/[0.06] transition-all duration-500 hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold mb-1.5 group-hover:text-white transition-colors">Create Voice Agent</h3>
            <p className="text-sm text-muted mb-3">Build a custom AI receptionist for your business.</p>
            <span className="inline-flex items-center gap-1 text-sm text-brand-indigo group-hover:text-brand-purple transition-colors">
              Get Started <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/demo"
            className="group rounded-2xl glass border-glow p-5 hover:bg-white/[0.06] transition-all duration-500 hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center mb-4">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold mb-1.5 group-hover:text-white transition-colors">Try AI Demo</h3>
            <p className="text-sm text-muted mb-3">Test with live voice scenarios and see it in action.</p>
            <span className="inline-flex items-center gap-1 text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors">
              Start Demo <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/dashboard/leads"
            className="group rounded-2xl glass border-glow p-5 hover:bg-white/[0.06] transition-all duration-500 hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold mb-1.5 group-hover:text-white transition-colors">View Leads</h3>
            <p className="text-sm text-muted mb-3">Manage and track all captured leads.</p>
            <span className="inline-flex items-center gap-1 text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
              View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </motion.div>

      {/* Two-column: Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl glass border-glow overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-indigo" />
              Recent Conversations
            </h3>
            <Link href="/dashboard/calls" className="text-xs text-brand-indigo hover:text-brand-purple transition-colors">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentConversations.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start a demo or create a voice agent to get started</p>
              </div>
            ) : (
              recentConversations.map((conv) => (
                <div key={conv.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{conv.ai_summary || conv.scenario || "Conversation"}</span>
                    {conv.sentiment && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sentimentColor(conv.sentiment)}`}>
                        {conv.sentiment}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(conv.duration)}
                    </span>
                    <span>{formatDate(conv.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="rounded-2xl glass border-glow overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-purple" />
              Recent Leads
            </h3>
            <Link href="/dashboard/leads" className="text-xs text-brand-indigo hover:text-brand-purple transition-colors">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentLeads.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted">No leads captured yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your AI agents will capture leads automatically</p>
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{lead.customer_name || "Unknown"}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {lead.intent && <span className="truncate max-w-[180px]">{lead.intent}</span>}
                    <span>{formatDate(lead.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

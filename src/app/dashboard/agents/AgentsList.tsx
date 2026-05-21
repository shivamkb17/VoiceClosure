"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, Plus, Phone, Users, Power, PowerOff, MoreVertical, ArrowRight } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  business_type: string | null;
  greeting: string;
  personality: string;
  voice_id: string;
  is_active: boolean;
  total_calls: number;
  total_leads: number;
  created_at: string;
}

const personalityColors: Record<string, string> = {
  professional: "from-blue-500 to-cyan-400",
  friendly: "from-emerald-500 to-teal-400",
  enthusiastic: "from-pink-500 to-rose-400",
  calm: "from-violet-500 to-purple-400",
  authoritative: "from-amber-500 to-orange-400",
};

export default function AgentsList({ agents }: { agents: Agent[] }) {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
            <span className="gradient-text-static">Voice Agents</span>
          </h1>
          <p className="text-muted text-sm">Create and manage your AI receptionists</p>
        </div>
        <Link
          href="/dashboard/agents/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-sm font-medium hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </Link>
      </motion.div>

      {agents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl glass border-glow p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-indigo/20 to-brand-purple/20 border border-brand-indigo/20 flex items-center justify-center mx-auto mb-5">
            <Bot className="w-8 h-8 text-brand-indigo" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Voice Agents Yet</h2>
          <p className="text-muted text-sm max-w-md mx-auto mb-6">
            Create your first AI receptionist to start handling calls, capturing leads, and booking appointments automatically.
          </p>
          <Link
            href="/dashboard/agents/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-medium hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Create Your First Agent
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {agents.map((agent, i) => {
            const gradient = personalityColors[agent.personality] || "from-indigo-500 to-blue-400";
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                className="group rounded-2xl glass border-glow p-5 hover:bg-white/[0.06] transition-all duration-500 relative overflow-hidden"
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${agent.is_active ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                  <span className={`text-[10px] font-medium ${agent.is_active ? "text-emerald-400" : "text-red-400"}`}>
                    {agent.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <Bot className="w-6 h-6 text-white" />
                </div>

                <h3 className="font-semibold text-lg mb-1">{agent.name}</h3>
                {agent.business_type && (
                  <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md">{agent.business_type}</span>
                )}

                <p className="text-sm text-muted mt-3 line-clamp-2">{agent.greeting}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{agent.total_calls} calls</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{agent.total_leads} leads</span>
                  </div>
                </div>

                {/* Personality & Demo Test */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.04] pt-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize bg-gradient-to-r ${gradient} text-white`}>
                    {agent.personality}
                  </span>
                  
                  <Link
                    href={`/dashboard/agents/${agent.id}/demo`}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-brand-indigo hover:border-brand-indigo/20 text-white transition-all duration-300 cursor-pointer"
                  >
                    <span>Test & Improve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

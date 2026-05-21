"use client";

import { motion } from "framer-motion";
import { Phone, Clock, MessageSquare, Search } from "lucide-react";
import { useState } from "react";

interface Conversation {
  id: string;
  ai_summary: string | null;
  duration: number;
  scenario: string | null;
  sentiment: string | null;
  created_at: string;
  transcript: unknown;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function sentimentBadge(sentiment: string | null) {
  const styles: Record<string, string> = {
    positive: "text-emerald-400 bg-emerald-500/10",
    negative: "text-red-400 bg-red-500/10",
    neutral: "text-amber-400 bg-amber-500/10",
  };
  return styles[sentiment || ""] || styles.neutral;
}

export default function CallsHistory({ conversations }: { conversations: Conversation[] }) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(
    (c) =>
      (c.ai_summary || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.scenario || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">Call History</span>
        </h1>
        <p className="text-muted text-sm">Review all AI conversations and transcripts</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 transition-all"
          />
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass border-glow p-12 text-center">
          <Phone className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">{search ? "No matching conversations" : "No calls yet"}</h2>
          <p className="text-sm text-muted">
            {search ? "Try a different search term." : "Conversations will appear here once your AI agents handle calls."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.4 }}
              className="rounded-xl glass border-glow p-5 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{conv.ai_summary || conv.scenario || "Conversation"}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDuration(conv.duration)}
                  </span>
                  {conv.sentiment && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${sentimentBadge(conv.sentiment)}`}>
                      {conv.sentiment}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

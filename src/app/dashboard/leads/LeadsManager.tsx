"use client";

import { motion } from "framer-motion";
import { Users, Mail, Phone, Search, Filter } from "lucide-react";
import { useState } from "react";

interface Lead {
  id: string;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  intent: string | null;
  urgency: number | null;
  summary: string | null;
  sentiment: string | null;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  contacted: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  qualified: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  converted: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  lost: "text-red-400 bg-red-500/10 border-red-500/20",
};

const STATUS_FILTERS = ["all", "new", "contacted", "qualified", "converted", "lost"];

export default function LeadsManager({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      (lead.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (lead.intent || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">Leads</span>
        </h1>
        <p className="text-muted text-sm">Manage and track all captured leads</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 transition-all"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap border ${
                statusFilter === s
                  ? "bg-brand-indigo/10 border-brand-indigo/30 text-white"
                  : "bg-white/[0.03] border-white/[0.06] text-muted hover:bg-white/[0.06]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass border-glow p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">{search || statusFilter !== "all" ? "No matching leads" : "No leads yet"}</h2>
          <p className="text-sm text-muted">Your AI agents will capture leads automatically during calls.</p>
        </motion.div>
      ) : (
        <div className="rounded-2xl glass border-glow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted uppercase tracking-wider">Intent</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium">{lead.customer_name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        {lead.email && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" /> {lead.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted max-w-[200px] truncate">{lead.intent || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full capitalize border ${statusColors[lead.status] || ""}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
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

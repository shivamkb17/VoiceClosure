"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Crown, Shield, Mail, Calendar, Phone, Bot } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  business_name: string | null;
  phone: string | null;
  subscription_status: string | null;
  is_admin: boolean | null;
  created_at: string;
  voice_agents: Array<{ id: string }>;
}

export default function AdminUsersList({ users: initialUsers }: { users: UserProfile[] }) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const toggleAdmin = async (userId: string, currentVal: boolean) => {
    setUpdatingId(userId);
    const newVal = !currentVal;
    
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: newVal })
      .eq("id", userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: newVal } : u));
    }
    setUpdatingId(null);
  };

  const changeSubscription = async (userId: string, newPlan: string) => {
    setUpdatingId(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_status: newPlan })
      .eq("id", userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, subscription_status: newPlan } : u));
    }
    setUpdatingId(null);
  };

  const filtered = users.filter(
    (u) =>
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.business_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">Platform Users</span>
        </h1>
        <p className="text-muted text-sm">Manage user accounts, subscriptions, and administrative privileges</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or business..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 transition-all"
          />
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass border-glow p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No matching users</h2>
          <p className="text-sm text-muted">Try adjusting your search criteria.</p>
        </motion.div>
      ) : (
        <div className="rounded-2xl glass border-glow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">User / Business</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Contact Info</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Agents</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Subscription Plan</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Privilege</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-medium text-white">{user.full_name || "—"}</div>
                        {user.business_name && (
                          <div className="text-xs text-muted-foreground mt-0.5">{user.business_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{user.email || "—"}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Bot className="w-4 h-4 text-brand-indigo" />
                        <span>{(user.voice_agents || []).length}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        disabled={updatingId === user.id}
                        value={user.subscription_status || "free"}
                        onChange={(e) => changeSubscription(user.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-foreground focus:outline-none focus:border-brand-indigo/50 transition-all cursor-pointer font-medium"
                      >
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="agency">Agency</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        disabled={updatingId === user.id}
                        onClick={() => toggleAdmin(user.id, !!user.is_admin)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                          user.is_admin
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-white/[0.03] border-white/[0.06] text-muted hover:bg-white/[0.06]"
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{user.is_admin ? "Admin" : "User"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(user.created_at).toLocaleDateString("en-IN", {
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

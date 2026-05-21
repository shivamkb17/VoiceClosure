"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  Bot,
  Phone,
  Users,
  CalendarCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  CreditCard,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";

interface SidebarProps {
  user: {
    email: string;
    fullName: string;
    avatarUrl: string | null;
    subscriptionStatus: string;
    isAdmin?: boolean;
  };
  variant?: "user" | "admin";
}

const userNavItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Voice Agents", href: "/dashboard/agents", icon: Bot },
  { name: "Call History", href: "/dashboard/calls", icon: Phone },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Appointments", href: "/dashboard/appointments", icon: CalendarCheck },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Revenue", href: "/admin/revenue", icon: CreditCard },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: Crown },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
];

export default function Sidebar({ user, variant = "user" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navItems = variant === "admin" ? adminNavItems : userNavItems;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-lg font-bold tracking-tight whitespace-nowrap overflow-hidden"
            >
              Voice<span className="gradient-text-static">Closer</span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* Variant badge */}
      {variant === "admin" && !collapsed && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Admin Panel</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-brand-indigo/20 to-brand-purple/10 text-white border border-brand-indigo/20"
                    : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    active ? "text-brand-indigo" : "text-muted-foreground group-hover:text-muted"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
                {active && !collapsed && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-indigo"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin link for regular users */}
        {variant === "user" && user.isAdmin && (
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
            >
              <Crown className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          </div>
        )}

        {/* Back to Dashboard for admin */}
        {variant === "admin" && (
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-indigo hover:bg-brand-indigo/10 transition-all duration-200"
            >
              <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>User Dashboard</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* User Profile + Signout */}
      <div className="border-t border-white/[0.06] p-3">
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
        </div>
        <form action={signOut} className="mt-2">
          <button
            type="submit"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-2 border border-border items-center justify-center text-muted hover:text-foreground hover:bg-surface-3 transition-all cursor-pointer"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">
            Voice<span className="gradient-text-static">Closer</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-background border-r border-white/[0.06]"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 bottom-0 z-40 bg-background border-r border-white/[0.06] transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Spacer to push main content */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[260px]"}`} />
      <div className="lg:hidden h-14" />
    </>
  );
}

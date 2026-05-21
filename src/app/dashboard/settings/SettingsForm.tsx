"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Building,
  CreditCard,
  Save,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface SettingsFormProps {
  profile: {
    fullName: string;
    email: string;
    businessName: string;
    businessType: string;
    phone: string;
    subscriptionStatus: string;
  };
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [billingError, setBillingError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").update({
      full_name: form.fullName,
      business_name: form.businessName,
      business_type: form.businessType,
      phone: form.phone,
    }).eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleManageBilling = async () => {
    setBillingError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load billing portal");
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      setBillingError(errorMsg);
      setTimeout(() => setBillingError(null), 5000);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">Settings</span>
        </h1>
        <p className="text-muted text-sm">Manage your account and business details</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="rounded-2xl glass border-glow p-6 mb-6"
      >
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-indigo" />
          Profile
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground focus:outline-none focus:border-brand-indigo/50 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-muted cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Business Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-2xl glass border-glow p-6 mb-6"
      >
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
          <Building className="w-5 h-5 text-brand-purple" />
          Business
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Business Name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="Your Business Name"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Business Type</label>
            <input
              type="text"
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value })}
              placeholder="e.g., Dental Clinic, Salon, Restaurant"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Billing Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl glass border-glow p-6 mb-8"
      >
        <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand-cyan" />
          Billing
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm">
              Current Plan: <span className="font-semibold text-brand-indigo capitalize">{form.subscriptionStatus}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Manage your subscription and payment methods</p>
          </div>
          <button
            onClick={handleManageBilling}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Manage Billing
          </button>
        </div>
        {billingError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400"
          >
            {billingError}
          </motion.div>
        )}
      </motion.div>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-sm font-medium hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-emerald-400"
          >
            ✓ Saved successfully
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}

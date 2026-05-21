import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "Admin Dashboard — VoiceCloser AI",
  description: "Platform administration and analytics.",
};

export default async function AdminPage() {
  const supabase = await createClient();

  // Use service-level queries to get all data (admin bypasses RLS via is_admin check in layout)
  const [profilesRes, agentsRes, leadsRes, appointmentsRes, conversationsRes] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, subscription_status, stripe_customer_id, created_at"),
    supabase.from("voice_agents").select("id, user_id, name, is_active, total_calls, created_at"),
    supabase.from("leads").select("id, status, created_at"),
    supabase.from("appointments").select("id, status, deposit_amount, payment_status, created_at"),
    supabase.from("conversations").select("id, duration, created_at"),
  ]);

  return (
    <AdminDashboard
      users={profilesRes.data || []}
      agents={agentsRes.data || []}
      leads={leadsRes.data || []}
      appointments={appointmentsRes.data || []}
      conversations={conversationsRes.data || []}
    />
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardOverview from "./DashboardOverview";

export const metadata = {
  title: "Dashboard — VoiceCloser AI",
  description: "Manage your AI receptionist, view analytics, and track appointments.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileRes, agentsRes, leadsRes, appointmentsRes, conversationsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("voice_agents").select("*").eq("user_id", user.id),
    supabase.from("leads").select("*").eq("business_id", user.id),
    supabase.from("appointments").select("*").eq("business_id", user.id),
    supabase.from("conversations").select("*").eq("business_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const profile = profileRes.data;
  const agents = agentsRes.data || [];
  const leads = leadsRes.data || [];
  const appointments = appointmentsRes.data || [];
  const recentConversations = conversationsRes.data || [];

  const totalCalls = recentConversations.length + (agents.reduce((a, ag) => a + (ag.total_calls || 0), 0));

  return (
    <DashboardOverview
      user={{
        fullName: profile?.full_name || "User",
        businessName: profile?.business_name || null,
        subscriptionStatus: profile?.subscription_status || "free",
      }}
      stats={{
        totalCalls,
        totalLeads: leads.length,
        totalAppointments: appointments.length,
        totalAgents: agents.length,
        activeAgents: agents.filter((a) => a.is_active).length,
      }}
      recentConversations={recentConversations}
      recentLeads={leads.slice(0, 5)}
    />
  );
}

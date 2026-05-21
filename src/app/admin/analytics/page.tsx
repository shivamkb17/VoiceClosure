import { createClient } from "@/lib/supabase/server";
import AdminAnalyticsView from "./AdminAnalyticsView";

export const metadata = {
  title: "Admin Analytics — VoiceCloser AI",
  description: "Global system performance and metric analytics.",
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [conversationsRes, leadsRes, agentsRes] = await Promise.all([
    supabase.from("conversations").select("*"),
    supabase.from("leads").select("*"),
    supabase.from("voice_agents").select("*"),
  ]);

  const conversations = conversationsRes.data || [];
  const leads = leadsRes.data || [];
  const agents = agentsRes.data || [];

  return (
    <AdminAnalyticsView
      conversations={conversations}
      leads={leads}
      agents={agents}
    />
  );
}

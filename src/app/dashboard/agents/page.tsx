import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AgentsList from "./AgentsList";

export const metadata = {
  title: "Voice Agents — VoiceCloser AI",
  description: "Manage your custom AI voice agents.",
};

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agents } = await supabase
    .from("voice_agents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <AgentsList agents={agents || []} />;
}

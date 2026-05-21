import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AgentDemoClient from "./AgentDemoClient";

export const metadata = {
  title: "Test & Improve Agent — VoiceCloser AI",
  description: "Interact with and improve your voice agent.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentDemoPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabase
    .from("voice_agents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!agent) {
    redirect("/dashboard/agents");
  }

  return <AgentDemoClient agent={agent} userId={user.id} />;
}

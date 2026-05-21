import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AgentBuilder from "./AgentBuilder";

export const metadata = {
  title: "Create Voice Agent — VoiceCloser AI",
  description: "Build a custom AI voice receptionist for your business.",
};

export default async function NewAgentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <AgentBuilder userId={user.id} />;
}

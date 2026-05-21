import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CallsHistory from "./CallsHistory";

export const metadata = {
  title: "Call History — VoiceCloser AI",
  description: "View all your AI conversation history.",
};

export default async function CallsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("business_id", user.id)
    .order("created_at", { ascending: false });

  return <CallsHistory conversations={conversations || []} />;
}

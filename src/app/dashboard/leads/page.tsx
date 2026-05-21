import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeadsManager from "./LeadsManager";

export const metadata = {
  title: "Leads — VoiceCloser AI",
  description: "Manage leads captured by your AI agents.",
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", user.id)
    .order("created_at", { ascending: false });

  return <LeadsManager leads={leads || []} />;
}

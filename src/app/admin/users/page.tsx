import { createClient } from "@/lib/supabase/server";
import AdminUsersList from "./AdminUsersList";

export const metadata = {
  title: "Admin Users — VoiceCloser AI",
  description: "Manage platform users and roles.",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*, voice_agents(id)")
    .order("created_at", { ascending: false });

  return <AdminUsersList users={users || []} />;
}

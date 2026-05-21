import { createClient } from "@/lib/supabase/server";
import AdminRevenueDashboard from "./AdminRevenueDashboard";

export const metadata = {
  title: "Admin Revenue — VoiceCloser AI",
  description: "Platform revenue analytics and transaction history.",
};

export default async function AdminRevenuePage() {
  const supabase = await createClient();

  const [appointmentsRes, profilesRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, leads(customer_name, email)")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("subscription_status"),
  ]);

  return (
    <AdminRevenueDashboard
      appointments={appointmentsRes.data || []}
      profiles={profilesRes.data || []}
    />
  );
}

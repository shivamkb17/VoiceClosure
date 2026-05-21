import { createClient } from "@/lib/supabase/server";
import AdminSubscriptionsList from "./AdminSubscriptionsList";

export const metadata = {
  title: "Admin Subscriptions — VoiceCloser AI",
  description: "View and manage active subscription tiers.",
};

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, subscription_status, stripe_customer_id, created_at")
    .order("created_at", { ascending: false });

  return <AdminSubscriptionsList users={users || []} />;
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "./DashboardContent";

export const metadata = {
  title: "Dashboard — VoiceCloser AI",
  description: "Manage your AI receptionist, view analytics, and track appointments.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <DashboardContent
      user={{
        email: user.email!,
        fullName: profile?.full_name || user.user_metadata?.full_name || "User",
        businessName: profile?.business_name || null,
        avatarUrl: profile?.avatar_url || null,
        subscriptionStatus: profile?.subscription_status || "free",
      }}
    />
  );
}

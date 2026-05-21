import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export const metadata = {
  title: "Settings — VoiceCloser AI",
  description: "Manage your account settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <SettingsForm
      profile={{
        fullName: profile?.full_name || "",
        email: profile?.email || user.email || "",
        businessName: profile?.business_name || "",
        businessType: profile?.business_type || "",
        phone: profile?.phone || "",
        subscriptionStatus: profile?.subscription_status || "free",
      }}
    />
  );
}

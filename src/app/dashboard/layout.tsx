import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url, subscription_status, is_admin")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        user={{
          email: user.email!,
          fullName: profile?.full_name || user.user_metadata?.full_name || "User",
          avatarUrl: profile?.avatar_url || null,
          subscriptionStatus: profile?.subscription_status || "free",
          isAdmin: profile?.is_admin || false,
        }}
        variant="user"
      />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

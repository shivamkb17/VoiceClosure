import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppointmentsView from "./AppointmentsView";

export const metadata = {
  title: "Appointments — VoiceCloser AI",
  description: "View and manage your scheduled appointments.",
};

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, leads(customer_name, email, phone)")
    .eq("business_id", user.id)
    .order("appointment_date", { ascending: true });

  return <AppointmentsView appointments={appointments || []} />;
}

"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Clock, CreditCard, User } from "lucide-react";

interface Appointment {
  id: string;
  appointment_date: string;
  service_type: string | null;
  notes: string | null;
  payment_status: string;
  deposit_amount: number;
  status: string;
  created_at: string;
  leads?: {
    customer_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

const appointmentStatusColors: Record<string, string> = {
  scheduled: "text-blue-400 bg-blue-500/10",
  confirmed: "text-emerald-400 bg-emerald-500/10",
  completed: "text-green-400 bg-green-500/10",
  cancelled: "text-red-400 bg-red-500/10",
  no_show: "text-amber-400 bg-amber-500/10",
};

const paymentStatusColors: Record<string, string> = {
  pending: "text-amber-400",
  paid: "text-emerald-400",
  refunded: "text-blue-400",
  failed: "text-red-400",
};

export default function AppointmentsView({ appointments }: { appointments: Appointment[] }) {
  const upcoming = appointments.filter((a) => new Date(a.appointment_date) >= new Date() && a.status !== "cancelled");
  const past = appointments.filter((a) => new Date(a.appointment_date) < new Date() || a.status === "cancelled");

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">Appointments</span>
        </h1>
        <p className="text-muted text-sm">View and manage your scheduled appointments</p>
      </motion.div>

      {appointments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass border-glow p-12 text-center">
          <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Appointments Yet</h2>
          <p className="text-sm text-muted">Appointments will be listed here once your AI agents start booking them.</p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-brand-indigo" />
                Upcoming ({upcoming.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map((apt, i) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl glass border-glow p-5 hover:bg-white/[0.06] transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full capitalize ${appointmentStatusColors[apt.status] || ""}`}>
                        {apt.status.replace("_", " ")}
                      </span>
                      <span className={`text-xs font-medium ${paymentStatusColors[apt.payment_status] || ""}`}>
                        <CreditCard className="w-3 h-3 inline mr-1" />
                        {apt.payment_status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {new Date(apt.appointment_date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {apt.service_type && <p className="text-xs text-muted mb-2">{apt.service_type}</p>}
                    {apt.leads && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-white/[0.06]">
                        <User className="w-3 h-3" />
                        <span>{apt.leads.customer_name || apt.leads.email || "Unknown"}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-muted">Past ({past.length})</h2>
              <div className="space-y-2">
                {past.slice(0, 10).map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-xl glass p-4 flex items-center justify-between opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(apt.appointment_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      {apt.service_type && <span className="text-xs text-muted-foreground">• {apt.service_type}</span>}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${appointmentStatusColors[apt.status] || ""}`}>
                      {apt.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

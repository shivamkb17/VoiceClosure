"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Mic,
  Target,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "AI Voice Receptionist",
    description:
      "Customers talk naturally with your AI through browser voice chat. It answers questions, understands needs, and guides them seamlessly.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: Target,
    title: "Lead Qualification",
    description:
      "AI asks intelligent follow-up questions about urgency, budget, preferences, and service type to qualify every lead automatically.",
    gradient: "from-indigo-500 to-blue-400",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Booking",
    description:
      "AI checks available slots and books appointments automatically. No back-and-forth emails, no phone tag, no missed opportunities.",
    gradient: "from-purple-500 to-indigo-400",
  },
  {
    icon: CreditCard,
    title: "Payment Collection",
    description:
      "Secure deposits and consultation fees collected automatically via Stripe Checkout. Confirm bookings with real payments.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: LayoutDashboard,
    title: "CRM Dashboard",
    description:
      "Track conversations, bookings, payments, AI summaries, and analytics. Everything in one beautiful, real-time dashboard.",
    gradient: "from-pink-500 to-violet-400",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Serve customers in their preferred language. AI switches languages naturally — no configuration needed.",
    gradient: "from-cyan-500 to-blue-400",
  },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dots opacity-30" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-xs uppercase tracking-widest text-brand-indigo mb-4">
            Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Close More Deals</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            From the first hello to the final payment — VoiceCloser AI handles
            the entire customer journey while you focus on your business.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative rounded-2xl glass border-glow p-8 hover:bg-white/[0.06] transition-all duration-500 cursor-default"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-brand-indigo/5 to-brand-purple/5" />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:shadow-lg transition-shadow duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-3 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Brain, CalendarCheck, CreditCard } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Customer Calls",
    description: "Customer opens your website and starts a voice conversation with your AI receptionist.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Brain,
    number: "02",
    title: "AI Qualifies",
    description: "AI understands their needs, asks smart follow-ups, and determines urgency and intent.",
    color: "from-indigo-500 to-blue-400",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "Books Appointment",
    description: "AI checks availability and books the perfect slot — no human needed.",
    color: "from-purple-500 to-indigo-400",
  },
  {
    icon: CreditCard,
    number: "04",
    title: "Collects Payment",
    description: "Secure Stripe Checkout collects a confirmation deposit to lock the appointment.",
    color: "from-violet-500 to-purple-400",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-xs uppercase tracking-widest text-brand-indigo mb-4">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            From Hello to{" "}
            <span className="gradient-text">Payment in Minutes</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Four simple steps. Fully automated. Your AI receptionist handles
            everything while you focus on what matters.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connecting Line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-violet-500/30 origin-left"
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.3 + i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative text-center"
            >
              {/* Step Number + Icon */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                >
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center text-xs font-bold text-muted">
                  {step.number}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>

              {/* Description */}
              <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

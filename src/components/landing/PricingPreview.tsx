"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "$10",
    period: "/month",
    description: "Perfect for small businesses getting started.",
    features: [
      "100 AI conversations",
      "Appointment booking",
      "Payment collection",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$30",
    period: "/month",
    description: "For growing businesses that need more power.",
    features: [
      "Unlimited conversations",
      "Advanced analytics",
      "Multilingual AI",
      "CRM integration",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Agency",
    price: "$50",
    period: "/month",
    description: "White-label solution for agencies and enterprises.",
    features: [
      "Everything in Pro",
      "White-label branding",
      "Multiple businesses",
      "Advanced analytics",
      "Dedicated support",
      "Custom AI training",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs uppercase tracking-widest text-brand-indigo mb-4">
            Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            No hidden fees. No surprises. Pick the plan that fits your business.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`relative rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02] ${
                plan.highlighted
                  ? "glass-strong border border-brand-indigo/40 shadow-[0_0_40px_rgba(99,102,241,0.15)]"
                  : "glass border-glow"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-brand-indigo to-brand-purple text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted text-sm">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-muted"
                  >
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/pricing"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-brand-indigo to-brand-purple text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-[1.02]"
                    : "glass border-glow text-foreground hover:bg-white/[0.06]"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View Full Pricing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            href="/pricing"
            className="text-sm text-brand-indigo hover:text-brand-purple transition-colors inline-flex items-center gap-1"
          >
            View full pricing details
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

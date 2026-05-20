"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, ArrowRight, Minus, Plus } from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 1999,
    yearlyPrice: 1599,
    description: "Perfect for small businesses getting started with AI reception.",
    features: [
      { name: "100 AI conversations/mo", included: true },
      { name: "Appointment booking", included: true },
      { name: "Payment collection (Stripe)", included: true },
      { name: "Email support", included: true },
      { name: "Basic analytics", included: true },
      { name: "Multilingual AI", included: false },
      { name: "CRM integration", included: false },
      { name: "White-label branding", included: false },
      { name: "Multiple businesses", included: false },
    ],
    cta: "Start Free Trial",
    highlighted: false,
    priceId: "starter",
  },
  {
    name: "Pro",
    monthlyPrice: 5999,
    yearlyPrice: 4799,
    description: "For growing businesses that need unlimited power and insights.",
    features: [
      { name: "Unlimited AI conversations", included: true },
      { name: "Appointment booking", included: true },
      { name: "Payment collection (Stripe)", included: true },
      { name: "Priority support", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Multilingual AI", included: true },
      { name: "CRM integration", included: true },
      { name: "White-label branding", included: false },
      { name: "Multiple businesses", included: false },
    ],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
    priceId: "pro",
  },
  {
    name: "Agency",
    monthlyPrice: 14999,
    yearlyPrice: 11999,
    description: "White-label AI receptionist for agencies and enterprises.",
    features: [
      { name: "Unlimited AI conversations", included: true },
      { name: "Appointment booking", included: true },
      { name: "Payment collection (Stripe)", included: true },
      { name: "Dedicated support", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Multilingual AI", included: true },
      { name: "CRM integration", included: true },
      { name: "White-label branding", included: true },
      { name: "Multiple businesses", included: true },
    ],
    cta: "Contact Sales",
    highlighted: false,
    priceId: "agency",
  },
];

const faqs = [
  {
    q: "How does the 14-day free trial work?",
    a: "You get full access to all features of your chosen plan for 14 days. No credit card required to start. You can upgrade, downgrade, or cancel anytime.",
  },
  {
    q: "Can I change my plan later?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, debit cards, and UPI through Stripe. All payments are processed securely.",
  },
  {
    q: "Do I need technical knowledge to set up?",
    a: "Not at all. VoiceCloser AI is designed for non-technical users. Set up your AI receptionist in under 5 minutes with our guided onboarding.",
  },
  {
    q: "What happens when I exceed my conversation limit?",
    a: "On the Starter plan, you'll receive a notification when approaching your limit. You can upgrade to Pro for unlimited conversations or purchase additional conversations.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund — no questions asked.",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const headerRef = useRef(null);
  const cardsRef = useRef(null);
  const faqRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });
  const cardsInView = useInView(cardsRef, { once: true, margin: "-50px" });
  const faqInView = useInView(faqRef, { once: true, margin: "-50px" });

  const handleCheckout = async (priceId: string) => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          interval: isYearly ? "year" : "month",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <main>
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute inset-0 bg-grid opacity-30" />

        <div ref={headerRef} className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-xs uppercase tracking-widest text-brand-indigo mb-4">
              Pricing
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Start free. Scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-4 mb-16"
          >
            <span className={`text-sm ${!isYearly ? "text-foreground" : "text-muted"}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                isYearly ? "bg-brand-indigo" : "bg-surface-3"
              }`}
              aria-label="Toggle billing period"
            >
              <motion.div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                animate={{ left: isYearly ? "calc(100% - 25px)" : "2px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${isYearly ? "text-foreground" : "text-muted"}`}>
              Yearly
            </span>
            {isYearly && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium"
              >
                Save 20%
              </motion.span>
            )}
          </motion.div>

          {/* Pricing Cards */}
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={cardsInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02] ${
                  plan.highlighted
                    ? "glass-strong border border-brand-indigo/40 shadow-[0_0_50px_rgba(99,102,241,0.15)] md:-mt-4 md:mb-[-16px]"
                    : "glass border-glow"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-brand-indigo to-brand-purple text-xs font-semibold text-white shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-4xl font-bold">
                    ₹{isYearly ? plan.yearlyPrice.toLocaleString() : plan.monthlyPrice.toLocaleString()}
                  </span>
                  <span className="text-muted text-sm">/month</span>
                  {isYearly && (
                    <div className="text-xs text-emerald-400 mt-1">
                      Billed ₹{(plan.yearlyPrice * 12).toLocaleString()}/year
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.name}
                      className={`flex items-center gap-3 text-sm ${
                        feature.included ? "text-muted" : "text-muted-foreground"
                      }`}
                    >
                      {feature.included ? (
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      {feature.name}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.priceId)}
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-brand-indigo to-brand-purple text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-[1.02]"
                      : "glass border-glow text-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-24 overflow-hidden">
        <div ref={faqRef} className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={faqInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl glass border-glow overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  {faq.q}
                  {openFaq === i ? (
                    <Minus className="w-4 h-4 text-muted flex-shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-muted flex-shrink-0" />
                  )}
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === i ? "auto" : 0,
                    opacity: openFaq === i ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-4 text-sm text-muted leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const router = useRouter();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-indigo/5 to-transparent" />

      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-brand-violet" />
            <span className="text-sm text-brand-violet font-medium">
              Ready to transform your business?
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Never Miss a{" "}
            <span className="gradient-text">Customer Again</span>
          </h2>

          <p className="text-muted text-lg mb-10 max-w-xl mx-auto">
            Start your free trial today. No credit card required. Set up in
            under 5 minutes.
          </p>

          {/* Email Capture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 rounded-xl glass border-glow text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-brand-indigo/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => router.push(email ? `/signup?email=${encodeURIComponent(email)}` : "/signup")}
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-semibold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-[1.02] whitespace-nowrap cursor-pointer">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-xs text-muted-foreground mt-4"
          >
            14-day free trial · No credit card required · Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

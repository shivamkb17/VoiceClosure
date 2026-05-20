"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import GlowOrb from "@/components/ui/GlowOrb";

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 0.3 + i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function HeroSection() {
  const headlineWords = ["Your", "AI", "Receptionist", "That", "Never", "Sleeps"];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Floating Gradient Blobs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-brand-indigo/10 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-brand-purple/10 blur-[120px]"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
        {/* Left: Text Content */}
        <div className="flex-1 text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-glow mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted tracking-wide uppercase">
              Powered by ElevenLabs Voice AI
            </span>
          </motion.div>

          {/* Headline — Word-by-word reveal */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className={`inline-block mr-3 ${
                  word === "AI" || word === "Never" || word === "Sleeps"
                    ? "gradient-text"
                    : ""
                }`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-lg sm:text-xl text-muted max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
          >
            Talk to customers naturally. Qualify leads, book appointments, and
            collect payments — all on autopilot with conversational voice AI.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link
              href="/demo"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-semibold text-base overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:scale-[1.02]"
            >
              {/* Shimmer */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </span>
              <Play className="w-4 h-4" />
              <span className="relative">Try Live Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl glass border-glow text-foreground font-semibold text-base hover:bg-white/[0.06] transition-all duration-300 hover:scale-[1.02]"
            >
              View Pricing
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="flex items-center gap-8 mt-12 justify-center lg:justify-start"
          >
            {[
              { value: "10K+", label: "Calls Handled" },
              { value: "500+", label: "Businesses" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <div className="text-xl font-bold gradient-text-static">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Animated Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex items-center justify-center"
        >
          <GlowOrb />
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

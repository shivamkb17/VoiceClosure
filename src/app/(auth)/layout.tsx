"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap } from "lucide-react";

const AUTH_WAVEFORMS = Array.from({ length: 12 }, () => ({
  minA: 6 + Math.random() * 6,
  max: 12 + Math.random() * 20,
  minB: 6 + Math.random() * 6,
  duration: 1.2 + Math.random() * 0.4,
}));

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Animated Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-background via-brand-indigo/5 to-background">
        {/* Grid */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Floating Blobs */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-brand-indigo/15 blur-[100px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-brand-purple/15 blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Center Content */}
        <div className="relative z-10 text-center max-w-md px-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold mb-3"
          >
            Welcome to{" "}
            <span className="gradient-text-static">VoiceCloser</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-muted leading-relaxed"
          >
            Your AI receptionist that never sleeps. Qualify leads, book
            appointments, and collect payments — all automatically.
          </motion.p>

          {/* Decorative waveform */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center justify-center gap-1 mt-8"
          >
            {AUTH_WAVEFORMS.map((w, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-brand-indigo/40 to-brand-purple/40"
                animate={{
                  height: [`${w.minA}px`, `${w.max}px`, `${w.minB}px`],
                }}
                transition={{
                  duration: w.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2 mb-10"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">
              Voice<span className="gradient-text-static">Closer</span>
            </span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}

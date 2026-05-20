"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

export default function DemoPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const waveforms = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        minA: 8 + Math.random() * 8,
        max: 16 + Math.random() * 32,
        minB: 8 + Math.random() * 8,
        duration: 1 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <section className="relative py-32 overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl glass border-glow p-12 sm:p-16 text-center overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-indigo/10 via-transparent to-brand-purple/10" />

          {/* Decorative Waveform */}
          <div className="relative z-10 flex items-center justify-center gap-1 mb-8">
            {waveforms.map((w, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-brand-indigo to-brand-purple"
                animate={{
                  height: [
                    `${w.minA}px`,
                    `${w.max}px`,
                    `${w.minB}px`,
                  ],
                }}
                transition={{
                  duration: w.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>

          <h2 className="relative z-10 text-3xl sm:text-4xl font-bold mb-4">
            Hear It in <span className="gradient-text">Action</span>
          </h2>
          <p className="relative z-10 text-muted text-lg mb-8 max-w-lg mx-auto">
            Talk to our AI receptionist live. Pick a scenario — dental clinic,
            salon, law firm, or restaurant — and experience the future.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative z-10"
          >
            <Link
              href="/demo"
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(99,102,241,0.4)] hover:scale-[1.03]"
            >
              <Play className="w-5 h-5" />
              Talk to Our AI Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

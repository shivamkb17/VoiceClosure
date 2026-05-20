"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const WAVE_DELAYS = [0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 0.3, 0.7];

export default function GlowOrb() {
  const waveBars = useMemo(
    () =>
      WAVE_DELAYS.map((delay) => ({
        height: `${20 + delay * 20}px`,
        duration: 1 + delay * 0.3,
      })),
    [],
  );
  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
      {/* Outer Pulse Ring 1 */}
      <motion.div
        className="absolute inset-0 rounded-full border border-brand-indigo/20"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer Pulse Ring 2 */}
      <motion.div
        className="absolute inset-4 rounded-full border border-brand-purple/20"
        animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Outer Pulse Ring 3 */}
      <motion.div
        className="absolute inset-8 rounded-full border border-brand-violet/20"
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Main Orb */}
      <motion.div
        className="absolute inset-16 rounded-full bg-gradient-to-br from-brand-indigo via-brand-purple to-brand-violet"
        animate={{
          y: [0, -8, 0],
          rotate: [0, 3, -3, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          boxShadow: `
            0 0 40px rgba(99, 102, 241, 0.4),
            0 0 80px rgba(139, 92, 246, 0.2),
            0 0 120px rgba(168, 85, 247, 0.1),
            inset 0 -10px 30px rgba(0, 0, 0, 0.3)
          `,
        }}
      >
        {/* Inner Shine */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />

        {/* Waveform Bars */}
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {waveBars.map((bar, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-white/60"
              animate={{
                height: ["8px", bar.height, "8px"],
              }}
              transition={{
                duration: bar.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Orbiting Particle 1 */}
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]"
        animate={{
          rotate: 360,
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          top: "10%",
          left: "50%",
          transformOrigin: "0 180px",
        }}
      />

      {/* Orbiting Particle 2 */}
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-brand-violet shadow-[0_0_10px_rgba(168,85,247,0.5)]"
        animate={{
          rotate: -360,
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{
          top: "50%",
          left: "5%",
          transformOrigin: "180px 0",
        }}
      />
    </div>
  );
}

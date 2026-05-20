"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { scenarios } from "@/lib/prompts";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function DemoPage() {
  return (
    <main>
      <Navbar />

      <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute inset-0 bg-grid opacity-30" />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs uppercase tracking-widest text-brand-indigo mb-4">
              Live Demo
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Talk to Our <span className="gradient-text">AI Receptionist</span>
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Pick a scenario below and start a real voice conversation. 
              Experience how VoiceCloser AI handles customers naturally.
            </p>
          </motion.div>

          {/* Scenario Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map((scenario, i) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={`/demo/${scenario.id}`}
                  className="group block rounded-2xl glass border-glow p-8 hover:bg-white/[0.06] transition-all duration-500 hover:scale-[1.02] h-full"
                >
                  <div className="flex items-start gap-5">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${scenario.color} flex items-center justify-center text-2xl flex-shrink-0 group-hover:shadow-lg transition-shadow duration-300`}
                    >
                      {scenario.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Industry Badge */}
                      <span className="inline-block text-xs text-brand-indigo mb-2 font-medium">
                        {scenario.industry}
                      </span>

                      {/* Name */}
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
                        {scenario.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted leading-relaxed mb-4">
                        {scenario.description}
                      </p>

                      {/* CTA */}
                      <span className="inline-flex items-center gap-2 text-sm text-brand-indigo group-hover:text-brand-purple transition-colors font-medium">
                        <Phone className="w-4 h-4" />
                        Start Call
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-xs text-muted-foreground mt-12 max-w-lg mx-auto"
          >
            Demo uses browser microphone and AI voice synthesis. 
            Conversations are not stored. Payment flow is simulated.
          </motion.p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Owner, BrightSmile Dental Clinic",
    avatar: "/avatars/avatar-priya.png",
    initials: "PS",
    quote:
      "VoiceCloser AI handles our after-hours calls brilliantly. We've seen a 40% increase in bookings since we started. Patients love the instant response.",
    stars: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Founder, Luxe Hair Studio",
    avatar: "/avatars/avatar-arjun.png",
    initials: "AM",
    quote:
      "The AI receptionist sounds so natural that customers think they're talking to a real person. It's like having a 24/7 front desk manager.",
    stars: 5,
  },
  {
    name: "Kavita Reddy",
    role: "Managing Partner, Reddy & Associates Law",
    avatar: "/avatars/avatar-kavita.png",
    initials: "KR",
    quote:
      "Our consultation bookings doubled in the first month. The deposit collection feature ensures only serious clients book our time. Game-changer.",
    stars: 5,
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-20" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs uppercase tracking-widest text-brand-indigo mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Loved by <span className="gradient-text">Business Owners</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            See what our customers have to say about their AI receptionist.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-2xl glass border-glow p-8 hover:bg-white/[0.06] transition-all duration-500"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-muted leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center text-xs font-bold text-white overflow-hidden relative">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

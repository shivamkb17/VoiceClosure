"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Demo", href: "/demo" },
  { name: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-shadow duration-300">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Voice<span className="gradient-text-static">Closer</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm text-muted hover:text-foreground transition-colors duration-300 relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-brand-indigo to-brand-purple group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted hover:text-foreground transition-colors duration-300 px-4 py-2"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm px-5 py-2 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-medium hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-[1.02]"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-muted hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-strong border-t border-border overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-muted hover:text-foreground transition-colors text-lg"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Link
                  href="/login"
                  className="text-center text-muted hover:text-foreground transition-colors py-2"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-medium"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

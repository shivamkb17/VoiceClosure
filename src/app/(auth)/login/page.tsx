"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { signIn, signInWithOAuth } from "@/app/actions/auth";

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  async function handleOAuth(provider: "google" | "github") {
    startTransition(async () => {
      await signInWithOAuth(provider);
    });
  }

  return (
    <>
      <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted mb-8">
          Sign in to your VoiceCloser AI account
        </p>
      </motion.div>

      {/* Error Display */}
      {(error || callbackError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error || "Authentication failed. Please try again."}
        </motion.div>
      )}

      <form className="space-y-5" action={handleSubmit}>
        {/* Email */}
        <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible">
          <label htmlFor="login-email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="login-email"
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl glass border-glow text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-brand-indigo/50 transition-colors"
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="login-password" className="block text-sm font-medium">
              Password
            </label>
            <span className="text-xs text-muted-foreground cursor-default">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 rounded-xl glass border-glow text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-brand-indigo/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
          <button
            type="submit"
            disabled={isPending}
            className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-semibold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div custom={4} variants={itemVariants} initial="hidden" animate="visible" className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Social Buttons */}
        <motion.div custom={5} variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleOAuth("google")}
            className="flex items-center justify-center gap-2 py-3 rounded-xl glass border-glow text-sm font-medium hover:bg-white/[0.06] transition-all duration-300 disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleOAuth("github")}
            className="flex items-center justify-center gap-2 py-3 rounded-xl glass border-glow text-sm font-medium hover:bg-white/[0.06] transition-all duration-300 disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </button>
        </motion.div>
      </form>

      {/* Sign Up Link */}
      <motion.p
        custom={6}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="text-center text-sm text-muted mt-8"
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-brand-indigo hover:text-brand-purple transition-colors font-medium"
        >
          Sign Up
        </Link>
      </motion.p>
    </>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { getScenarioById, type DemoScenario } from "@/lib/prompts";
import Link from "next/link";

type CallState = "idle" | "connecting" | "active" | "ended";

interface Message {
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

const CALL_WAVE_BARS = Array.from({ length: 7 }, () => ({
  max: 12 + Math.random() * 24,
  duration: 0.8 + Math.random() * 0.4,
}));

export default function DemoCallPage() {
  const params = useParams();
  const scenarioId = params.scenario as string;
  const scenario = getScenarioById(scenarioId);

  const [callState, setCallState] = useState<CallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiStatus, setAiStatus] = useState("Ready");
  const [showTranscript, setShowTranscript] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const sampleIndex = useRef(0);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer
  useEffect(() => {
    if (callState === "active") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const simulateConversation = useCallback((sc: DemoScenario) => {
    // Add AI greeting
    setAiStatus("AI is speaking...");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: sc.greeting, timestamp: new Date() },
      ]);
      setAiStatus("AI is listening...");
    }, 1500);

    // Simulate the sample conversation
    const sample = sc.sampleConversation;
    let delay = 4000;

    sample.forEach((msg) => {
      setTimeout(() => {
        if (msg.role === "user") {
          setAiStatus("AI is listening...");
        } else {
          setAiStatus("AI is speaking...");
        }
        setMessages((prev) => [
          ...prev,
          { role: msg.role, text: msg.message, timestamp: new Date() },
        ]);
        if (msg.role === "ai") {
          setTimeout(() => setAiStatus("AI is listening..."), 500);
        }
      }, delay);
      delay += msg.role === "user" ? 3000 : 4000;
    });
  }, []);

  const startCall = () => {
    if (!scenario) return;
    setCallState("connecting");
    setMessages([]);
    setElapsed(0);
    setAiStatus("Connecting...");
    sampleIndex.current = 0;

    setTimeout(() => {
      setCallState("active");
      simulateConversation(scenario);
    }, 2000);
  };

  const endCall = () => {
    setCallState("ended");
    setAiStatus("Call ended");
  };

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Scenario not found</p>
          <Link href="/demo" className="text-brand-indigo hover:text-brand-purple">
            ← Back to demos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link
          href="/demo"
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Demos
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{scenario.icon}</span>
          <div>
            <div className="text-sm font-semibold">{scenario.name}</div>
            <div className="text-xs text-muted">{scenario.industry}</div>
          </div>
        </div>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className={`p-2 rounded-lg transition-colors ${
            showTranscript
              ? "bg-brand-indigo/20 text-brand-indigo"
              : "text-muted hover:text-foreground"
          }`}
          aria-label="Toggle transcript"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex">
        {/* Call Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-radial-glow opacity-50" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Status */}
            <motion.div
              key={aiStatus}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted mb-8"
            >
              {aiStatus}
            </motion.div>

            {/* Voice Orb */}
            <div className="relative w-56 h-56 mb-10">
              {/* Pulse Rings (active state) */}
              {callState === "active" && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border border-brand-indigo/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-4 rounded-full border border-brand-purple/20"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  />
                </>
              )}

              {/* Orb */}
              <motion.div
                className={`absolute inset-8 rounded-full flex items-center justify-center ${
                  callState === "active"
                    ? "bg-gradient-to-br from-brand-indigo via-brand-purple to-brand-violet"
                    : callState === "connecting"
                    ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                    : callState === "ended"
                    ? "bg-gradient-to-br from-gray-600 to-gray-700"
                    : "bg-gradient-to-br from-brand-indigo/60 to-brand-purple/60"
                }`}
                animate={
                  callState === "active"
                    ? { y: [0, -5, 0], scale: [1, 1.02, 1] }
                    : callState === "connecting"
                    ? { scale: [1, 1.05, 1] }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  boxShadow:
                    callState === "active"
                      ? "0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(139,92,246,0.2)"
                      : "0 0 20px rgba(99,102,241,0.1)",
                }}
              >
                {/* Waveform (active) */}
                {callState === "active" && (
                  <div className="flex items-center gap-0.5">
                    {CALL_WAVE_BARS.map((bar, i) => (
                      <motion.div
                        key={i}
                        className="w-1 rounded-full bg-white/70"
                        animate={{
                          height: [
                            "6px",
                            `${bar.max}px`,
                            "6px",
                          ],
                        }}
                        transition={{
                          duration: bar.duration,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.08,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Connecting spinner */}
                {callState === "connecting" && (
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}

                {/* Idle / Ended icon */}
                {(callState === "idle" || callState === "ended") && (
                  <Phone className="w-10 h-10 text-white/60" />
                )}
              </motion.div>
            </div>

            {/* Timer */}
            {(callState === "active" || callState === "ended") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-mono text-muted mb-8"
              >
                {formatTime(elapsed)}
              </motion.div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-6">
              {callState === "idle" && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={startCall}
                  className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  Start Call
                </motion.button>
              )}

              {callState === "active" && (
                <>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      isMuted
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "glass border-glow text-foreground hover:bg-white/[0.08]"
                    }`}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={endCall}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 hover:scale-105 cursor-pointer"
                    aria-label="End call"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </>
              )}

              {callState === "ended" && (
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-2xl glass border-glow p-6 text-center max-w-sm">
                    <h3 className="font-semibold mb-2">Call Summary</h3>
                    <p className="text-sm text-muted mb-1">
                      Duration: {formatTime(elapsed)}
                    </p>
                    <p className="text-sm text-muted mb-1">
                      Messages: {messages.length}
                    </p>
                    <p className="text-sm text-muted">
                      Scenario: {scenario.name}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={startCall}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
                    >
                      Call Again
                    </button>
                    <Link
                      href="/demo"
                      className="px-6 py-2.5 rounded-xl glass border-glow text-sm font-medium hover:bg-white/[0.06] transition-all"
                    >
                      Try Another
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transcript Panel */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-l border-border overflow-hidden flex-shrink-0 hidden md:block"
            >
              <div className="w-[380px] h-full flex flex-col">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold">Live Transcript</h3>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {messages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center mt-8">
                      {callState === "idle"
                        ? "Start a call to see the transcript"
                        : "Waiting for conversation..."}
                    </p>
                  )}
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : ""
                      }`}
                    >
                      {msg.role === "ai" && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
                          AI
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-brand-indigo/20 text-foreground"
                            : "glass text-muted"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

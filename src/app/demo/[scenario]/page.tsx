/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { getAiResponse } from "@/app/actions/chat";

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
  const [textInput, setTextInput] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speakingRef = useRef<boolean>(false);

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

  const speakText = (text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    speakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith("en") && 
      (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
    ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      speakingRef.current = false;
      onEnd?.();
    };
    utterance.onerror = (err) => {
      console.error("Speech synthesis error:", err);
      speakingRef.current = false;
      onEnd?.();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (typeof window === "undefined" || isMuted) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN";

    rec.onstart = () => {
      setAiStatus("AI is listening...");
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript || transcript.trim() === "") return;

      const userMsg: Message = { role: "user", text: transcript, timestamp: new Date() };
      setMessages((prev) => {
        const nextMsgs = [...prev, userMsg];
        handleGenerateResponse(nextMsgs);
        return nextMsgs;
      });
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setAiStatus("Microphone access denied");
      } else if (event.error === "no-speech") {
        if (callState === "active" && !speakingRef.current) {
          try { rec.start(); } catch {}
        }
      }
    };

    rec.onend = () => {
      if (callState === "active" && !isMuted && !speakingRef.current && aiStatus === "AI is listening...") {
        try { rec.start(); } catch {}
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
    }
  };

  const handleGenerateResponse = async (currentMessages: Message[]) => {
    if (!scenario) return;
    setAiStatus("AI is thinking...");

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    let responseText = "";
    try {
      responseText = await getAiResponse(scenario.systemPrompt, currentMessages);
    } catch (err) {
      console.warn("Fallback to local response simulation:", err);
      responseText = getLocalFallbackResponse(
        currentMessages[currentMessages.length - 1]?.text || "",
        scenario
      );
    }

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: responseText, timestamp: new Date() },
    ]);

    setAiStatus("AI is speaking...");
    speakText(responseText, () => {
      setAiStatus("AI is listening...");
      if (callState === "active" && !isMuted) {
        startListening();
      }
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const startCall = () => {
    if (!scenario) return;
    setCallState("connecting");
    setMessages([]);
    setElapsed(0);
    setAiStatus("Connecting...");
    setIsMuted(false);
    speakingRef.current = false;

    setTimeout(() => {
      setCallState("active");
      setAiStatus("AI is speaking...");
      
      const greetingMsg: Message = { role: "ai", text: scenario.greeting, timestamp: new Date() };
      setMessages([greetingMsg]);
      
      speakText(scenario.greeting, () => {
        setAiStatus("AI is listening...");
        startListening();
      });
    }, 2000);
  };

  const endCall = useCallback(() => {
    setCallState("ended");
    setAiStatus("Call ended");
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
  }, []);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || callState !== "active") return;

    const userText = textInput.trim();
    setTextInput("");

    const userMsg: Message = { role: "user", text: userText, timestamp: new Date() };
    setMessages((prev) => {
      const nextMsgs = [...prev, userMsg];
      handleGenerateResponse(nextMsgs);
      return nextMsgs;
    });
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
                    onClick={() => {
                      const nextMuted = !isMuted;
                      setIsMuted(nextMuted);
                      if (nextMuted) {
                        if (recognitionRef.current) {
                          try { recognitionRef.current.abort(); } catch {}
                        }
                        setAiStatus("Muted");
                      } else {
                        if (callState === "active" && !speakingRef.current) {
                          setAiStatus("AI is listening...");
                          setTimeout(() => {
                            startListening();
                          }, 50);
                        }
                      }
                    }}
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
                {callState === "active" && (
                  <form onSubmit={handleSendText} className="p-4 border-t border-border flex gap-2">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:border-brand-indigo/50 text-foreground placeholder:text-muted-foreground"
                    />
                    <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
                      Send
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getLocalFallbackResponse(userText: string, scenario: DemoScenario): string {
  const query = userText.toLowerCase().trim();
  
  // Find matching dialogue from scenario's sample conversation if possible
  const matchingSample = scenario.sampleConversation.find((item, index) => {
    if (item.role === "ai" && index > 0) {
      const prevUser = scenario.sampleConversation[index - 1];
      if (prevUser.role === "user" && query.includes(prevUser.message.toLowerCase().slice(0, 8))) {
        return true;
      }
    }
    return false;
  });

  if (matchingSample) return matchingSample.message;

  // Simple keyword mapping
  if (query.includes("book") || query.includes("appointment") || query.includes("schedule")) {
    if (scenario.id === "dental") {
      return "Sure, I can book an appointment for you tomorrow at 2:30 PM. To confirm, there is a $25 booking deposit. Would that work?";
    }
    if (scenario.id === "salon") {
      return "I would be happy to schedule that for you this Saturday. We have a slot available at 11:00 AM with Priya. Would you like to reserve it?";
    }
    if (scenario.id === "law") {
      return "Yes, we can book a legal consultation with Adv. Vikram Sharma this Wednesday at 3:00 PM. The consultation fee is $100. Does that time suit you?";
    }
    return "Yes, we can book that for you. We have openings tomorrow. Would tomorrow afternoon work for you?";
  }

  if (query.includes("price") || query.includes("cost") || query.includes("deposit") || query.includes("fee")) {
    if (scenario.id === "dental") {
      return "Our booking deposit is $25, which goes directly toward your appointment cost. May I get your name and phone number to prepare the payment link?";
    }
    if (scenario.id === "salon") {
      return "The deposit is $15 for standard hair styling, and $50 for premium treatments. Could you share your name and contact details to proceed?";
    }
    if (scenario.id === "law") {
      return "The initial consultation fee is $100. Shall I note down your full name and phone number to schedule it?";
    }
    return "There is a small deposit required to confirm the booking. Can I please get your name and phone number?";
  }

  if (query.includes("pain") || query.includes("hurt") || query.includes("toothache") || query.includes("emergency")) {
    return "I'm so sorry you're dealing with that pain. Let's schedule you as soon as possible. Can we book you for tomorrow morning at 9:00 AM?";
  }

  if (query.includes("hi") || query.includes("hello") || query.includes("hey")) {
    return `Hello! ${scenario.greeting}`;
  }

  return "Thank you for sharing that. I've noted it down. Could you please provide your name and phone number so I can confirm your request?";
}

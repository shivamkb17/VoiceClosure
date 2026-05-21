/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Bot,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Loader2,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Volume2,
  Globe,
  FileText,
  Check,
  Zap,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { getAiResponse, polishSystemPrompt, extractAndCreateLead, incrementAgentCalls } from "@/app/actions/chat";

interface Agent {
  id: string;
  name: string;
  business_type: string | null;
  greeting: string;
  system_prompt: string;
  voice_id: string;
  language: string;
  personality: string;
  is_active: boolean;
  total_calls: number;
  total_leads: number;
  created_at: string;
}

interface AgentDemoClientProps {
  agent: Agent;
  userId: string;
}

type CallState = "idle" | "connecting" | "active" | "ended";
type TabState = "profile" | "prompt";
type ModeState = "voice" | "chat";

const VOICE_OPTIONS = [
  { id: "alloy", name: "Alloy", description: "Neutral & balanced", color: "from-blue-500 to-cyan-400" },
  { id: "echo", name: "Echo", description: "Warm & deep", color: "from-amber-500 to-orange-400" },
  { id: "fable", name: "Fable", description: "Expressive & bright", color: "from-pink-500 to-rose-400" },
  { id: "onyx", name: "Onyx", description: "Authoritative & rich", color: "from-violet-500 to-purple-400" },
  { id: "nova", name: "Nova", description: "Friendly & energetic", color: "from-emerald-500 to-teal-400" },
  { id: "shimmer", name: "Shimmer", description: "Soft & professional", color: "from-indigo-500 to-blue-400" },
  { id: "aditi", name: "Aditi (IN)", description: "Warm Indian Female", color: "from-orange-500 to-yellow-400" },
  { id: "karan", name: "Karan (IN)", description: "Calm Indian Male", color: "from-red-500 to-orange-400" },
  { id: "priya", name: "Priya (IN)", description: "Friendly Indian Female", color: "from-yellow-500 to-emerald-400" },
];


const PERSONALITY_OPTIONS = [
  { id: "professional", label: "Professional", emoji: "💼", desc: "Formal, authoritative, trustworthy" },
  { id: "friendly", label: "Friendly", emoji: "😊", desc: "Warm, approachable, conversational" },
  { id: "enthusiastic", label: "Enthusiastic", emoji: "🔥", desc: "Energetic, upbeat, exciting" },
  { id: "calm", label: "Calm", emoji: "🧘", desc: "Soothing, patient, reassuring" },
  { id: "authoritative", label: "Authoritative", emoji: "⚖️", desc: "Confident, commanding, decisive" },
];

const LANGUAGE_MAPPING: Record<string, { label: string; locale: string }> = {
  en: { label: "English", locale: "en-US" },
  hi: { label: "Hindi", locale: "hi-IN" },
  es: { label: "Spanish", locale: "es-ES" },
  fr: { label: "French", locale: "fr-FR" },
  de: { label: "German", locale: "de-DE" },
  ja: { label: "Japanese", locale: "ja-JP" },
};

interface Message {
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

const CALL_WAVE_BARS = Array.from({ length: 9 }, () => ({
  max: 14 + Math.random() * 26,
  duration: 0.7 + Math.random() * 0.5,
}));

export default function AgentDemoClient({ agent, userId }: AgentDemoClientProps) {
  const router = useRouter();

  // Active simulation settings
  const [simulationAgent, setSimulationAgent] = useState<Agent>(agent);

  // Settings Panel Form State
  const [form, setForm] = useState({
    name: agent.name,
    businessType: agent.business_type || "",
    greeting: agent.greeting,
    systemPrompt: agent.system_prompt,
    voiceId: agent.voice_id || "alloy",
    language: agent.language || "en",
    personality: agent.personality || "professional",
  });

  // UI / Action State
  const [tab, setTab] = useState<TabState>("prompt");
  const [mode, setMode] = useState<ModeState>("voice");
  const [saving, setSaving] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Call simulator state
  const [callState, setCallState] = useState<CallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiStatus, setAiStatus] = useState("Ready");
  const [textInput, setTextInput] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speakingRef = useRef<boolean>(false);

  // ElevenLabs Voice STT and TTS states
  const [sttEngine, setSttEngine] = useState<"browser" | "elevenlabs">("browser");
  const [isRecording, setIsRecording] = useState(false);
  const [leadCreated, setLeadCreated] = useState(false);
  const [capturedLeadData, setCapturedLeadData] = useState<any>(null);
  const [activeLang, setActiveLang] = useState(simulationAgent.language || "en");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isAiActiveRef = useRef<boolean>(false);
  const ttsAbortControllerRef = useRef<AbortController | null>(null);
  const [micAccessDenied, setMicAccessDenied] = useState(false);
  const micAccessDeniedRef = useRef<boolean>(false);
  const setMicAccessState = (val: boolean) => {
    micAccessDeniedRef.current = val;
    setMicAccessDenied(val);
  };
  const [noDeviceDetected, setNoDeviceDetected] = useState(false);
  const noDeviceDetectedRef = useRef<boolean>(false);
  const setNoDeviceState = (val: boolean) => {
    noDeviceDetectedRef.current = val;
    setNoDeviceDetected(val);
  };
  const audioContextRef = useRef<AudioContext | null>(null);
  const handleGenerateResponseRef = useRef<any>(null);

  // Refs to mirror state for use inside SpeechRecognition callbacks (avoids stale closures)
  const callStateRef = useRef<CallState>(callState);
  const isMutedRef = useRef(isMuted);
  const modeRef = useRef<ModeState>(mode);
  const sttEngineRef = useRef<"browser" | "elevenlabs">(sttEngine);

  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { sttEngineRef.current = sttEngine; }, [sttEngine]);

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer effect
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

  /**
   * Robust microphone stream acquisition.
   * Tries the system default first; on NotFoundError, iterates through all
   * enumerated audioinput devices by explicit deviceId until one opens.
   * Returns the MediaStream, or throws if absolutely no device can be opened.
   */
  const getAudioStream = async (): Promise<MediaStream> => {
    // Attempt 1: default device
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (defaultErr: any) {
      if (defaultErr.name !== "NotFoundError") throw defaultErr;
      console.warn("Default audio device failed, trying specific devices...");
    }

    // Attempt 2: iterate enumerated devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(
      (d) => d.kind === "audioinput" && d.deviceId && d.deviceId !== "default" && d.deviceId !== "communications"
    );

    for (const device of audioInputs) {
      try {
        console.log(`Trying audio device: ${device.label || device.deviceId}`);
        return await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: device.deviceId } },
        });
      } catch (devErr: any) {
        console.warn(`Device ${device.label || device.deviceId} failed:`, devErr.name);
        continue;
      }
    }

    throw new DOMException("No audio input device could be opened", "NotFoundError");
  };

  // Helper to dynamically detect language from response text
  const detectLocale = useCallback((text: string, defaultLang: string) => {
    // Check for Devnagari (Hindi) characters
    if (/[\u0900-\u097F]/.test(text)) {
      return "hi-IN";
    }
    // Check for Japanese characters (hiragana, katakana, kanji)
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufa6f]/.test(text)) {
      return "ja-JP";
    }
    return LANGUAGE_MAPPING[defaultLang]?.locale || "en-US";
  }, []);

  // Web Speech API Synthesis Fallback
  const speakTextFallback = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onEnd?.();
      return;
    }

    // Stop any pending or active ElevenLabs playbacks/fetches
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (ttsAbortControllerRef.current) {
      ttsAbortControllerRef.current.abort();
      ttsAbortControllerRef.current = null;
    }

    window.speechSynthesis.cancel();
    speakingRef.current = true;

    const locale = detectLocale(text, activeLang);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (locale.startsWith("hi")) {
      selectedVoice = voices.find(v => 
        v.lang.startsWith("hi") || v.lang.startsWith("en-IN") || v.name.includes("India") || v.name.includes("IN")
      );
    } else if (locale.startsWith("ja")) {
      selectedVoice = voices.find(v => v.lang.startsWith("ja") || v.lang.startsWith("ja-JP"));
    } else {
      const vId = simulationAgent.voice_id;
      if (vId === "aditi" || vId === "priya") {
        selectedVoice = voices.find(v => 
          v.lang.startsWith("en-IN") || v.lang.startsWith("hi-IN") ||
          v.name.includes("India") || v.name.includes("IN") || v.name.includes("Veena") || v.name.includes("Heera") || v.name.includes("Kalpana") || v.name.includes("Aditi") || v.name.includes("Priya")
        );
      } else if (vId === "karan") {
        selectedVoice = voices.find(v => 
          (v.lang.startsWith("en-IN") || v.lang.startsWith("hi-IN") || v.name.includes("India") || v.name.includes("IN")) && 
          (v.name.includes("Ravi") || v.name.includes("Hemant") || v.name.includes("Karun") || v.name.includes("Karan") || v.name.includes("male") || v.name.includes("Male") || v.name.includes("Google UK English Male"))
        );
      } else if (vId === "nova" || vId === "shimmer" || vId === "fable") {
        selectedVoice = voices.find(v => 
          v.lang.startsWith(locale.split("-")[0]) && 
          (v.name.includes("Zira") || v.name.includes("Google US English") || v.name.includes("Samantha") || v.name.includes("female") || v.name.includes("Female") || v.name.includes("Natural"))
        );
      } else if (vId === "onyx" || vId === "echo") {
        selectedVoice = voices.find(v => 
          v.lang.startsWith(locale.split("-")[0]) && 
          (v.name.includes("David") || v.name.includes("Google UK English Male") || v.name.includes("male") || v.name.includes("Male") || v.name.includes("Hazel"))
        );
      }
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith(locale.split("-")[0])) || voices.find(v => v.lang.startsWith("en")) || voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    if (simulationAgent.personality === "friendly") {
      utterance.rate = 1.05;
      utterance.pitch = 1.05;
    } else if (simulationAgent.personality === "calm") {
      utterance.rate = 0.9;
      utterance.pitch = 0.95;
    } else if (simulationAgent.personality === "enthusiastic") {
      utterance.rate = 1.15;
      utterance.pitch = 1.1;
    }

    utterance.onend = () => {
      speakingRef.current = false;
      onEnd?.();
    };
    utterance.onerror = (err) => {
      console.error("Speech synthesis fallback error:", err);
      speakingRef.current = false;
      onEnd?.();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis failed synchronously:", e);
      speakingRef.current = false;
      onEnd?.();
    }
  }, [simulationAgent, activeLang, detectLocale]);

  // ElevenLabs premium TTS conversion
  const speakText = useCallback(async (text: string, onEnd?: () => void) => {
    speakingRef.current = true;

    // Abort any pending fetches
    if (ttsAbortControllerRef.current) {
      ttsAbortControllerRef.current.abort();
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const controller = new AbortController();
    ttsAbortControllerRef.current = controller;
    let fallbackTriggered = false;

    const triggerFallback = () => {
      if (fallbackTriggered) return;
      fallbackTriggered = true;
      speakTextFallback(text, onEnd);
    };

    try {
      const response = await fetch("/api/voice/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceId: simulationAgent.voice_id,
        }),
        signal: controller.signal,
      });

      if (ttsAbortControllerRef.current === controller) {
        ttsAbortControllerRef.current = null;
      }

      if (!response.ok) {
        throw new Error(`TTS API failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Try HTMLAudioElement first; fall back to AudioContext (decodeAudioData) if it fails
      const playWithAudioElement = (): Promise<void> =>
        new Promise((resolve, reject) => {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => {
            speakingRef.current = false;
            URL.revokeObjectURL(audioUrl);
            onEnd?.();
            resolve();
          };

          audio.onerror = () => {
            reject(new Error("HTMLAudioElement playback failed"));
          };

          audio.play().catch(reject);
        });

      const playWithAudioContext = async (): Promise<void> => {
        try {
          const ctx = audioContextRef.current || new AudioContext();
          audioContextRef.current = ctx;
          if (ctx.state === "suspended") await ctx.resume();

          const arrayBuf = await audioBlob.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuf);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.onended = () => {
            speakingRef.current = false;
            URL.revokeObjectURL(audioUrl);
            onEnd?.();
          };
          source.start(0);
        } catch (ctxErr) {
          console.warn("AudioContext playback also failed:", ctxErr);
          URL.revokeObjectURL(audioUrl);
          triggerFallback();
        }
      };

      try {
        await playWithAudioElement();
      } catch {
        console.warn("HTMLAudioElement playback failed, trying AudioContext...");
        await playWithAudioContext();
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return; // Silently ignore aborted requests
      }
      if (ttsAbortControllerRef.current === controller) {
        ttsAbortControllerRef.current = null;
      }
      console.warn("ElevenLabs TTS conversion failed, falling back to browser SpeechSynthesis:", err);
      triggerFallback();
    }
  }, [simulationAgent.voice_id, speakTextFallback]);

  // Web Speech API Recognition
  const startListening = useCallback(() => {
    if (typeof window === "undefined" || isMutedRef.current || modeRef.current === "chat" || sttEngineRef.current !== "browser" || isAiActiveRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = LANGUAGE_MAPPING[activeLang]?.locale || "en-US";

    rec.onstart = () => {
      setAiStatus("Listening...");
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (!transcript || transcript.trim() === "") return;

      const userMsg: Message = { role: "user", text: transcript, timestamp: new Date() };
      setMessages((prev) => {
        const nextMsgs = [...prev, userMsg];
        setTimeout(() => handleGenerateResponseRef.current?.(nextMsgs), 0);
        return nextMsgs;
      });
    };

    rec.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setMicAccessState(true);
        setAiStatus("Mic Access Denied");
        console.warn("Speech recognition not allowed: falling back to ElevenLabs Scribe (Push-to-Talk).");
        setSttEngine("elevenlabs");
      } else if (event.error === "aborted") {
        // Intentional abort — no action needed
      } else if (event.error === "no-speech") {
        // No speech detected — restart if still active
        if (callStateRef.current === "active" && !isMutedRef.current && !isAiActiveRef.current && !micAccessDeniedRef.current && modeRef.current === "voice" && sttEngineRef.current === "browser") {
          try { rec.start(); } catch {}
        }
      } else {
        console.error("Speech recognition error:", event.error);
      }
    };

    // Use refs in onend to avoid stale closure over state values
    rec.onend = () => {
      if (callStateRef.current === "active" && !isMutedRef.current && !isAiActiveRef.current && !micAccessDeniedRef.current && modeRef.current === "voice" && sttEngineRef.current === "browser") {
        try { rec.start(); } catch {}
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  }, [activeLang]);

  // Restart listening when active language changes
  useEffect(() => {
    if (callState === "active" && sttEngine === "browser" && !isAiActiveRef.current && !isMuted) {
      startListening();
    }
  }, [activeLang, callState, sttEngine, isMuted, startListening]);

  // ElevenLabs recording methods
  const startElevenLabsRecording = async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices) return;

    // Pre-check: does the system have any audio input device at all?
    if (noDeviceDetectedRef.current) {
      setAiStatus("No Microphone Detected — connect a mic and reload");
      return;
    }

    // Stop playback if speaking
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    speakingRef.current = false;

    try {
      // Verify an audio input device exists before requesting the stream
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudioInput = devices.some((d) => d.kind === "audioinput");
      if (!hasAudioInput) {
        setNoDeviceState(true);
        setAiStatus("No Microphone Detected — connect a mic and reload");
        return;
      }

      const stream = await getAudioStream();
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setIsRecording(false);
        setAiStatus("Transcribing...");

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");

          const res = await fetch("/api/voice/stt", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("STT API failed");

          const data = await res.json();
          const transcript = data.text;
          if (transcript && transcript.trim() !== "") {
            const userMsg: Message = { role: "user", text: transcript, timestamp: new Date() };
            setMessages((prev) => {
              const nextMsgs = [...prev, userMsg];
              setTimeout(() => handleGenerateResponse(nextMsgs), 0);
              return nextMsgs;
            });
          } else {
            setAiStatus("No speech detected");
            setTimeout(() => setAiStatus("Push to Talk"), 1500);
          }
        } catch (err) {
          console.error("ElevenLabs transcription failed:", err);
          setAiStatus("Transcription failed — tap Speak to retry");
          setTimeout(() => {
            if (callStateRef.current === "active") setAiStatus("Push to Talk");
          }, 2500);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAiStatus("Recording voice...");
    } catch (err: any) {
      console.error("Failed to access microphone:", err);
      if (err.name === "NotFoundError" || err.message?.includes("device not found")) {
        setNoDeviceState(true);
        setAiStatus("No Microphone Detected — connect a mic and reload");
      } else if (err.name === "NotAllowedError") {
        setMicAccessState(true);
        setAiStatus("Mic Access Denied");
      } else {
        setAiStatus("Mic error — please try again");
      }
    }
  };

  const stopElevenLabsRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleGenerateResponse = async (currentMessages: Message[]) => {
    isAiActiveRef.current = true;
    setAiStatus("Thinking...");
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    let responseText = "";
    try {
      const history = currentMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      // Dynamically instruct the agent to match the caller's language input
      const baseSystemPrompt = simulationAgent.system_prompt;
      const multilingualPrompt = `${baseSystemPrompt}\n\nIMPORTANT: You are a multilingual assistant. Identify the language spoken by the customer and reply in that EXACT same language (e.g. Hindi in Devanagari script, Spanish in Spanish, French in French). Speak naturally and keep responses concise (1-2 sentences).`;

      responseText = await getAiResponse(multilingualPrompt, history);
    } catch (err) {
      console.error("Response generation failed:", err);
      responseText = "I'm having trouble connecting right now. Could you please repeat that?";
    }

    const updatedMessages: Message[] = [
      ...currentMessages,
      { role: "ai", text: responseText, timestamp: new Date() },
    ];
    setMessages(updatedMessages);

    // Call lead extraction in the background
    if (!leadCreated) {
      extractAndCreateLead(simulationAgent.id, userId, updatedMessages)
        .then((res) => {
          if (res && res.success) {
            setLeadCreated(true);
            if (res.leadData) {
              setCapturedLeadData(res.leadData);
            }
          }
        })
        .catch((err) => console.error("Lead extraction error:", err));
    }

    if (mode === "voice") {
      setAiStatus("Speaking...");
      speakText(responseText, () => {
        isAiActiveRef.current = false;
        if (callState === "active" && !isMuted) {
          if (sttEngine === "browser") {
            setAiStatus("Listening...");
            startListening();
          } else {
            setAiStatus("Push to Talk");
          }
        } else if (isMuted) {
          setAiStatus("Muted");
        } else {
          setAiStatus("Ready");
        }
      });
    } else {
      isAiActiveRef.current = false;
      setAiStatus("Ready");
    }
  };
  useEffect(() => {
    handleGenerateResponseRef.current = handleGenerateResponse;
  });

  // Clean up
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
    };
  }, []);

  const startCall = async () => {
    // Reset flags at the start before any checks
    setMicAccessState(false);
    setNoDeviceState(false);

    // Unlock AudioContext on user gesture (required by Chrome autoplay policy)
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new AudioContext();
      } catch { /* AudioContext not available */ }
    }
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }

    // Check microphone availability via enumerateDevices + getUserMedia
    if (typeof window !== "undefined" && navigator.mediaDevices && mode === "voice") {
      try {
        // Step 1: Check if any audio input device exists
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");

        if (audioInputs.length === 0) {
          console.warn("No audio input devices detected by enumerateDevices.");
          setNoDeviceState(true);
          setAiStatus("No Microphone Detected");
          setSttEngine("elevenlabs");
        } else {
          // Step 2: Attempt to open a mic stream (tries default, then each device)
          try {
            const stream = await getAudioStream();
            stream.getTracks().forEach((track) => track.stop());
            // Mic is working — keep browser STT engine
          } catch (err: any) {
            console.warn("Microphone access check failed:", err.name, err.message);
            if (err.name === "NotFoundError") {
              setNoDeviceState(true);
              setAiStatus("No Microphone Detected");
            } else if (err.name === "NotAllowedError" || err.name === "SecurityError") {
              setMicAccessState(true);
              setAiStatus("Mic Access Denied");
            } else {
              setNoDeviceState(true);
              setAiStatus("Microphone Unavailable");
            }
            setSttEngine("elevenlabs");
          }
        }
      } catch (enumErr) {
        console.warn("enumerateDevices() failed:", enumErr);
        setSttEngine("elevenlabs");
      }
    }

    setCallState("connecting");
    setMessages([]);
    setElapsed(0);
    setAiStatus("Connecting receptionist...");
    setIsMuted(false);
    speakingRef.current = false;
    setLeadCreated(false);
    setCapturedLeadData(null);
    isAiActiveRef.current = false;

    // Log call stat to database
    incrementAgentCalls(simulationAgent.id).catch((err) => {
      console.error("Failed to increment call count:", err);
    });

    setTimeout(() => {
      setCallState("active");
      const greetingMsg: Message = { role: "ai", text: simulationAgent.greeting, timestamp: new Date() };
      setMessages([greetingMsg]);

      if (mode === "voice") {
        setAiStatus("Speaking...");
        speakText(simulationAgent.greeting, () => {
          if (sttEngineRef.current === "browser" && !micAccessDeniedRef.current) {
            setAiStatus("Listening...");
            startListening();
          } else {
            setAiStatus("Push to Talk");
          }
        });
      } else {
        setAiStatus("Ready");
      }
    }, 1500);
  };

  const endCall = useCallback(() => {
    setCallState("ended");
    setAiStatus("Call ended");
    isAiActiveRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
  }, []);

  // Text Chat Submit Handler
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || callState !== "active") return;

    const userText = textInput.trim();
    setTextInput("");

    const userMsg: Message = { role: "user", text: userText, timestamp: new Date() };
    setMessages((prev) => {
      const nextMsgs = [...prev, userMsg];
      setTimeout(() => handleGenerateResponse(nextMsgs), 0);
      return nextMsgs;
    });
  };

  // Settings Save Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const { error: updateError } = await supabase
        .from("voice_agents")
        .update({
          name: form.name,
          business_type: form.businessType || null,
          greeting: form.greeting,
          system_prompt: form.systemPrompt,
          voice_id: form.voiceId,
          language: form.language,
          personality: form.personality,
        })
        .eq("id", agent.id)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // Update simulation agent properties locally
      const updatedAgent: Agent = {
        ...simulationAgent,
        name: form.name,
        business_type: form.businessType || null,
        greeting: form.greeting,
        system_prompt: form.systemPrompt,
        voice_id: form.voiceId,
        language: form.language,
        personality: form.personality,
      };

      setSimulationAgent(updatedAgent);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      console.error("Save error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to save settings";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // AI Polish instructions
  const handlePolishPrompt = async () => {
    if (!form.systemPrompt.trim()) return;
    setPolishing(true);
    setError(null);

    try {
      const polished = await polishSystemPrompt(
        form.name,
        form.businessType,
        form.personality,
        form.systemPrompt
      );
      setForm((prev) => ({ ...prev, systemPrompt: polished }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Polishing error:", err);
      setError("AI Refinement failed. Please check connection.");
    } finally {
      setPolishing(false);
    }
  };

  // Personality Gradient picker
  const getGradient = (p: string) => {
    const mapping: Record<string, string> = {
      professional: "from-blue-500 to-cyan-400",
      friendly: "from-emerald-500 to-teal-400",
      enthusiastic: "from-pink-500 to-rose-400",
      calm: "from-violet-500 to-purple-400",
      authoritative: "from-amber-500 to-orange-400",
    };
    return mapping[p] || "from-indigo-500 to-blue-400";
  };

  const currentGradient = getGradient(simulationAgent.personality);

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/agents")}
            className="p-2 rounded-xl glass hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer text-muted hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl lg:text-2xl font-bold">{simulationAgent.name}</h1>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-gradient-to-r ${currentGradient} text-white`}>
                {simulationAgent.personality}
              </span>
            </div>
            <p className="text-xs text-muted">Test & improve your AI voice receptionist in real-time</p>
          </div>
        </div>

        {/* Live / Status summary */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-xs text-muted-foreground">Interactive Environment</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected to DB
            </div>
          </div>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        {/* LEFT COLUMN: SIMULATOR (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl glass border-glow p-6 flex flex-col items-center relative overflow-hidden min-h-[580px]">
            <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />

            {/* Header info */}
            <div className="w-full flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6 z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-indigo flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Live Agent Simulator
              </span>
              
              {/* Mode switch */}
              <div className="flex p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                <button
                  onClick={() => {
                    setMode("voice");
                    if (callState === "active") endCall();
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    mode === "voice"
                      ? "bg-brand-indigo text-white shadow-md"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Voice
                </button>
                <button
                  onClick={() => {
                    setMode("chat");
                    if (callState === "active") endCall();
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    mode === "chat"
                      ? "bg-brand-indigo text-white shadow-md"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Chat
                </button>
              </div>
            </div>

            {/* Voice call visualizer */}
            {mode === "voice" && (
              <div className="flex-1 flex flex-col items-center justify-center py-6 w-full z-10">
                {/* AI status indicator */}
                <motion.div
                  key={aiStatus}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-medium text-muted mb-4 bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-full capitalize"
                >
                  {aiStatus}
                </motion.div>

                {/* STT Engine Select & Language Select */}
                {callState === "active" && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                    <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs">
                      <button
                        onClick={() => {
                          if (isRecording) stopElevenLabsRecording();
                          setSttEngine("browser");
                          if (callState === "active" && !isMuted && !isAiActiveRef.current) {
                            setTimeout(() => startListening(), 50);
                          }
                        }}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                          sttEngine === "browser"
                            ? "bg-brand-indigo/20 border border-brand-indigo/30 text-white"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        Hands-Free (Browser)
                      </button>
                      <button
                        onClick={() => {
                          if (recognitionRef.current) {
                            try { recognitionRef.current.abort(); } catch {}
                          }
                          setSttEngine("elevenlabs");
                          if (callState === "active") {
                            setAiStatus("Push to Talk");
                          }
                        }}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                          sttEngine === "elevenlabs"
                            ? "bg-brand-indigo/20 border border-brand-indigo/30 text-white"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        ElevenLabs Scribe
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] rounded-lg px-2 py-0.5 text-xs text-muted">
                      <span>Speaking:</span>
                      <select
                        value={activeLang}
                        onChange={(e) => setActiveLang(e.target.value)}
                        className="bg-transparent text-white border-none outline-none font-medium cursor-pointer py-0.5 px-1 text-[10px]"
                      >
                        {Object.entries(LANGUAGE_MAPPING).map(([key, val]) => (
                          <option key={key} value={key} className="bg-[#050510] text-white">
                            {val.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Main Orb */}
                <div className="relative w-44 h-44 mb-8">
                  {/* Outer breathing circle */}
                  {callState === "active" && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border border-brand-indigo/30"
                        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2.2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-3 rounded-full border border-brand-purple/20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: 0.4 }}
                      />
                    </>
                  )}

                  {/* Core Orb */}
                  <motion.div
                    className={`absolute inset-6 rounded-full flex items-center justify-center ${
                      callState === "active"
                        ? `bg-gradient-to-br ${currentGradient}`
                        : callState === "connecting"
                        ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                        : callState === "ended"
                        ? "bg-gradient-to-br from-gray-600 to-gray-700"
                        : `bg-gradient-to-br from-brand-indigo/60 to-brand-purple/60`
                    }`}
                    animate={
                      callState === "active" && aiStatus === "Speaking..."
                        ? { y: [0, -4, 0], scale: [1, 1.03, 1] }
                        : callState === "connecting"
                        ? { scale: [1, 1.04, 1] }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      boxShadow:
                        callState === "active"
                          ? "0 0 35px rgba(99,102,241,0.35), 0 0 70px rgba(139,92,246,0.15)"
                          : "0 0 20px rgba(99,102,241,0.08)",
                    }}
                  >
                    {/* Animated waveform bars when speaking */}
                    {callState === "active" && aiStatus === "Speaking..." && (
                      <div className="flex items-center gap-0.5 h-10">
                        {CALL_WAVE_BARS.map((bar, i) => (
                          <motion.div
                            key={i}
                            className="w-1 rounded-full bg-white/70"
                            animate={{
                              height: ["6px", `${bar.max}px`, "6px"],
                            }}
                            transition={{
                              duration: bar.duration,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.07,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Listening glow/wave */}
                    {callState === "active" && aiStatus === "Listening..." && (
                      <div className="flex items-center gap-1.5">
                        <motion.div
                          className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                          animate={{ scale: [0.8, 1.3, 0.8] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        />
                        <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Live</span>
                      </div>
                    )}

                    {/* Spinner during connection */}
                    {callState === "connecting" && (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    )}

                    {/* Phone/Idle Icon */}
                    {(callState === "idle" || callState === "ended") && (
                      <Phone className="w-8 h-8 text-white/70" />
                    )}
                  </motion.div>
                </div>

                {/* Call Duration Counter */}
                {(callState === "active" || callState === "ended") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-mono text-muted mb-6"
                  >
                    {formatTime(elapsed)}
                  </motion.div>
                )}

                {callState === "active" && noDeviceDetected && (
                  <div className="max-w-[300px] text-center px-4 py-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-300 z-10">
                    <p className="font-bold mb-1">⚠️ No Microphone Detected</p>
                    <p className="opacity-80 leading-relaxed">
                      Your system has no audio input device available. Please connect a microphone, check System Settings &gt; Sound &gt; Input, then reload this page. You can still use <strong>Chat Mode</strong> below.
                    </p>
                  </div>
                )}

                {callState === "active" && micAccessDenied && !noDeviceDetected && (
                  <div className="max-w-[280px] text-center px-4 py-3 mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 z-10">
                    <p className="font-bold mb-1">Hands-Free Mode Blocked</p>
                    <p className="opacity-80 leading-relaxed">
                      Chrome blocked microphone access. Please click the lock icon in the address bar &gt; Site Settings &gt; Microphone &gt; Allow, then reload. You can use <strong>Push-to-Talk</strong> or <strong>Chat Mode</strong> below.
                    </p>
                  </div>
                )}

                {/* Voice Call controls */}
                <div className="flex items-center gap-5">
                  {callState === "idle" && (
                    <button
                      onClick={startCall}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      Start Testing Call
                    </button>
                  )}

                  {callState === "active" && (
                    <>
                      {sttEngine === "elevenlabs" ? (
                        <button
                          onClick={() => {
                            if (isRecording) {
                              stopElevenLabsRecording();
                            } else {
                              if (!isAiActiveRef.current) {
                                startElevenLabsRecording();
                              }
                            }
                          }}
                          className={`w-14 h-12 rounded-xl flex flex-col items-center justify-center border transition-all duration-300 cursor-pointer ${
                            isRecording
                              ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                              : "bg-brand-indigo/10 border-brand-indigo/20 text-brand-indigo hover:bg-brand-indigo/20"
                          }`}
                          aria-label={isRecording ? "Stop speaking" : "Click to Speak"}
                        >
                          <Mic className="w-4 h-4 text-brand-indigo" />
                          <span className="text-[8px] font-bold mt-0.5 uppercase tracking-wider text-brand-indigo">
                            {isRecording ? "Stop" : "Speak"}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const nextMute = !isMuted;
                            setIsMuted(nextMute);
                            if (nextMute) {
                              if (recognitionRef.current) {
                                try { recognitionRef.current.abort(); } catch {}
                              }
                              setAiStatus("Muted");
                            } else {
                              if (!isAiActiveRef.current) {
                                setAiStatus("Listening...");
                                setTimeout(() => startListening(), 50);
                              }
                            }
                          }}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                            isMuted
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-white/5 border-white/10 text-foreground hover:bg-white/[0.08]"
                        }`}
                          aria-label={isMuted ? "Unmute Mic" : "Mute Mic"}
                        >
                          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      )}

                      <button
                        onClick={endCall}
                        className="w-14 h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white hover:shadow-[0_0_25px_rgba(239,68,68,0.35)] transition-all duration-300 hover:scale-105 cursor-pointer"
                        aria-label="Hang up"
                      >
                        <PhoneOff className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {callState === "ended" && (
                    <button
                      onClick={startCall}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
                    >
                      Call Again
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Chat environment visualizer */}
            {mode === "chat" && (
              <div className="flex-1 flex flex-col w-full z-10">
                {callState !== "active" ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <MessageSquare className="w-10 h-10 text-brand-indigo mb-3 opacity-60" />
                    <h3 className="font-semibold text-sm mb-1.5">Interactive Chat Sandbox</h3>
                    <p className="text-xs text-muted max-w-[280px] mb-6">
                      Test prompt reactions and message flows instantly in text mode.
                    </p>
                    <button
                      onClick={startCall}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Open Chat Session
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-3 max-h-[350px]">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}
                        >
                          {msg.role === "ai" && (
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentGradient} flex items-center justify-center shrink-0 text-[10px] text-white font-bold`}>
                              AI
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                              msg.role === "user"
                                ? "bg-brand-indigo/20 text-foreground"
                                : "bg-white/5 border border-white/[0.06] text-muted"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      <div ref={transcriptEndRef} />
                    </div>

                    {/* Chat Text Input Form */}
                    <form onSubmit={handleSendText} className="pt-3 border-t border-white/[0.06] flex gap-2">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type a query to test your agent..."
                        className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs focus:outline-none focus:border-brand-indigo/50 text-foreground placeholder:text-muted-foreground"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all cursor-pointer"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Transcript scrolling list for VOICE mode */}
            {mode === "voice" && callState === "active" && messages.length > 0 && (
              <div className="w-full mt-4 pt-4 border-t border-white/[0.06] max-h-40 overflow-y-auto space-y-2.5 z-10">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">Live Transcript</span>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 text-xs ${msg.role === "user" ? "justify-end" : ""}`}>
                    <span className={`font-semibold ${msg.role === "user" ? "text-brand-indigo" : "text-brand-purple"}`}>
                      {msg.role === "user" ? "Caller:" : "Agent:"}
                    </span>
                    <span className="text-muted-foreground">{msg.text}</span>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            )}

            {/* Call State display */}
            {callState === "ended" && messages.length > 0 && (
              <div className="w-full mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center z-10">
                <div className="text-xs font-semibold text-muted">Test Call Completed</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Duration: {formatTime(elapsed)} • {messages.length} exchanges
                </div>
              </div>
            )}

            {leadCreated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mx-6 mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between z-10"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-400 animate-bounce" />
                  <div>
                    <span className="font-semibold block text-emerald-400">Lead Captured!</span>
                    <span className="text-[10px] text-emerald-400/80">
                      {capturedLeadData?.customer_name ? `Name: ${capturedLeadData.customer_name}` : "Details saved to dashboard."}
                    </span>
                  </div>
                </div>
                {capturedLeadData?.phone && (
                  <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono text-emerald-300">
                    {capturedLeadData.phone}
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Guidelines / Tips card */}
          <div className="rounded-2xl glass border-glow p-5 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-brand-indigo" />
              Guidelines to Improve Quality
            </h3>
            <ul className="text-xs text-muted space-y-2 list-disc list-inside">
              <li>Keep the <strong className="text-foreground">Greeting</strong> short. Long audio greetings cause callers to hang up.</li>
              <li>Provide concrete rules in the <strong className="text-foreground">System Prompt</strong> on handling booking pricing.</li>
              <li>Explicitly command the agent to ask for name & phone details before offering booking options.</li>
              <li>Instruct the AI on handling objections or transferring.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: CONFIGURATION PANEL (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="rounded-2xl glass border-glow p-6 space-y-6">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-purple" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-purple">Configure Agent Properties</span>
              </div>

              {/* Tabs */}
              <div className="flex p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setTab("prompt")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    tab === "prompt"
                      ? "bg-brand-purple text-white shadow-md"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Prompt & Greeting
                </button>
                <button
                  type="button"
                  onClick={() => setTab("profile")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    tab === "profile"
                      ? "bg-brand-purple text-white shadow-md"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Voice & Tone
                </button>
              </div>
            </div>

            {/* TAB CONTENT: PROMPT & GREETING */}
            {tab === "prompt" && (
              <div className="space-y-5 animate-fade-up">
                {/* Greeting Message */}
                <div>
                  <label className="text-xs font-semibold text-muted block mb-2">Greeting Message (Initial Audio Script) *</label>
                  <textarea
                    value={form.greeting}
                    onChange={(e) => setForm({ ...form, greeting: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/20 transition-all text-foreground resize-none"
                    placeholder="e.g. Hello! Thank you for calling Dental Care Clinic. How can I help you today?"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">This is the greeting spoken by the receptionist when a user calls.</p>
                </div>

                {/* System Prompt instructions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted">System Instructions / Behavior Prompt *</label>
                    <button
                      type="button"
                      onClick={handlePolishPrompt}
                      disabled={polishing || !form.systemPrompt.trim()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-indigo/10 hover:bg-brand-indigo/20 text-brand-indigo hover:text-white border border-brand-indigo/20 text-2xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {polishing ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Polishing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 animate-pulse" />
                          AI Refine Prompt
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={form.systemPrompt}
                    onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/20 transition-all text-foreground resize-none leading-relaxed"
                    placeholder="Instructions defining role, facts, pricing, constraints, call scheduling details..."
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Define the receptionist&apos;s persona, schedule flow, pricing policies, FAQs, and lead capture questions.</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VOICE & TONE */}
            {tab === "profile" && (
              <div className="space-y-5 animate-fade-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1.5">Agent Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:outline-none focus:border-brand-purple/50 transition-all text-foreground"
                    />
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1.5">Business Industry</label>
                    <input
                      type="text"
                      value={form.businessType}
                      onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                      placeholder="e.g. Dental Clinic, Spa, Legal Firm"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:outline-none focus:border-brand-purple/50 transition-all text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Language Selector */}
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1.5">Primary Language</label>
                    <div className="relative">
                      <select
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:outline-none focus:border-brand-purple/50 transition-all text-foreground appearance-none cursor-pointer"
                      >
                        {Object.entries(LANGUAGE_MAPPING).map(([key, val]) => (
                          <option key={key} value={key} className="bg-background">
                            {val.label} ({val.locale})
                          </option>
                        ))}
                      </select>
                      <Globe className="w-4 h-4 text-muted absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Personality Select */}
                  <div>
                    <label className="text-xs font-semibold text-muted block mb-1.5">Communication Style / Personality</label>
                    <div className="relative">
                      <select
                        value={form.personality}
                        onChange={(e) => setForm({ ...form, personality: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm focus:outline-none focus:border-brand-purple/50 transition-all text-foreground appearance-none cursor-pointer"
                      >
                        {PERSONALITY_OPTIONS.map((p) => (
                          <option key={p.id} value={p.id} className="bg-background">
                            {p.emoji} {p.label} — {p.desc.slice(0, 25)}...
                          </option>
                        ))}
                      </select>
                      <Sparkles className="w-4 h-4 text-muted absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Voice Selection */}
                <div>
                  <label className="text-xs font-semibold text-muted block mb-3">Audio Voice Engine</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {VOICE_OPTIONS.map((v) => (
                      <button
                        type="button"
                        key={v.id}
                        onClick={() => setForm({ ...form, voiceId: v.id })}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-left border transition-all cursor-pointer ${
                          form.voiceId === v.id
                            ? "bg-brand-purple/10 border-brand-purple/40 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${v.color} flex items-center justify-center shrink-0 shadow-sm`}>
                          <Volume2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-foreground truncate">{v.name}</div>
                          <div className="text-[10px] text-muted truncate">{v.description}</div>
                        </div>
                        {form.voiceId === v.id && (
                          <div className="w-4 h-4 rounded-full bg-brand-purple flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error and Success Indicators */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Configuration saved. Simulation updated!</span>
              </motion.div>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.01] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? "Saving configurations..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

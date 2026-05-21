"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Bot,
  Sparkles,
  Volume2,
  Globe,
  MessageSquare,
  Wand2,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { uploadAgentKnowledge } from "@/app/actions/knowledge";

const VOICE_OPTIONS = [
  { id: "alloy", name: "Alloy", description: "Neutral & balanced", color: "from-blue-500 to-cyan-400" },
  { id: "echo", name: "Echo", description: "Warm & deep", color: "from-amber-500 to-orange-400" },
  { id: "fable", name: "Fable", description: "Expressive & bright", color: "from-pink-500 to-rose-400" },
  { id: "onyx", name: "Onyx", description: "Authoritative & rich", color: "from-violet-500 to-purple-400" },
  { id: "nova", name: "Nova", description: "Friendly & energetic", color: "from-emerald-500 to-teal-400" },
  { id: "shimmer", name: "Shimmer", description: "Soft & professional", color: "from-indigo-500 to-blue-400" },
];

const PERSONALITY_OPTIONS = [
  { id: "professional", label: "Professional", emoji: "💼", desc: "Formal, authoritative, trustworthy" },
  { id: "friendly", label: "Friendly", emoji: "😊", desc: "Warm, approachable, conversational" },
  { id: "enthusiastic", label: "Enthusiastic", emoji: "🔥", desc: "Energetic, upbeat, exciting" },
  { id: "calm", label: "Calm", emoji: "🧘", desc: "Soothing, patient, reassuring" },
  { id: "authoritative", label: "Authoritative", emoji: "⚖️", desc: "Confident, commanding, decisive" },
];

const BUSINESS_TEMPLATES = [
  { type: "dental", label: "Dental Clinic", emoji: "🦷" },
  { type: "salon", label: "Salon / Spa", emoji: "💇" },
  { type: "law", label: "Law Firm", emoji: "⚖️" },
  { type: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { type: "real_estate", label: "Real Estate", emoji: "🏠" },
  { type: "fitness", label: "Fitness / Gym", emoji: "💪" },
  { type: "auto", label: "Auto Shop", emoji: "🚗" },
  { type: "custom", label: "Custom", emoji: "✨" },
];

const STEPS = ["Basics", "Personality", "Voice", "Knowledge", "Prompt", "Review"];

function generateSystemPrompt(name: string, businessType: string, personality: string): string {
  const personalityTraits: Record<string, string> = {
    professional: "Professional, formal, and precise. Use proper greetings and maintain a courteous tone throughout.",
    friendly: "Warm, approachable, and conversational. Use a casual but respectful tone. Make callers feel at ease.",
    enthusiastic: "Energetic, upbeat, and exciting. Show genuine excitement. Use exclamations naturally.",
    calm: "Soothing, patient, and reassuring. Speak with measured confidence. Perfect for anxious callers.",
    authoritative: "Confident, direct, and knowledgeable. Communicate clearly and decisively.",
  };

  return `You are an AI receptionist for "${name}."

Your responsibilities:
- Greet callers warmly and identify their needs
- Answer questions about the business
- Qualify leads by collecting name, phone, email, and intent
- Schedule appointments when possible
- Handle objections professionally
- Escalate complex issues to a human team member

Personality: ${personalityTraits[personality] || personalityTraits.professional}

Business type: ${businessType || "General business"}

Important rules:
- Keep responses concise (2-3 sentences per turn)
- Sound natural, never robotic
- Never make up information you don't have
- Always collect contact information before ending the call
- End with: "Is there anything else I can help you with?"`;
}

export default function AgentBuilder({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    businessType: "",
    greeting: "",
    personality: "professional",
    voiceId: "alloy",
    language: "en",
    knowledge: "",
    systemPrompt: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "businessType" || field === "personality" || field === "name") {
      const updated = { ...form, [field]: value };
      if (updated.name && !form.systemPrompt) {
        setForm((prev) => ({
          ...prev,
          [field]: value,
          systemPrompt: generateSystemPrompt(updated.name, updated.businessType, updated.personality),
        }));
      }
    }
  };

  const canNext = (): boolean => {
    if (step === 0) return form.name.length >= 2 && form.greeting.length >= 10;
    if (step === 1) return !!form.personality;
    if (step === 2) return !!form.voiceId;
    if (step === 3) return true; // Knowledge is optional
    if (step === 4) return form.systemPrompt.length >= 20;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Create the voice agent record and return its ID
    const { data: agentData, error: insertError } = await supabase
      .from("voice_agents")
      .insert({
        user_id: userId,
        name: form.name,
        business_type: form.businessType || null,
        greeting: form.greeting,
        system_prompt: form.systemPrompt,
        voice_id: form.voiceId,
        language: form.language,
        personality: form.personality,
        is_active: true,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    // If knowledge text was provided, process and upload embeddings
    if (agentData?.id && form.knowledge.trim()) {
      const uploadRes = await uploadAgentKnowledge(agentData.id, form.knowledge);
      if (!uploadRes.success) {
        console.warn("Knowledge base upload warning:", uploadRes.error);
        // We log but don't fail the entire creation if embeddings fail (e.g. key limits)
      }
    }

    router.push("/dashboard/agents");
    router.refresh();
  };

  const handleGeneratePrompt = () => {
    setForm((prev) => ({
      ...prev,
      systemPrompt: generateSystemPrompt(prev.name, prev.businessType, prev.personality),
    }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Back */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button
          onClick={() => router.push("/dashboard/agents")}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Agents
        </button>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1.5">
          <span className="gradient-text-static">Create Voice Agent</span>
        </h1>
        <p className="text-muted text-sm">Build a custom AI receptionist in minutes</p>
      </motion.div>

      {/* Step indicator */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="mb-8">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer w-full justify-center ${
                  i === step
                    ? "bg-gradient-to-r from-brand-indigo/20 to-brand-purple/20 text-white border border-brand-indigo/30"
                    : i < step
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-white/[0.03] text-muted-foreground border border-white/[0.06]"
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : <span className="w-4 h-4 flex items-center justify-center text-[10px]">{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl glass border-glow p-6 lg:p-8 mb-6"
      >
        {/* Step 0: Basics */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Agent Basics</h2>
                <p className="text-xs text-muted">Name your agent and set the initial greeting</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Agent Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g., BrightSmile Receptionist"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Business Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUSINESS_TEMPLATES.map((biz) => (
                  <button
                    key={biz.type}
                    onClick={() => update("businessType", biz.type === "custom" ? "" : biz.label)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                      form.businessType === biz.label || (biz.type === "custom" && !form.businessType)
                        ? "bg-brand-indigo/10 border-brand-indigo/30 text-white"
                        : "bg-white/[0.03] border-white/[0.06] text-muted hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>{biz.emoji}</span>
                    <span>{biz.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Greeting Message *</label>
              <textarea
                value={form.greeting}
                onChange={(e) => update("greeting", e.target.value)}
                placeholder="Hello! Welcome to [Business Name]. How can I help you today?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">This is the first thing callers will hear.</p>
            </div>
          </div>
        )}

        {/* Step 1: Personality */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Personality</h2>
                <p className="text-xs text-muted">Choose how your agent communicates</p>
              </div>
            </div>

            <div className="space-y-3">
              {PERSONALITY_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => update("personality", p.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all cursor-pointer border ${
                    form.personality === p.id
                      ? "bg-brand-indigo/10 border-brand-indigo/30"
                      : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                  {form.personality === p.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-brand-indigo flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Voice */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Voice Selection</h2>
                <p className="text-xs text-muted">Choose the voice for your agent</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VOICE_OPTIONS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => update("voiceId", v.id)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all cursor-pointer border ${
                    form.voiceId === v.id
                      ? "bg-brand-indigo/10 border-brand-indigo/30"
                      : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center`}>
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{v.description}</div>
                  </div>
                  {form.voiceId === v.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-brand-indigo flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <select
                value={form.language}
                onChange={(e) => update("language", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-brand-indigo/50 transition-all text-sm"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Knowledge Base */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Knowledge Base</h2>
                <p className="text-xs text-muted">Provide FAQs, pricing, rules, and policies for the receptionist</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-indigo/5 border border-brand-indigo/20 text-xs text-brand-indigo font-medium">
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span>This content will be chunked and stored in a vector database for semantic retrieval during calls.</span>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">FAQs & Business Policies (Optional)</label>
              <textarea
                value={form.knowledge}
                onChange={(e) => update("knowledge", e.target.value)}
                placeholder="Example:&#10;Q: What are your hours?&#10;A: We are open Monday to Friday from 9 AM to 6 PM.&#10;&#10;Q: What is the cancellation policy?&#10;A: Cancellations require 24 hours notice to avoid a $15 fee.&#10;&#10;Q: Where are you located?&#10;A: 123 Main Street, Suite 400."
                rows={10}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all text-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 4: System Prompt */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">System Prompt</h2>
                <p className="text-xs text-muted">Define your agent&apos;s behavior and instructions</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300">
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span>The system prompt defines how your agent thinks, responds, and handles conversations.</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Instructions *</label>
                <button
                  onClick={handleGeneratePrompt}
                  className="flex items-center gap-1.5 text-xs text-brand-indigo hover:text-brand-purple transition-colors cursor-pointer"
                >
                  <Wand2 className="w-3 h-3" />
                  Auto-Generate
                </button>
              </div>
              <textarea
                value={form.systemPrompt}
                onChange={(e) => update("systemPrompt", e.target.value)}
                placeholder="You are an AI receptionist for..."
                rows={12}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all text-sm resize-none font-mono text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Review & Create</h2>
                <p className="text-xs text-muted">Confirm your agent configuration</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Name", value: form.name },
                { label: "Business Type", value: form.businessType || "Custom" },
                { label: "Personality", value: PERSONALITY_OPTIONS.find((p) => p.id === form.personality)?.label || form.personality },
                { label: "Voice", value: VOICE_OPTIONS.find((v) => v.id === form.voiceId)?.name || form.voiceId },
                { label: "Language", value: form.language.toUpperCase() },
                { label: "Knowledge Base", value: form.knowledge ? `${form.knowledge.length} characters` : "None uploaded" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                  <span className="text-sm text-muted">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}

              <div className="pt-2">
                <span className="text-sm text-muted block mb-2">Greeting</span>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm">{form.greeting}</div>
              </div>

              <div className="pt-2">
                <span className="text-sm text-muted block mb-2">System Prompt</span>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono max-h-40 overflow-y-auto leading-relaxed">
                  {form.systemPrompt}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
            )}
          </div>
        )}
      </motion.div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => {
              if (step === 3 && !form.systemPrompt) {
                setForm((prev) => ({
                  ...prev,
                  systemPrompt: generateSystemPrompt(prev.name, prev.businessType, prev.personality),
                }));
              }
              setStep((s) => s + 1);
            }}
            disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-sm font-medium hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-medium hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Creating..." : "Create Agent"}
          </button>
        )}
      </div>
    </div>
  );
}

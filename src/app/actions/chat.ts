"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAiResponse(
  systemPrompt: string,
  messages: { role: "user" | "ai"; text: string }[],
  tier: "fast" | "reasoning" = "fast"
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is not set in env variables.");
    throw new Error("API key missing");
  }

  // Format messages for OpenRouter (assistant/user)
  const formattedMessages = messages.map((msg) => ({
    role: msg.role === "ai" ? "assistant" : "user",
    content: msg.text,
  }));

  // Define fallback model hierarchy based on required intelligence/latency tier
  const models =
    tier === "reasoning"
      ? ["anthropic/claude-3.5-sonnet", "openai/gpt-4o"]
      : ["google/gemini-2.5-flash", "openai/gpt-4o-mini"];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://voicecloser.ai",
        "X-Title": "VoiceCloser AI",
      },
      body: JSON.stringify({
        models,
        messages: [
          { role: "system", content: systemPrompt },
          ...formattedMessages,
        ],
        temperature: 0.7,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error details:", errText);
      throw new Error(`OpenRouter API failed: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";
    return reply.trim();
  } catch (error) {
    console.error("Failed to fetch response from OpenRouter:", error);
    throw error;
  }
}

export async function getAiResponseWithTools(
  systemPrompt: string,
  messages: { role: "user" | "ai"; text: string }[],
  tools: any[],
  tier: "fast" | "reasoning" = "fast"
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is not set in env variables.");
    throw new Error("API key missing");
  }

  const formattedMessages = messages.map((msg) => ({
    role: msg.role === "ai" ? "assistant" : "user",
    content: msg.text,
  }));

  const models =
    tier === "reasoning"
      ? ["anthropic/claude-3.5-sonnet", "openai/gpt-4o"]
      : ["google/gemini-2.5-flash", "openai/gpt-4o-mini"];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://voicecloser.ai",
        "X-Title": "VoiceCloser AI",
      },
      body: JSON.stringify({
        models,
        messages: [
          { role: "system", content: systemPrompt },
          ...formattedMessages,
        ],
        tools,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 350,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error details:", errText);
      throw new Error(`OpenRouter API failed: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
    return {
      text: (choice?.content || "").trim(),
      toolCalls: choice?.tool_calls || null,
    };
  } catch (error) {
    console.error("Failed to fetch tool response from OpenRouter:", error);
    throw error;
  }
}

export async function polishSystemPrompt(
  name: string,
  businessType: string,
  personality: string,
  currentPrompt: string
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is not set in env variables.");
    return currentPrompt;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://voicecloser.ai",
        "X-Title": "VoiceCloser AI",
      },
      body: JSON.stringify({
        models: ["google/gemini-2.5-flash", "openai/gpt-4o-mini"],
        messages: [
          {
            role: "system",
            content: "You are a professional prompt engineer for conversational AI voice receptionists. Your goal is to improve the provided system prompt. Make it clean, highly structured (using Markdown), with clear rules on how the agent should handle calls, book appointments, capture leads, and maintain tone. Ensure it remains concise and optimized for voice interactions. Keep it under 400 words.",
          },
          {
            role: "user",
            content: `Here are the details for the voice agent:
Name: ${name}
Business Type: ${businessType}
Personality: ${personality}

Current Prompt:
${currentPrompt}

Please write an optimized, high-quality system prompt based on this. Return ONLY the new system prompt text. Do not include any introductions, explanations, or markdown code fences (like \`\`\`). Just the prompt content itself.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API failed: ${response.status}`);
    }

    const data = await response.json();
    return (data.choices?.[0]?.message?.content || "").trim();
  } catch (error) {
    console.error("Failed to polish system prompt:", error);
    throw error;
  }
}

export async function extractAndCreateLead(
  agentId: string,
  businessId: string,
  messages: { role: "user" | "ai"; text: string }[]
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is not set in env variables.");
    return { success: false, error: "API key missing" };
  }

  const conversationString = messages
    .map((m) => `${m.role === "user" ? "Customer" : "Agent"}: ${m.text}`)
    .join("\n");

  const prompt = `Analyze this conversation between an AI voice receptionist ("Agent") and a caller ("Customer").
Your goal is to determine if the customer's NAME and either their PHONE NUMBER or EMAIL have been collected.

If BOTH the Customer's Name AND at least one contact method (Phone Number or Email) have been collected, extract the details and return a JSON object.
The JSON object must have EXACTLY the following keys:
- customer_name (string, the full name or first name)
- phone (string or null, if collected)
- email (string or null, if collected)
- intent (string, a brief summary of what they want, e.g. "Booking dental cleaning", "Price inquiry")
- urgency (integer between 1 and 10, estimating the urgency of their request where 1 is lowest and 10 is highest)
- sentiment (string, one of: "positive", "neutral", "negative")
- summary (string, a 1-2 sentence summary of the call details so far)
- status (string, always "new")

If either the customer name or both contact methods (phone and email) are missing, return exactly the word "null" (without quotes) and nothing else.

IMPORTANT: Do not return any markdown code fences, do not return any conversational prefix or suffix. Return ONLY the valid JSON or the word "null".`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://voicecloser.ai",
        "X-Title": "VoiceCloser AI",
      },
      body: JSON.stringify({
        models: ["google/gemini-2.5-flash", "openai/gpt-4o-mini"],
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `Conversation history:\n${conversationString}` }
        ],
        temperature: 0.1,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API failed with status ${response.status}`);
    }

    const data = await response.json();
    const resultText = (data.choices?.[0]?.message?.content || "").trim();

    if (resultText === "null" || resultText.toLowerCase() === "null") {
      return { success: false, reason: "Lead info incomplete" };
    }

    let cleanedText = resultText;
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const leadInfo = JSON.parse(cleanedText);
    if (!leadInfo.customer_name) {
      return { success: false, reason: "Name missing in extracted data" };
    }

    const supabase = await createClient();
    
    // Check if lead with this contact info has been created in last 10 minutes to avoid duplication
    if (leadInfo.phone) {
      const { data: existingLeads } = await supabase
        .from("leads")
        .select("id")
        .eq("business_id", businessId)
        .eq("phone", leadInfo.phone)
        .gt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

      if (existingLeads && existingLeads.length > 0) {
        return { success: true, leadId: existingLeads[0].id, alreadyExists: true };
      }
    }

    const { data: insertedLead, error: insertError } = await supabase
      .from("leads")
      .insert({
        business_id: businessId,
        customer_name: leadInfo.customer_name,
        phone: leadInfo.phone,
        email: leadInfo.email,
        intent: leadInfo.intent,
        urgency: leadInfo.urgency || 5,
        summary: leadInfo.summary,
        sentiment: leadInfo.sentiment || "neutral",
        status: leadInfo.status || "new",
      })
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    // Increment agent leads count manually
    const { data: agent } = await supabase
      .from("voice_agents")
      .select("total_leads")
      .eq("id", agentId)
      .single();
    
    if (agent) {
      await supabase
        .from("voice_agents")
        .update({ total_leads: (agent.total_leads || 0) + 1 })
        .eq("id", agentId);
    }

    return { success: true, leadId: insertedLead.id, leadData: leadInfo };
  } catch (error: any) {
    console.error("Failed to extract or save lead:", error);
    return { success: false, error: error.message || "Failed to process lead" };
  }
}

export async function incrementAgentCalls(agentId: string) {
  try {
    const supabase = await createClient();
    const { data: agent } = await supabase
      .from("voice_agents")
      .select("total_calls")
      .eq("id", agentId)
      .single();

    if (agent) {
      await supabase
        .from("voice_agents")
        .update({ total_calls: (agent.total_calls || 0) + 1 })
        .eq("id", agentId);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to increment agent calls:", error);
    return { success: false };
  }
}





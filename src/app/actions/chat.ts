"use server";

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


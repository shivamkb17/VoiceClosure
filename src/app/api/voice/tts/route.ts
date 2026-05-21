import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { text, voiceId } = await req.json();

    // Map the sandbox voices to ElevenLabs Voice IDs
    const voiceMapping: Record<string, string> = {
      alloy: "EXAVITQu4vr4xnSDxMaL",    // Bella (neutral, balanced)
      echo: "ErXwobaYiN019atkyihj",     // Antoni (warm, deep)
      fable: "z9fAnlkpzviPz146aGWa",    // Glinda (expressive, bright)
      onyx: "pNInz6obpgHs51QD9E6t",     // Adam (authoritative, rich)
      nova: "21m00Tcm4TlvDq8ikWAM",     // Rachel (friendly, energetic)
      shimmer: "AZnzlk1XhkjNs8Zc8Hz2",  // Domi (soft, professional)
      aditi: "piTKgcLEGmPEeBI4tU4h",    // Nicole (warm)
      karan: "TxGEqn7nUaMrCDzkJJGC",    // Josh (calm, male)
      priya: "MF3mGyEYCl7XYWbV9VbO",    // Elli (friendly)
    };

    const elevenLabsVoiceId = voiceMapping[voiceId] || "EXAVITQu4vr4xnSDxMaL"; // Default to Bella

    // Call ElevenLabs Text-to-Speech API using eleven_flash_v2_5 model for speed & quality
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_flash_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs TTS request failed:", errText);
      return NextResponse.json(
        { error: `ElevenLabs TTS failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: any) {
    console.error("Error in TTS route:", error);
    return NextResponse.json({ error: error.message || "Failed to convert text to speech" }, { status: 500 });
  }
}

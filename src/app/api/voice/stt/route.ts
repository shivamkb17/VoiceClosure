import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No audio file provided in request" }, { status: 400 });
    }

    // Prepare form data for ElevenLabs Speech-to-Text API
    const elevenlabsFormData = new FormData();
    elevenlabsFormData.append("file", file);
    elevenlabsFormData.append("model_id", "scribe_v2");

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: elevenlabsFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs STT request failed:", errText);
      return NextResponse.json(
        { error: `ElevenLabs STT failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transcriptText = data.text || "";

    return NextResponse.json({ text: transcriptText });
  } catch (error: any) {
    console.error("Error in STT route:", error);
    return NextResponse.json({ error: error.message || "Failed to transcribe audio" }, { status: 500 });
  }
}

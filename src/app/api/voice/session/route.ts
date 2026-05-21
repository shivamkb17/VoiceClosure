/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  if (!apiKey) {
    console.warn("ELEVENLABS_API_KEY is not configured.");
    return NextResponse.json({ error: "API Key missing" }, { status: 500 });
  }

  if (!agentId) {
    console.warn("NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not configured.");
    return NextResponse.json({ error: "Agent ID missing" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`, {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("ElevenLabs signed URL request failed:", errText);
      return NextResponse.json(
        { error: `Failed to fetch session URL: ${res.status}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ url: data.authenticated_url });
  } catch (error: any) {
    console.error("Error generating ElevenLabs session URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create session token" },
      { status: 500 }
    );
  }
}

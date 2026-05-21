/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";

// Helper to chunk text based on paragraph/sentence boundaries
function chunkText(text: string, chunkSize = 800): string[] {
  const paragraphs = text.split("\n\n");
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + "\n\n" + para).length <= chunkSize) {
      currentChunk = currentChunk ? currentChunk + "\n\n" + para : para;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = para;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  // Split any single large chunks by lines if they exceed the size
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length > chunkSize) {
      const lines = chunk.split("\n");
      let subChunk = "";
      for (const line of lines) {
        if ((subChunk + "\n" + line).length <= chunkSize) {
          subChunk = subChunk ? subChunk + "\n" + line : line;
        } else {
          if (subChunk) finalChunks.push(subChunk);
          subChunk = line;
        }
      }
      if (subChunk) finalChunks.push(subChunk);
    } else {
      finalChunks.push(chunk);
    }
  }
  return finalChunks.filter((c) => c.trim().length > 10);
}

// Fetch embeddings using OpenRouter's text-embedding-3-small API
async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: text.replace(/\n/g, " "),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter Embedding error details:", errorText);
    throw new Error(`Embedding API failed: ${response.status}`);
  }

  const data = await response.json();
  const embedding = data.data?.[0]?.embedding;
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error("Invalid embedding response structure");
  }

  return embedding;
}

/**
 * Uploads, chunks, embeds, and saves document content to agent's knowledge base.
 */
export async function uploadAgentKnowledge(agentId: string, text: string) {
  const supabase = await createClient();
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    return { success: false, error: "Text is too short or empty." };
  }

  try {
    const inserts = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await getEmbedding(chunk);
        return {
          agent_id: agentId,
          content: chunk,
          embedding,
        };
      })
    );

    const { error } = await supabase.from("agent_documents").insert(inserts);

    if (error) {
      throw error;
    }

    return { success: true, count: chunks.length };
  } catch (error: any) {
    console.error("Failed to upload knowledge base:", error);
    return { success: false, error: error.message || "Failed to process knowledge base" };
  }
}

/**
 * Perform vector similarity search for an agent's RAG context.
 */
export async function searchAgentKnowledge(agentId: string, query: string, limit = 3) {
  const supabase = await createClient();

  try {
    const queryEmbedding = await getEmbedding(query);

    // Call Supabase RPC match function
    const { data, error } = await supabase.rpc("match_agent_documents", {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit,
      filter_agent_id: agentId,
    });

    if (error) throw error;
    return { success: true, documents: data || [] };
  } catch (error: any) {
    console.error("Failed to query knowledge base:", error);
    return { success: false, error: error.message || "Search failed" };
  }
}

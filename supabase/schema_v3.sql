-- ============================================================
-- VoiceCloser AI — Schema V3: Vector RAG Knowledge Base
-- Run this AFTER schema_v2.sql in Supabase SQL Editor
-- ============================================================

-- Enable vector extension
create extension if not exists vector;

-- ============================================================
-- Agent Documents (Knowledge Base chunks)
-- ============================================================
create table if not exists public.agent_documents (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.voice_agents(id) on delete cascade not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536), -- standard dimension for OpenAI / Gemini text-embeddings
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.agent_documents enable row level security;

-- RLS Policies tied to the voice agent owner's ID
create policy "Users can view own agent documents"
  on public.agent_documents for select
  using (
    exists (
      select 1 from public.voice_agents
      where voice_agents.id = agent_documents.agent_id
        and voice_agents.user_id = auth.uid()
    )
  );

create policy "Users can insert own agent documents"
  on public.agent_documents for insert
  with check (
    exists (
      select 1 from public.voice_agents
      where voice_agents.id = agent_documents.agent_id
        and voice_agents.user_id = auth.uid()
    )
  );

create policy "Users can update own agent documents"
  on public.agent_documents for update
  using (
    exists (
      select 1 from public.voice_agents
      where voice_agents.id = agent_documents.agent_id
        and voice_agents.user_id = auth.uid()
    )
  );

create policy "Users can delete own agent documents"
  on public.agent_documents for delete
  using (
    exists (
      select 1 from public.voice_agents
      where voice_agents.id = agent_documents.agent_id
        and voice_agents.user_id = auth.uid()
    )
  );

-- HNSW Index for rapid search
create index if not exists idx_agent_documents_embedding 
on public.agent_documents using hnsw (embedding vector_cosine_ops);

create index if not exists idx_agent_documents_agent_id 
on public.agent_documents(agent_id);

-- ============================================================
-- Similarity Search Function (Vector Similarity Search RPC)
-- ============================================================
create or replace function public.match_agent_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_agent_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    agent_documents.id,
    agent_documents.content,
    1 - (agent_documents.embedding <=> query_embedding) as similarity
  from public.agent_documents
  where agent_documents.agent_id = filter_agent_id
    and 1 - (agent_documents.embedding <=> query_embedding) > match_threshold
  order by agent_documents.embedding <=> query_embedding
  limit match_count;
$$;

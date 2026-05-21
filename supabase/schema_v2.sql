-- ============================================================
-- VoiceCloser AI — Schema V2: Voice Agents + Admin Support
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Add admin flag to profiles
alter table public.profiles add column if not exists is_admin boolean default false;

-- ============================================================
-- Voice Agents table
-- ============================================================
create table if not exists public.voice_agents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  business_type text,
  greeting text not null,
  system_prompt text not null,
  voice_id text default 'alloy',
  language text default 'en',
  personality text default 'professional',
  is_active boolean default true,
  total_calls integer default 0,
  total_leads integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.voice_agents enable row level security;

create policy "Users can view own agents"
  on public.voice_agents for select
  using (auth.uid() = user_id);

create policy "Users can insert own agents"
  on public.voice_agents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own agents"
  on public.voice_agents for update
  using (auth.uid() = user_id);

create policy "Users can delete own agents"
  on public.voice_agents for delete
  using (auth.uid() = user_id);

create trigger voice_agents_updated_at
  before update on public.voice_agents
  for each row execute procedure public.update_updated_at();

create index if not exists idx_voice_agents_user_id on public.voice_agents(user_id);
create index if not exists idx_voice_agents_active on public.voice_agents(is_active);

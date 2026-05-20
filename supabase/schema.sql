-- ============================================================
-- VoiceCloser AI — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- ============================================================
-- Profiles table (linked to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  business_name text,
  business_type text,
  phone text,
  stripe_customer_id text unique,
  subscription_status text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can insert their own profile (for signup)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Service role can manage all profiles (for webhooks)
-- Note: service_role key bypasses RLS by default

-- ============================================================
-- Leads table
-- ============================================================
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.profiles(id) on delete cascade,
  customer_name text,
  phone text,
  email text,
  intent text,
  urgency integer check (urgency >= 1 and urgency <= 10),
  summary text,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.leads enable row level security;

create policy "Users can view own leads"
  on public.leads for select
  using (auth.uid() = business_id);

create policy "Users can insert own leads"
  on public.leads for insert
  with check (auth.uid() = business_id);

create policy "Users can update own leads"
  on public.leads for update
  using (auth.uid() = business_id);

-- ============================================================
-- Appointments table
-- ============================================================
create table if not exists public.appointments (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.profiles(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  appointment_date timestamptz not null,
  service_type text,
  notes text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'failed')),
  deposit_amount integer default 0, -- in paisa (₹)
  stripe_payment_id text,
  status text default 'scheduled' check (status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.appointments enable row level security;

create policy "Users can view own appointments"
  on public.appointments for select
  using (auth.uid() = business_id);

create policy "Users can insert own appointments"
  on public.appointments for insert
  with check (auth.uid() = business_id);

create policy "Users can update own appointments"
  on public.appointments for update
  using (auth.uid() = business_id);

-- ============================================================
-- Conversations table
-- ============================================================
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.profiles(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  transcript jsonb default '[]'::jsonb,
  ai_summary text,
  duration integer default 0, -- in seconds
  scenario text,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;

create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = business_id);

create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = business_id);

-- ============================================================
-- Auto-create profile on user signup (trigger)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Auto-update updated_at timestamp
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger leads_updated_at
  before update on public.leads
  for each row execute procedure public.update_updated_at();

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- Indexes for performance
-- ============================================================
create index if not exists idx_leads_business_id on public.leads(business_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_appointments_business_id on public.appointments(business_id);
create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_conversations_business_id on public.conversations(business_id);
create index if not exists idx_profiles_stripe_customer_id on public.profiles(stripe_customer_id);

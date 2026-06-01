create extension if not exists vector;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  url text not null,
  youtube_channel_id text,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.youtube_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  source_type text not null check (source_type in ('channel', 'video', 'playlist', 'mixed')),
  urls text[] not null,
  max_videos integer,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.channels(id) on delete cascade,
  source_id uuid references public.youtube_sources(id) on delete set null,
  title text not null,
  youtube_url text not null,
  youtube_video_id text unique,
  published_at timestamptz,
  transcript text,
  summary text,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.video_chunks (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references public.videos(id) on delete cascade,
  chunk_text text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.channels(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  name text not null,
  description text,
  market_type text,
  difficulty text,
  indicators text[],
  entry_rules text[],
  exit_rules text[],
  stop_loss_rules text[],
  risk_management text[],
  example text,
  mistakes text[],
  checklist text[],
  created_at timestamptz not null default now()
);

create table if not exists public.glossary_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  definition text not null,
  source_video_id uuid references public.videos(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid references public.strategies(id) on delete set null,
  title text not null,
  scenario text not null,
  choices jsonb not null,
  correct_answer text not null,
  explanation text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  video_id uuid references public.videos(id) on delete set null,
  strategy_id uuid references public.strategies(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

-- Hammertime: Cloud roster storage
-- Run this in the Supabase SQL editor for your project

create table if not exists public.rosters (
  id          text        primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  game_system_id text     not null,
  points      integer     not null default 0,
  points_limit integer    not null default 2000,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- Index for fast per-user lookups
create index if not exists rosters_user_id_idx on public.rosters(user_id);
create index if not exists rosters_updated_at_idx on public.rosters(updated_at desc);

-- Row Level Security: users can only see/edit their own rosters
alter table public.rosters enable row level security;

create policy "Users can read own rosters"
  on public.rosters for select
  using (auth.uid() = user_id);

create policy "Users can insert own rosters"
  on public.rosters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rosters"
  on public.rosters for update
  using (auth.uid() = user_id);

create policy "Users can delete own rosters"
  on public.rosters for delete
  using (auth.uid() = user_id);

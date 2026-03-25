-- ============================================================
-- Open Sermon — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- SERIES
-- ============================================================
create table public.series (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- SERMONS
-- ============================================================
create type sermon_status as enum ('draft', 'in_progress', 'finished', 'preached');
create type sermon_type   as enum ('preaching', 'cell', 'devotional');

create table public.sermons (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  series_id        uuid references public.series(id) on delete set null,
  title            text not null,
  slug             text,
  status           sermon_status default 'draft',
  type             sermon_type   default 'preaching',
  main_scripture   text,
  tags             text[] default '{}',
  blocks           jsonb default '[]',   -- editor block content
  preached_at      date,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================================
-- SAVED BLOCKS (Reusable Block Library)
-- ============================================================
create type block_type as enum (
  'verse', 'illustration', 'application',
  'point', 'intro', 'conclusion', 'text'
);

create table public.saved_blocks (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  type       block_type not null,
  title      text not null,
  content    jsonb not null,
  tags       text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.series       enable row level security;
alter table public.sermons      enable row level security;
alter table public.saved_blocks enable row level security;

-- Series: users can only see/edit their own
create policy "series_select" on public.series for select using (auth.uid() = user_id);
create policy "series_insert" on public.series for insert with check (auth.uid() = user_id);
create policy "series_update" on public.series for update using (auth.uid() = user_id);
create policy "series_delete" on public.series for delete using (auth.uid() = user_id);

-- Sermons: users can only see/edit their own
create policy "sermons_select" on public.sermons for select using (auth.uid() = user_id);
create policy "sermons_insert" on public.sermons for insert with check (auth.uid() = user_id);
create policy "sermons_update" on public.sermons for update using (auth.uid() = user_id);
create policy "sermons_delete" on public.sermons for delete using (auth.uid() = user_id);

-- Saved blocks: users can only see/edit their own
create policy "saved_blocks_select" on public.saved_blocks for select using (auth.uid() = user_id);
create policy "saved_blocks_insert" on public.saved_blocks for insert with check (auth.uid() = user_id);
create policy "saved_blocks_update" on public.saved_blocks for update using (auth.uid() = user_id);
create policy "saved_blocks_delete" on public.saved_blocks for delete using (auth.uid() = user_id);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sermons_updated_at      before update on public.sermons      for each row execute function update_updated_at();
create trigger series_updated_at       before update on public.series       for each row execute function update_updated_at();
create trigger saved_blocks_updated_at before update on public.saved_blocks for each row execute function update_updated_at();

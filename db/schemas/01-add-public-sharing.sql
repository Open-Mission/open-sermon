-- ============================================================
-- Add public sharing support to sermons
-- Migration: 01-add-public-sharing.sql
-- ============================================================

-- Add is_public column to sermons
alter table public.sermons
  add column if not exists is_public boolean default false;

-- Add unique index on slug for public sermons (partial index)
create unique index if not exists sermons_slug_unique_idx
  on public.sermons (slug)
  where slug is not null and is_public = true;

-- Allow public (unauthenticated) reads of public sermons by slug
create policy "sermons_public_select" on public.sermons
  for select
  using (is_public = true);

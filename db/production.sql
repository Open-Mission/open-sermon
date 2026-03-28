-- =====================================================
-- Open Sermon - Production Database Setup
-- Generated: 2026-03-28
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE sermon_status AS ENUM ('draft', 'in_progress', 'finished', 'preached');
CREATE TYPE sermon_type AS ENUM ('preaching', 'cell', 'devotional');
CREATE TYPE block_type AS ENUM ('verse', 'illustration', 'application', 'point', 'intro', 'conclusion', 'text');

-- =====================================================
-- TABLES
-- =====================================================

-- Series table
CREATE TABLE IF NOT EXISTS public.series (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sermons table
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.series(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  status sermon_status DEFAULT 'draft',
  type sermon_type DEFAULT 'preaching',
  main_scripture TEXT,
  tags TEXT[] DEFAULT '{}',
  blocks JSONB DEFAULT '[]',
  preached_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE
);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  church_name TEXT,
  church_role TEXT,
  bio TEXT,
  locale TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved blocks table
CREATE TABLE IF NOT EXISTS public.saved_blocks (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type block_type NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS sermons_user_id_idx ON public.sermons(user_id);
CREATE INDEX IF NOT EXISTS sermons_slug_idx ON public.sermons(slug);
CREATE INDEX IF NOT EXISTS sermons_status_idx ON public.sermons(status);
CREATE INDEX IF NOT EXISTS sermons_deleted_at_idx ON public.sermons(deleted_at);
CREATE INDEX IF NOT EXISTS series_user_id_idx ON public.series(user_id);
CREATE INDEX IF NOT EXISTS saved_blocks_user_id_idx ON public.saved_blocks(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_blocks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - SERMONS
-- =====================================================

CREATE POLICY "sermons_select" ON public.sermons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sermons_public_select" ON public.sermons
  FOR SELECT USING (is_public = TRUE AND deleted_at IS NULL);

CREATE POLICY "sermons_insert" ON public.sermons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sermons_update" ON public.sermons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "sermons_delete" ON public.sermons
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - SERIES
-- =====================================================

CREATE POLICY "series_select" ON public.series
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "series_insert" ON public.series
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "series_update" ON public.series
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "series_delete" ON public.series
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - PROFILES
-- =====================================================

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- RLS POLICIES - SAVED BLOCKS
-- =====================================================

CREATE POLICY "saved_blocks_select" ON public.saved_blocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_blocks_insert" ON public.saved_blocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_blocks_update" ON public.saved_blocks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "saved_blocks_delete" ON public.saved_blocks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, first_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for updated_at on sermons
DROP TRIGGER IF EXISTS sermons_updated_at ON public.sermons;
CREATE TRIGGER sermons_updated_at
  BEFORE UPDATE ON public.sermons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger for updated_at on series
DROP TRIGGER IF EXISTS series_updated_at ON public.series;
CREATE TRIGGER series_updated_at
  BEFORE UPDATE ON public.series
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger for updated_at on profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger for updated_at on saved_blocks
DROP TRIGGER IF EXISTS saved_blocks_updated_at ON public.saved_blocks;
CREATE TRIGGER saved_blocks_updated_at
  BEFORE UPDATE ON public.saved_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- Add description field and update sermon types
-- Execute this in Supabase SQL Editor
-- =====================================================

-- 1. Add description column to sermons table
ALTER TABLE public.sermons 
ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

-- 2. Update sermon_type enum to include new types
-- First, remove default value to avoid cast issues
ALTER TABLE public.sermons ALTER COLUMN type DROP DEFAULT;

-- Rename the existing type
ALTER TYPE sermon_type RENAME TO sermon_type_old;

-- Create new enum with additional types
CREATE TYPE sermon_type AS ENUM (
  'preaching',
  'ebd_class',
  'devotional',
  'video_script',
  'cell'
);

-- Add column with new type using explicit cast
ALTER TABLE public.sermons 
ALTER COLUMN type TYPE sermon_type USING (
  CASE 
    WHEN type::text = 'cell' THEN 'cell'::sermon_type
    WHEN type::text = 'preaching' THEN 'preaching'::sermon_type
    WHEN type::text = 'devotional' THEN 'devotional'::sermon_type
    ELSE 'preaching'::sermon_type
  END
);

-- Drop old enum
DROP TYPE sermon_type_old;

-- Restore default
ALTER TABLE public.sermons ALTER COLUMN type SET DEFAULT 'preaching'::sermon_type;

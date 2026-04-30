-- AI Content Creator Schema
-- Created: 2026-01-04
-- Author: Marosdee Uma
-- Description: Database schema for AI Content Creator application
-- NOTE: Content types are now managed via DB table for dynamic updates

-- ============================================================================
-- CONTENT TYPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_content_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_th TEXT NOT NULL,
  description TEXT,
  description_th TEXT,
  icon TEXT,
  color TEXT,
  prompt_template TEXT,
  suggested_time_slots TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Updated at trigger for ai_content_types
CREATE TRIGGER update_ai_content_types_updated_at
  BEFORE UPDATE ON public.ai_content_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Content Types indices
CREATE INDEX IF NOT EXISTS idx_ai_content_types_is_active ON public.ai_content_types(is_active);

-- Content Types RLS
ALTER TABLE public.ai_content_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_content_types_select_all" ON public.ai_content_types
  FOR SELECT USING (true);

CREATE POLICY "ai_content_types_admin_all" ON public.ai_content_types
  FOR ALL USING (
    public.get_active_profile_role() = 'admin'::public.profile_role
  );

-- ============================================================================
-- CONTENTS TABLE (Main Table)
-- ============================================================================
-- NOTE: content_type_id refers to ai_content_types table
CREATE TABLE IF NOT EXISTS public.ai_contents (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type_id TEXT NOT NULL REFERENCES public.ai_content_types(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prompt TEXT,
  time_slot TEXT CHECK (time_slot IN ('morning', 'lunch', 'afternoon', 'evening')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  -- New fields for unified Content entity
  comments INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  emoji TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_contents_profile_id ON public.ai_contents(profile_id);
CREATE INDEX IF NOT EXISTS idx_ai_contents_status ON public.ai_contents(status);
CREATE INDEX IF NOT EXISTS idx_ai_contents_time_slot ON public.ai_contents(time_slot);
CREATE INDEX IF NOT EXISTS idx_ai_contents_created_at ON public.ai_contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_contents_scheduled_at ON public.ai_contents(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_ai_contents_content_type_id ON public.ai_contents(content_type_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated at trigger for ai_contents
CREATE TRIGGER update_ai_contents_updated_at
  BEFORE UPDATE ON public.ai_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.ai_contents ENABLE ROW LEVEL SECURITY;

-- Contents: Users can read their own or published
CREATE POLICY "ai_contents_select_own_or_published" ON public.ai_contents
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    OR status = 'published'
  );

-- Contents: Users can insert their own
CREATE POLICY "ai_contents_insert_own" ON public.ai_contents
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );

-- Contents: Users can update their own
CREATE POLICY "ai_contents_update_own" ON public.ai_contents
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );

-- Contents: Users can delete their own
CREATE POLICY "ai_contents_delete_own" ON public.ai_contents
  FOR DELETE USING (
    profile_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );

-- Contents: Admins can do everything
CREATE POLICY "ai_contents_admin_all" ON public.ai_contents
  FOR ALL USING (
    public.get_active_profile_role() = 'admin'::public.profile_role
  );

-- Contents: Public can view all (for anonymous API access)
CREATE POLICY "ai_contents_public_read" ON public.ai_contents
  FOR SELECT USING (true);

-- ============================================================================
-- CREATE AI CONTENTS STORAGE BUCKET
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('ai-contents', 'ai-contents', true, false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ai-contents bucket
CREATE POLICY "AI content images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ai-contents');

CREATE POLICY "Users can upload AI content images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ai-contents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their AI content images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'ai-contents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their AI content images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ai-contents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

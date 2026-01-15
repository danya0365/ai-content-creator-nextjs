-- Weekly Reports Schema
-- Created: 2026-01-15
-- Author: Marosdee Uma
-- Description: Database schema for storing weekly analytics reports

-- ============================================================================
-- WEEKLY REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Summary
  total_generated INTEGER DEFAULT 0,
  total_published INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_drafts INTEGER DEFAULT 0,
  
  -- Engagement
  total_likes INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  avg_likes_per_content DECIMAL(10,2) DEFAULT 0,
  avg_shares_per_content DECIMAL(10,2) DEFAULT 0,
  
  -- Top performing content (stored as JSONB array)
  top_performing_content JSONB DEFAULT '[]'::jsonb,
  
  -- Content breakdown by time slot
  content_morning INTEGER DEFAULT 0,
  content_lunch INTEGER DEFAULT 0,
  content_afternoon INTEGER DEFAULT 0,
  content_evening INTEGER DEFAULT 0,
  
  -- Content breakdown by type (stored as JSONB object)
  content_by_type JSONB DEFAULT '{}'::jsonb,
  
  -- Full report data (for flexibility)
  full_report JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_weekly_reports_period ON public.ai_weekly_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ai_weekly_reports_created_at ON public.ai_weekly_reports(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated at trigger for ai_weekly_reports
CREATE TRIGGER update_ai_weekly_reports_updated_at
  BEFORE UPDATE ON public.ai_weekly_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.ai_weekly_reports ENABLE ROW LEVEL SECURITY;

-- Weekly Reports: Public can view all (for dashboard display)
CREATE POLICY "ai_weekly_reports_public_read" ON public.ai_weekly_reports
  FOR SELECT USING (true);

-- Weekly Reports: Only service role can insert (via API)
CREATE POLICY "ai_weekly_reports_service_insert" ON public.ai_weekly_reports
  FOR INSERT WITH CHECK (true);

-- Weekly Reports: Only service role can update (via API)
CREATE POLICY "ai_weekly_reports_service_update" ON public.ai_weekly_reports
  FOR UPDATE USING (true);

-- Weekly Reports: Admins can do everything
CREATE POLICY "ai_weekly_reports_admin_all" ON public.ai_weekly_reports
  FOR ALL USING (
    public.get_active_profile_role() = 'admin'::public.profile_role
  );

-- ============================================================================
-- UNIQUE CONSTRAINT (prevent duplicate reports for same period)
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_weekly_reports_period_unique 
  ON public.ai_weekly_reports(period_start, period_end);

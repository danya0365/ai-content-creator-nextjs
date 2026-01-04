-- Create daily_ratings table for tracking daily popularity
CREATE TABLE IF NOT EXISTS public.daily_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    view_count BIGINT DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(series_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_ratings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Daily ratings are viewable by everyone" ON public.daily_ratings
    FOR SELECT USING (true);

-- Create indexes
CREATE INDEX idx_daily_ratings_date ON public.daily_ratings(date DESC);
CREATE INDEX idx_daily_ratings_series ON public.daily_ratings(series_id);
CREATE INDEX idx_daily_ratings_view_count ON public.daily_ratings(date, view_count DESC);

-- Function to increment daily view count
CREATE OR REPLACE FUNCTION increment_daily_view(p_series_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.daily_ratings (series_id, date, view_count, unique_viewers)
    VALUES (p_series_id, CURRENT_DATE, 1, 1)
    ON CONFLICT (series_id, date)
    DO UPDATE SET view_count = public.daily_ratings.view_count + 1;
    
    -- Also update series total view count
    UPDATE public.series SET view_count = view_count + 1 WHERE id = p_series_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for getting today's trending series
CREATE OR REPLACE VIEW public.trending_today AS
SELECT 
    s.*,
    c.name as category_name,
    c.slug as category_slug,
    COALESCE(dr.view_count, 0) as today_views
FROM public.series s
LEFT JOIN public.categories c ON s.category_id = c.id
LEFT JOIN public.daily_ratings dr ON s.id = dr.series_id AND dr.date = CURRENT_DATE
ORDER BY COALESCE(dr.view_count, 0) DESC, s.rating DESC
LIMIT 20;

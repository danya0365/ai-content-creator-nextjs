-- Create series table
CREATE TABLE IF NOT EXISTS public.series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_en TEXT,
    title_cn TEXT,
    description TEXT,
    description_en TEXT,
    description_cn TEXT,
    thumbnail TEXT,
    poster TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    total_episodes INTEGER DEFAULT 0,
    release_date DATE,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('ongoing', 'completed', 'upcoming')),
    view_count BIGINT DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_series_category ON public.series(category_id);
CREATE INDEX idx_series_status ON public.series(status);
CREATE INDEX idx_series_is_featured ON public.series(is_featured);
CREATE INDEX idx_series_rating ON public.series(rating DESC);
CREATE INDEX idx_series_view_count ON public.series(view_count DESC);
CREATE INDEX idx_series_release_date ON public.series(release_date DESC);

-- Enable RLS
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Series are viewable by everyone" ON public.series
    FOR SELECT USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_series_updated_at
    BEFORE UPDATE ON public.series
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create episodes table
CREATE TABLE IF NOT EXISTS public.episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    title_en TEXT,
    title_cn TEXT,
    description TEXT,
    video_url TEXT,
    duration INTEGER DEFAULT 0, -- in seconds
    thumbnail TEXT,
    is_free BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(series_id, episode_number)
);

-- Create indexes
CREATE INDEX idx_episodes_series ON public.episodes(series_id);
CREATE INDEX idx_episodes_number ON public.episodes(series_id, episode_number);
CREATE INDEX idx_episodes_is_free ON public.episodes(is_free);

-- Enable RLS
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Episodes are viewable by everyone" ON public.episodes
    FOR SELECT USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_episodes_updated_at
    BEFORE UPDATE ON public.episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update series total_episodes count
CREATE OR REPLACE FUNCTION update_series_episode_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.series SET total_episodes = total_episodes + 1 WHERE id = NEW.series_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.series SET total_episodes = total_episodes - 1 WHERE id = OLD.series_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_episode_count
    AFTER INSERT OR DELETE ON public.episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_series_episode_count();

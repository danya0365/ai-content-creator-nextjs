-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    name_cn TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, name_en, name_cn, slug, icon) VALUES
    ('โรแมนติก', 'Romance', '浪漫', 'romance', '💕'),
    ('แอ็คชั่น', 'Action', '动作', 'action', '💥'),
    ('ตลก', 'Comedy', '喜剧', 'comedy', '😂'),
    ('ดราม่า', 'Drama', '戏剧', 'drama', '🎭'),
    ('แฟนตาซี', 'Fantasy', '奇幻', 'fantasy', '✨'),
    ('สยองขวัญ', 'Horror', '恐怖', 'horror', '👻'),
    ('ไมโครดราม่า', 'Micro Drama', '微短剧', 'micro-drama', '📱'),
    ('ซีรีย์แนวตั้ง', 'Vertical Series', '竖屏剧', 'vertical', '📲')
ON CONFLICT (slug) DO NOTHING;

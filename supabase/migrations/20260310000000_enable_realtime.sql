-- Enable realtime for ai_contents table
-- Created: 2026-03-10
-- Author: AI

-- First, check if the publication exists, if not create it (Supabase typically creates this by default)
-- But we can just use ALTER PUBLICATION directly as it should exist in a standard Supabase project

-- Add ai_contents to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE ai_contents;

-- Enable it for ai_weekly_reports as well
ALTER PUBLICATION supabase_realtime ADD TABLE ai_weekly_reports;

-- Optionally, it's also a good idea to enable it for ai_content_types if those change
ALTER PUBLICATION supabase_realtime ADD TABLE ai_content_types;

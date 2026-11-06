-- Run once in Supabase SQL Editor before saving thumbnail settings.
-- Adds independent, non-destructive JSON configuration to each card.
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS thumbnail_settings jsonb NOT NULL DEFAULT '{"zoom":100,"x":50,"y":50}'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_settings jsonb NOT NULL DEFAULT '{"zoom":100,"x":50,"y":50}'::jsonb;

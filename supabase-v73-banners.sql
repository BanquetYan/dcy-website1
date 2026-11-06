ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_banners jsonb NOT NULL DEFAULT '[]'::jsonb;

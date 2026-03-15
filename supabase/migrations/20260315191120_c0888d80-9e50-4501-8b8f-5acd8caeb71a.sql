
ALTER TABLE public.athlete_profiles 
  ADD COLUMN IF NOT EXISTS quarterly_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS annual_enabled boolean NOT NULL DEFAULT true;


-- 1) athlete_google_tokens table
CREATE TABLE public.athlete_google_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(athlete_id)
);

ALTER TABLE public.athlete_google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can read own tokens"
ON public.athlete_google_tokens FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.athlete_profiles
    WHERE athlete_profiles.id = athlete_google_tokens.athlete_id
    AND athlete_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Athletes can insert own tokens"
ON public.athlete_google_tokens FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.athlete_profiles
    WHERE athlete_profiles.id = athlete_google_tokens.athlete_id
    AND athlete_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Athletes can update own tokens"
ON public.athlete_google_tokens FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.athlete_profiles
    WHERE athlete_profiles.id = athlete_google_tokens.athlete_id
    AND athlete_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Athletes can delete own tokens"
ON public.athlete_google_tokens FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.athlete_profiles
    WHERE athlete_profiles.id = athlete_google_tokens.athlete_id
    AND athlete_profiles.user_id = auth.uid()
  )
);

-- 2) Add live streaming columns to content table
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS meet_url text;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS is_live_now boolean NOT NULL DEFAULT false;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS live_status text DEFAULT 'scheduled';

-- 3) Enable realtime for content (for live status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.content;

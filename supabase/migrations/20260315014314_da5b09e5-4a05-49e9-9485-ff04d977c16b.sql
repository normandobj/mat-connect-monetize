-- Allow athletes to read subscriptions to their profile (for subscriber count)
CREATE POLICY "Athletes can read subscriptions to their profile"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.athlete_profiles
    WHERE athlete_profiles.id = subscriptions.athlete_id
    AND athlete_profiles.user_id = auth.uid()
  )
);
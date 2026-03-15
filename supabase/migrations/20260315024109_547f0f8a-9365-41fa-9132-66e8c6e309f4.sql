
-- Add RLS policies for content UPDATE and DELETE by athlete owners
CREATE POLICY "Athletes can update own content"
ON public.content
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM athlete_profiles
  WHERE athlete_profiles.id = content.athlete_id
  AND athlete_profiles.user_id = auth.uid()
));

CREATE POLICY "Athletes can delete own content"
ON public.content
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM athlete_profiles
  WHERE athlete_profiles.id = content.athlete_id
  AND athlete_profiles.user_id = auth.uid()
));

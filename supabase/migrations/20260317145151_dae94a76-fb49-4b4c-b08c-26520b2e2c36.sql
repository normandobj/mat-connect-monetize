-- Admin can read all content
CREATE POLICY "Admins can read all content"
ON public.content
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete any content
CREATE POLICY "Admins can delete any content"
ON public.content
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete athlete profiles
CREATE POLICY "Admins can delete athlete profiles"
ON public.athlete_profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can read all subscriptions
CREATE POLICY "Admins can read all subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

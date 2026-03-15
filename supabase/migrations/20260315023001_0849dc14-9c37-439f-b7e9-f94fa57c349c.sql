
-- Allow reading profiles publicly (for commenter names, message names, etc.)
CREATE POLICY "Anyone can read profiles basic info" ON public.profiles
  FOR SELECT TO public USING (true);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

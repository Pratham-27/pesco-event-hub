-- Drop existing SELECT policy and recreate as permissive
DROP POLICY IF EXISTS "Anyone can view discussions" ON public.community_discussions;

-- Create a permissive policy that explicitly allows authenticated users
CREATE POLICY "Anyone can view discussions"
ON public.community_discussions
FOR SELECT
TO authenticated
USING (true);
-- Create discussion_likes table for tracking individual likes
CREATE TABLE IF NOT EXISTS public.discussion_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid NOT NULL REFERENCES public.community_discussions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(discussion_id, user_id)
);

-- Enable RLS on discussion_likes
ALTER TABLE public.discussion_likes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all likes
CREATE POLICY "Anyone can view likes"
ON public.discussion_likes
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert their own likes
CREATE POLICY "Users can like posts"
ON public.discussion_likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own likes
CREATE POLICY "Users can unlike posts"
ON public.discussion_likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_discussion_likes_discussion_id ON public.discussion_likes(discussion_id);
CREATE INDEX idx_discussion_likes_user_id ON public.discussion_likes(user_id);

-- Add foreign key for discussion_replies if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'discussion_replies_author_id_fkey'
  ) THEN
    ALTER TABLE public.discussion_replies
    ADD CONSTRAINT discussion_replies_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable realtime for likes and replies
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_replies;
-- Add foreign key constraint for announcements.created_by to profiles table
ALTER TABLE public.announcements
ADD CONSTRAINT announcements_created_by_fkey
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
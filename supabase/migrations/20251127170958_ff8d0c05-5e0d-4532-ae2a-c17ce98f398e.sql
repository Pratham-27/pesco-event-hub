-- Add status field to community_discussions for admin moderation
ALTER TABLE public.community_discussions
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'under_review', 'rejected'));

-- Add attendance field to event_registrations
ALTER TABLE public.event_registrations
ADD COLUMN attended boolean DEFAULT false;

-- Add index for better performance
CREATE INDEX idx_community_discussions_status ON public.community_discussions(status);
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);
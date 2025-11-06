-- Create function to increment event attendees
CREATE OR REPLACE FUNCTION public.increment_event_attendees(event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.events
  SET current_attendees = current_attendees + 1
  WHERE id = event_id;
END;
$$;

-- Create function to decrement event attendees
CREATE OR REPLACE FUNCTION public.decrement_event_attendees(event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.events
  SET current_attendees = GREATEST(current_attendees - 1, 0)
  WHERE id = event_id;
END;
$$;
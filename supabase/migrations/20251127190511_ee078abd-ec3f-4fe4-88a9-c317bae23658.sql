-- Add registration_open column to events table
ALTER TABLE public.events 
ADD COLUMN registration_open boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.events.registration_open IS 'Controls whether students can register for this event';
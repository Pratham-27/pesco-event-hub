-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  is_important BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for announcements
CREATE POLICY "Anyone can view announcements" 
ON public.announcements 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create announcements" 
ON public.announcements 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update announcements" 
ON public.announcements 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete announcements" 
ON public.announcements 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX idx_announcements_is_important ON public.announcements(is_important) WHERE is_important = true;
-- Add semester and course fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS semester text,
ADD COLUMN IF NOT EXISTS course text;

-- Add a comment for documentation
COMMENT ON COLUMN public.profiles.semester IS 'Semester of study (I-VIII in Roman numerals)';
COMMENT ON COLUMN public.profiles.course IS 'Course/Branch (Computer Engineering, AIDS, Mechanical, Civil, ENTC)';
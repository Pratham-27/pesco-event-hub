-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle OAuth users properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert into profiles table with better OAuth support
  -- Google OAuth provides: full_name, avatar_url, email
  INSERT INTO public.profiles (id, name, email, mobile, year)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',           -- Regular signup
      NEW.raw_user_meta_data->>'full_name',      -- Google OAuth
      split_part(NEW.email, '@', 1)              -- Fallback to email username
    ),
    NEW.email,
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'mobile', ''), ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'year', ''), '')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(profiles.name, ''), EXCLUDED.name);
  
  -- Assign role based on metadata
  IF (NEW.raw_user_meta_data->>'is_admin')::boolean IS TRUE THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
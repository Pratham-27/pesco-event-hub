-- Restore the better version of handle_new_user with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert into profiles table with better OAuth support
  INSERT INTO public.profiles (id, name, email, mobile, year)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
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
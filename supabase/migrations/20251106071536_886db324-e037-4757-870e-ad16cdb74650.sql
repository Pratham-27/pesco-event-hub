-- Update the trigger function to handle admin signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, name, email, mobile, year)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    COALESCE(NEW.raw_user_meta_data->>'year', 'FY')
  );
  
  -- Assign role based on metadata
  IF (NEW.raw_user_meta_data->>'is_admin')::boolean IS TRUE THEN
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    -- Assign default student role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
  END IF;
  
  RETURN NEW;
END;
$$;
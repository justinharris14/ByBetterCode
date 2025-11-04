-- ========================================
-- FIX YOUR USER ACCOUNT
-- ========================================
-- This creates a profile for YOUR auth account
-- Replace 'your-email@example.com' with YOUR actual email

-- STEP 1: Get your auth user ID
DO $$
DECLARE
  auth_id UUID;
  user_email TEXT := 'your-email@example.com';  -- ⬅️ REPLACE WITH YOUR EMAIL
  user_first_name TEXT := 'Your';                -- ⬅️ REPLACE WITH YOUR FIRST NAME
  user_last_name TEXT := 'Name';                 -- ⬅️ REPLACE WITH YOUR LAST NAME
  user_role TEXT := 'parent';                    -- ⬅️ CHANGE TO 'admin' IF YOU'RE ADMIN
  profile_exists BOOLEAN;
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_id FROM auth.users WHERE email = user_email;
  
  IF auth_id IS NULL THEN
    RAISE EXCEPTION 'User % does not exist in auth.users. Cannot create profile.', user_email;
  END IF;
  
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.users WHERE user_id = auth_id) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE NOTICE '⚠️  Profile already exists for %. Updating instead...', user_email;
    
    -- Update existing profile
    UPDATE public.users
    SET 
      email = user_email,
      first_name = user_first_name,
      last_name = user_last_name,
      role = user_role,
      is_active = true
    WHERE user_id = auth_id;
    
    RAISE NOTICE '✅ Updated profile for % (ID: %)', user_email, auth_id;
  ELSE
    -- Create new profile
    INSERT INTO public.users (
      user_id,
      first_name,
      last_name,
      email,
      role,
      is_active
    ) VALUES (
      auth_id,
      user_first_name,
      user_last_name,
      user_email,
      user_role,
      true
    );
    
    RAISE NOTICE '✅ Created profile for % (ID: %)', user_email, auth_id;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 SUCCESS! Your profile is ready.';
  RAISE NOTICE '   Now try logging in to the app again.';
  RAISE NOTICE '   You should be redirected to the % dashboard.', user_role;
END $$;

-- STEP 2: Verify the fix
SELECT '=== VERIFICATION ===' AS section;
SELECT 
  user_id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at
FROM public.users
WHERE email = 'your-email@example.com';  -- ⬅️ REPLACE WITH YOUR EMAIL

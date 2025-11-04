-- ========================================
-- FIX USER: lwaziz113@gmail.com
-- ========================================
-- This script checks if the user exists and creates the profile if missing

-- STEP 1: Check if user exists in auth.users
SELECT '=== AUTH USER ===' AS section;
SELECT 
  id AS auth_user_id,
  email,
  created_at,
  email_confirmed_at IS NOT NULL AS email_confirmed
FROM auth.users
WHERE email = 'lwaziz113@gmail.com';

-- STEP 2: Check if user exists in public.users
SELECT '=== PROFILE USER ===' AS section;
SELECT 
  user_id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at
FROM public.users
WHERE email = 'lwaziz113@gmail.com';

-- STEP 3: Create profile if missing
DO $$
DECLARE
  auth_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_id 
  FROM auth.users 
  WHERE email = 'lwaziz113@gmail.com';
  
  IF auth_id IS NULL THEN
    RAISE NOTICE '❌ ERROR: User does not exist in auth.users!';
    RAISE NOTICE '   You need to sign up first using the app.';
    RETURN;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE user_id = auth_id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE NOTICE '✅ User profile already exists!';
    RAISE NOTICE '   Auth ID: %', auth_id;
    
    -- Show current profile
    RAISE NOTICE '';
    RAISE NOTICE 'Current profile:';
    DECLARE
      user_rec RECORD;
    BEGIN
      SELECT * INTO user_rec FROM public.users WHERE user_id = auth_id;
      RAISE NOTICE '  Email: %', user_rec.email;
      RAISE NOTICE '  Name: % %', user_rec.first_name, user_rec.last_name;
      RAISE NOTICE '  Role: %', user_rec.role;
      RAISE NOTICE '  Active: %', user_rec.is_active;
    END;
  ELSE
    RAISE NOTICE '⚠️  User exists in auth but NOT in public.users!';
    RAISE NOTICE '   Creating profile now...';
    
    -- Insert profile
    INSERT INTO public.users (
      user_id,
      email,
      first_name,
      last_name,
      role,
      phone,
      is_active
    ) VALUES (
      auth_id,
      'lwaziz113@gmail.com',
      'Lwazi',  -- ⬅️ Change this if needed
      'Zulu',   -- ⬅️ Change this if needed
      'parent', -- ⬅️ Change to 'admin' if needed
      '',
      true
    );
    
    RAISE NOTICE '✅ Profile created successfully!';
    RAISE NOTICE '   User ID: %', auth_id;
    RAISE NOTICE '   Email: lwaziz113@gmail.com';
    RAISE NOTICE '   Role: parent';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 You can now log in!';
  END IF;
END $$;

-- STEP 4: Verify the fix
SELECT '=== VERIFICATION ===' AS section;
SELECT 
  u.user_id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.is_active,
  CASE 
    WHEN EXISTS(SELECT 1 FROM auth.users WHERE id = u.user_id)
    THEN '✅ Can log in'
    ELSE '❌ Cannot log in'
  END AS auth_status
FROM public.users u
WHERE u.email = 'lwaziz113@gmail.com';

-- STEP 5: Test RLS policy
SELECT '=== TESTING RLS POLICY ===' AS section;
-- This simulates what happens when the user logs in
SELECT 
  user_id,
  email,
  role
FROM public.users
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'lwaziz113@gmail.com');

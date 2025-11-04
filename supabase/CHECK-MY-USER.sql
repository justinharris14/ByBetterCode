-- ========================================
-- CHECK YOUR USER ACCOUNT
-- ========================================
-- Run this to see if YOUR account exists in both tables
-- Replace 'your-email@example.com' with YOUR actual login email

-- STEP 1: Check if you exist in auth.users
SELECT '=== YOUR AUTH USER ===' AS section;
SELECT 
  id AS user_id,
  email,
  raw_user_meta_data->>'first_name' AS first_name,
  raw_user_meta_data->>'last_name' AS last_name,
  raw_user_meta_data->>'role' AS role_in_metadata,
  email_confirmed_at IS NOT NULL AS email_confirmed,
  created_at
FROM auth.users
WHERE email = 'your-email@example.com';  -- ⬅️ REPLACE WITH YOUR EMAIL

-- STEP 2: Check if you exist in public.users
SELECT '=== YOUR PROFILE USER ===' AS section;
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

-- STEP 3: Find any mismatch
SELECT '=== CHECKING FOR MISMATCH ===' AS section;
DO $$
DECLARE
  auth_id UUID;
  profile_id UUID;
  user_email TEXT := 'your-email@example.com';  -- ⬅️ REPLACE WITH YOUR EMAIL
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_id FROM auth.users WHERE email = user_email;
  
  -- Get profile user ID
  SELECT user_id INTO profile_id FROM public.users WHERE email = user_email;
  
  IF auth_id IS NULL THEN
    RAISE NOTICE '❌ PROBLEM: You do not exist in auth.users!';
    RAISE NOTICE '   → You cannot log in.';
    RAISE NOTICE '   → Solution: Create account via signup';
  ELSIF profile_id IS NULL THEN
    RAISE NOTICE '❌ PROBLEM: You exist in auth.users but NOT in public.users!';
    RAISE NOTICE '   → You can log in but app will say "No role found"';
    RAISE NOTICE '   → Auth user ID: %', auth_id;
    RAISE NOTICE '   → Solution: Run the INSERT below to create your profile';
    RAISE NOTICE '';
    RAISE NOTICE '-- Run this to create your profile:';
    RAISE NOTICE 'INSERT INTO public.users (user_id, first_name, last_name, email, role, is_active)';
    RAISE NOTICE 'VALUES (';
    RAISE NOTICE '  ''%''::uuid,', auth_id;
    RAISE NOTICE '  ''First'',  -- Change this';
    RAISE NOTICE '  ''Last'',   -- Change this';
    RAISE NOTICE '  ''%'',', user_email;
    RAISE NOTICE '  ''parent'',  -- or ''admin''';
    RAISE NOTICE '  true';
    RAISE NOTICE ');';
  ELSIF auth_id != profile_id THEN
    RAISE NOTICE '⚠️  WARNING: Auth ID and Profile ID do not match!';
    RAISE NOTICE '   Auth ID:    %', auth_id;
    RAISE NOTICE '   Profile ID: %', profile_id;
    RAISE NOTICE '   → Solution: Update profile user_id to match auth ID';
  ELSE
    RAISE NOTICE '✅ SUCCESS: Your account exists in both tables!';
    RAISE NOTICE '   User ID: %', auth_id;
    RAISE NOTICE '   Email: %', user_email;
    RAISE NOTICE '';
    RAISE NOTICE '   If you still get "No role found", check:';
    RAISE NOTICE '   1. RLS policies allow you to read your own profile';
    RAISE NOTICE '   2. Your role field is set correctly';
  END IF;
END $$;

-- STEP 4: Test RLS policy (simulates what the app does)
SELECT '=== TESTING RLS (What app sees when you log in) ===' AS section;
-- Note: This runs as your current Supabase user, not the auth user
-- So if it returns data here but app doesn't see it, it's an RLS issue
SELECT 
  user_id,
  email,
  first_name,
  last_name,
  role
FROM public.users
WHERE email = 'your-email@example.com'  -- ⬅️ REPLACE WITH YOUR EMAIL
  OR user_id IN (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

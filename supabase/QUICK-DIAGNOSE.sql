-- ========================================
-- QUICK DIAGNOSTIC - Run this FIRST!
-- ========================================
-- Find out exactly why your login is failing

-- Step 1: What email are you trying to login with?
-- Replace 'YOUR_EMAIL_HERE' with your actual email
-- Example: WHERE email = 'lwaziz113@gmail.com'

-- ===========================
-- CHECK AUTH USERS
-- ===========================
SELECT '=== Step 1: Your auth user ===' AS info;
SELECT 
  id AS auth_id,
  email,
  email_confirmed_at IS NOT NULL AS confirmed,
  '✅ Auth user exists' AS status
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- ===========================
-- CHECK PROFILE USERS
-- ===========================
SELECT '=== Step 2: Your profile ===' AS info;
SELECT 
  user_id AS profile_id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  CASE 
    WHEN role IS NULL THEN '❌ Role is NULL!'
    WHEN role = '' THEN '❌ Role is empty!'
    ELSE '✅ Role: ' || role
  END AS status
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- ===========================
-- CHECK IF THEY MATCH
-- ===========================
SELECT '=== Step 3: Do auth and profile match? ===' AS info;
SELECT 
  a.id AS auth_id,
  a.email AS auth_email,
  p.user_id AS profile_id,
  p.email AS profile_email,
  p.role,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ NO PROFILE - This is your problem!'
    WHEN p.role IS NULL THEN '❌ NO ROLE - Need to set role!'
    WHEN p.is_active = false THEN '❌ USER INACTIVE'
    ELSE '✅ Everything looks good'
  END AS diagnosis
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.user_id
ORDER BY a.created_at DESC
LIMIT 5;

-- ===========================
-- QUICK FIX IF PROFILE MISSING
-- ===========================
-- Uncomment the lines below and replace YOUR_EMAIL_HERE with your actual email
-- Then run this script again

/*
DO $$
DECLARE
  auth_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Change this to your email!
  SELECT id INTO auth_id 
  FROM auth.users 
  WHERE email = 'YOUR_EMAIL_HERE';  -- ⬅️ CHANGE THIS!
  
  IF auth_id IS NULL THEN
    RAISE NOTICE '❌ No auth user found with that email!';
    RETURN;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE user_id = auth_id
  ) INTO profile_exists;
  
  IF NOT profile_exists THEN
    RAISE NOTICE 'Creating profile...';
    
    INSERT INTO public.users (
      user_id,
      email,
      first_name,
      last_name,
      role,
      is_active
    ) 
    SELECT 
      id,
      email,
      COALESCE(raw_user_meta_data->>'first_name', 'User'),
      COALESCE(raw_user_meta_data->>'last_name', 'Name'),
      COALESCE(raw_user_meta_data->>'role', 'parent'),
      true
    FROM auth.users
    WHERE id = auth_id;
    
    RAISE NOTICE '✅ Profile created! Try logging in now.';
  ELSE
    RAISE NOTICE '✅ Profile already exists';
  END IF;
END $$;
*/

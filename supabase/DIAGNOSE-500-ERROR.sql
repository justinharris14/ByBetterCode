-- ========================================
-- DIAGNOSE 500 ERROR ON LOGIN
-- ========================================

-- Check if profiles exist for recent login attempts
SELECT '=== Recent Auth Users ===' AS section;
SELECT 
  a.email,
  a.id AS auth_id,
  a.created_at,
  'Auth user exists' AS status
FROM auth.users a
WHERE a.email IN ('airtaxi@gmail.com', 'lwaziz113@gmail.com', 'senzoman2@gmail.com')
ORDER BY a.created_at DESC;

-- Check if profiles exist
SELECT '=== Profile Check ===' AS section;
SELECT 
  a.email,
  a.id AS auth_id,
  p.user_id AS profile_user_id,
  p.role,
  p.is_active,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ NO PROFILE - This causes 500 error!'
    WHEN p.user_id = a.id THEN '✅ Profile exists and matches'
    ELSE '⚠️ Profile exists but user_id mismatch'
  END AS status
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.user_id
WHERE a.email IN ('airtaxi@gmail.com', 'lwaziz113@gmail.com', 'senzoman2@gmail.com')
ORDER BY a.created_at DESC;

-- Check RLS policies on users table
SELECT '=== RLS Policies on Users Table ===' AS section;
SELECT 
  policyname,
  cmd,
  qual::text AS using_clause,
  with_check::text AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- Check if RLS is enabled
SELECT '=== RLS Status ===' AS section;
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'users';

-- Solution summary
DO $$
DECLARE
  missing_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_profiles
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.user_id
  WHERE p.user_id IS NULL
    AND a.email IN ('airtaxi@gmail.com', 'lwaziz113@gmail.com', 'senzoman2@gmail.com');
  
  IF missing_profiles > 0 THEN
    RAISE NOTICE '
╔══════════════════════════════════════════════════════════╗
║              500 ERROR DIAGNOSIS                          ║
╚══════════════════════════════════════════════════════════╝

❌ PROBLEM: % user(s) are missing profiles!

When the app tries to fetch user data:
  GET /rest/v1/users?user_id=eq.[auth_id]
  
The query returns 0 rows (no profile exists), causing confusion
and potentially triggering a 500 error.

✅ SOLUTION: Run the CREATE-MISSING-PROFILES-SIMPLE.sql script!

', missing_profiles;
  ELSE
    RAISE NOTICE '
╔══════════════════════════════════════════════════════════╗
║              500 ERROR DIAGNOSIS                          ║
╚══════════════════════════════════════════════════════════╝

✅ All profiles exist!

The 500 error might be caused by:
1. RLS policies blocking the query
2. Trigger errors on the users table
3. Application-level issues

Check the RLS policies above and consider temporarily disabling
RLS on the users table for testing:

  ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

';
  END IF;
END $$;

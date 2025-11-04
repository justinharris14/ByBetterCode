-- ========================================
-- FIX USERS TABLE RLS POLICIES
-- ========================================
-- Allow authenticated users to read their own profile

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ===========================
-- POLICY 1: Users can read their own profile
-- ===========================
CREATE POLICY "users_select_own"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ===========================
-- POLICY 2: Users can update their own profile
-- ===========================
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ===========================
-- POLICY 3: Service role can do everything (for triggers)
-- ===========================
CREATE POLICY "users_service_role_all"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ===========================
-- VERIFICATION
-- ===========================
SELECT '=== Current Policies on Users Table ===' AS section;
SELECT 
  policyname,
  cmd,
  roles,
  qual::text AS using_clause,
  with_check::text AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY policyname;

-- Test query that app uses
SELECT '=== Test Query (as if logged in) ===' AS section;
SELECT 
  'Testing: Can users read their profile?' AS test,
  'The policy should allow: auth.uid() = user_id' AS expected
FROM public.users
LIMIT 1;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '
╔══════════════════════════════════════════════════════════╗
║         USERS TABLE RLS POLICIES FIXED! ✅                ║
╚══════════════════════════════════════════════════════════╝

📋 New Policies:
   1. users_select_own - Users can read their own profile
   2. users_update_own - Users can update their own profile
   3. users_service_role_all - Service role can do everything

🔒 How it works:
   When user logs in with ID = "abc-123"
   → Query: SELECT * FROM users WHERE user_id = "abc-123"
   → Policy checks: auth.uid() = user_id
   → "abc-123" = "abc-123" ✅
   → User can see their profile!

📝 Next steps:
   1. ✅ RLS policies are now fixed
   2. Try logging in again
   3. The 500 error should be gone!
   
';
END $$;

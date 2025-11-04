-- ========================================
-- FIX USERS TABLE RLS - NO RECURSION
-- ========================================
-- This fixes the infinite recursion error

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Staff can view all users" ON public.users;
DROP POLICY IF EXISTS "Allow trigger to create user profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ✅ Policy 1: Users can see their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ✅ Policy 2: Allow INSERT for authenticated users (for signup/triggers)
CREATE POLICY "Allow authenticated users to create profiles"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ✅ Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

RAISE NOTICE '✅ Fixed users table RLS policies (no recursion)';
RAISE NOTICE '';
RAISE NOTICE '📋 Current policies:';
RAISE NOTICE '   1. Users can view their own profile';
RAISE NOTICE '   2. Users can create their own profile';
RAISE NOTICE '   3. Users can update their own profile';
RAISE NOTICE '';
RAISE NOTICE '⚠️  NOTE: Admin users have the same access as regular users';
RAISE NOTICE '   This prevents infinite recursion but means admins cant see all users via RLS';
RAISE NOTICE '   Use service role key for admin operations if needed';

-- Verify policies
SELECT '=== USERS TABLE POLICIES ===' AS section;
SELECT 
  policyname,
  cmd AS command,
  qual AS using_clause
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

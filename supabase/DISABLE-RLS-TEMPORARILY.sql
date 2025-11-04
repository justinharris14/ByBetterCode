-- ========================================
-- TEMPORARILY DISABLE RLS ON USERS TABLE
-- ========================================
-- This is for testing only - to confirm RLS is the issue

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  'RLS Status on Users Table' AS info,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'users';

-- Show policies (should still exist but not enforced)
SELECT 
  'Current Policies (not enforced while RLS disabled)' AS info,
  policyname
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- Test query
SELECT 
  'Test Query - Should work now' AS info,
  email,
  user_id,
  role
FROM public.users
WHERE email = 'airtaxi@gmail.com';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '
╔══════════════════════════════════════════════════════════╗
║         RLS TEMPORARILY DISABLED FOR TESTING ⚠️           ║
╚══════════════════════════════════════════════════════════╝

🔓 Row Level Security is now DISABLED on the users table.

This means:
  ✅ ALL authenticated users can read ALL profiles
  ⚠️  This is NOT secure for production!
  
📝 Next steps:
  1. Try logging in again
  2. If it works → RLS was the problem
  3. If it fails → Something else is wrong
  4. Re-enable RLS after testing with FIX-USERS-RLS.sql
  
';
END $$;

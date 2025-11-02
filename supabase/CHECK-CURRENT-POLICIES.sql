-- ========================================
-- CHECK CURRENT RLS POLICIES
-- ========================================
-- See what policies are blocking parent access

-- Show all policies on children table
SELECT '=== CURRENT POLICIES ON CHILDREN TABLE ===' AS section;
SELECT 
  policyname,
  cmd,
  qual::text AS using_clause,
  with_check::text AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'children';

-- Show what a logged-in parent would see
SELECT '=== TEST: What would Thabo see? ===' AS section;
SELECT 
  'If logged in as Thabo (22222222-2222-2222-2222-222222222222)' AS test,
  COUNT(*) AS children_visible
FROM children
WHERE parent_id = '22222222-2222-2222-2222-222222222222'::uuid;

-- Show all children with their parent info
SELECT '=== ALL CHILDREN WITH PARENT INFO ===' AS section;
SELECT 
  c.child_id,
  c.first_name || ' ' || c.last_name AS child_name,
  c.parent_id,
  u.first_name || ' ' || u.last_name AS parent_name,
  u.role AS parent_role
FROM children c
LEFT JOIN public.users u ON u.user_id = c.parent_id
ORDER BY c.created_at DESC;

-- Check if parent users have correct role
SELECT '=== PARENT USER ROLES ===' AS section;
SELECT 
  user_id,
  first_name || ' ' || last_name AS name,
  email,
  role,
  CASE 
    WHEN role = 'parent' THEN '✅ Correct'
    ELSE '❌ Wrong role: ' || role
  END AS role_status
FROM public.users
WHERE email IN ('thabo@example.com', 'naledi@example.com');

-- Summary of the problem
DO $$
DECLARE
  policy_text TEXT;
BEGIN
  SELECT qual::text INTO policy_text
  FROM pg_policies
  WHERE schemaname = 'public' 
    AND tablename = 'children'
  LIMIT 1;
  
  RAISE NOTICE '
  ╔══════════════════════════════════════════════════════════╗
  ║              POLICY ANALYSIS                              ║
  ╚══════════════════════════════════════════════════════════╝
  
  🔍 Current Policy: %
  
  ⚠️  PROBLEM: If the policy checks "role" from the users table,
     it might not work because:
     
     1. The policy runs as the authenticated user (auth.uid())
     2. It needs to join to public.users to get the role
     3. The role check might be incorrectly structured
     
  ✅ SOLUTION: We need a policy that says:
     "parent_id = auth.uid()"
     
     This directly matches the parent_id in children table
     to the logged-in users ID.
     
  ', COALESCE(policy_text, 'No policy found');
END $$;

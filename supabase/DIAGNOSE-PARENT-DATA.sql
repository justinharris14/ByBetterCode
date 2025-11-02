-- ========================================
-- DIAGNOSE PARENT DATA ISSUES
-- ========================================
-- Run this to see what's in your database

-- Check authenticated users
SELECT '=== AUTH USERS (can log in) ===' AS section;
SELECT 
  id AS user_id,
  email,
  raw_user_meta_data->>'first_name' AS first_name,
  raw_user_meta_data->>'last_name' AS last_name,
  raw_user_meta_data->>'role' AS role,
  email_confirmed_at IS NOT NULL AS can_login
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'parent'
ORDER BY created_at DESC;

-- Check profile users
SELECT '=== PROFILE USERS (in public.users table) ===' AS section;
SELECT 
  user_id,
  email,
  first_name,
  last_name,
  role,
  phone,
  is_active
FROM public.users
WHERE role = 'parent'
ORDER BY created_at DESC;

-- Check children
SELECT '=== CHILDREN (all) ===' AS section;
SELECT 
  child_id,
  first_name,
  last_name,
  dob,
  parent_id,
  gender
FROM children
ORDER BY created_at DESC;

-- Check parent-child relationships
SELECT '=== PARENT-CHILD RELATIONSHIPS ===' AS section;
SELECT 
  u.first_name || ' ' || u.last_name AS parent_name,
  u.email AS parent_email,
  u.user_id AS parent_id,
  c.first_name || ' ' || c.last_name AS child_name,
  c.child_id,
  c.dob,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = u.user_id)
    THEN '✅ Has auth'
    ELSE '❌ No auth'
  END AS auth_status
FROM public.users u
LEFT JOIN children c ON c.parent_id = u.user_id
WHERE u.role = 'parent'
ORDER BY u.first_name, c.first_name;

-- Check attendance
SELECT '=== ATTENDANCE RECORDS ===' AS section;
SELECT 
  c.first_name || ' ' || c.last_name AS child_name,
  COUNT(*) AS total_records,
  SUM(CASE WHEN a.is_present THEN 1 ELSE 0 END) AS present,
  SUM(CASE WHEN NOT a.is_present THEN 1 ELSE 0 END) AS absent
FROM children c
LEFT JOIN attendance a ON a.child_id = c.child_id
GROUP BY c.child_id, c.first_name, c.last_name;

-- Check payments
SELECT '=== PAYMENTS ===' AS section;
SELECT 
  u.first_name || ' ' || u.last_name AS parent_name,
  p.amount,
  p.payment_type,
  p.status,
  p.payment_date
FROM payments p
JOIN public.users u ON u.user_id = p.parent_id
ORDER BY p.payment_date DESC
LIMIT 10;

-- Check events
SELECT '=== UPCOMING EVENTS ===' AS section;
SELECT 
  event_id,
  title,
  description,
  event_datetime,
  created_at
FROM events
WHERE event_datetime >= NOW()
ORDER BY event_datetime
LIMIT 5;

-- Check RLS policies on children table
SELECT '=== RLS POLICIES ON CHILDREN TABLE ===' AS section;
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING'
    ELSE 'No USING'
  END AS using_clause
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'children';

-- Summary
DO $$
DECLARE
  auth_parents INTEGER;
  profile_parents INTEGER;
  total_children INTEGER;
  orphan_children INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_parents FROM auth.users WHERE raw_user_meta_data->>'role' = 'parent';
  SELECT COUNT(*) INTO profile_parents FROM public.users WHERE role = 'parent';
  SELECT COUNT(*) INTO total_children FROM children;
  SELECT COUNT(*) INTO orphan_children FROM children WHERE parent_id NOT IN (SELECT user_id FROM public.users WHERE role = 'parent');
  
  RAISE NOTICE '
  ╔══════════════════════════════════════════════════════════╗
  ║                  DATABASE STATUS                          ║
  ╚══════════════════════════════════════════════════════════╝
  
  👥 Parents with auth accounts: %
  👥 Parents with profiles: %
  👶 Total children: %
  ⚠️  Children without valid parent: %
  
  ', auth_parents, profile_parents, total_children, orphan_children;
  
  IF total_children = 0 THEN
    RAISE NOTICE '❌ PROBLEM: No children in database!';
    RAISE NOTICE '   Run FIX-PARENT-DATA.sql to add test data';
  ELSIF orphan_children > 0 THEN
    RAISE NOTICE '❌ PROBLEM: Some children have invalid parent_id!';
    RAISE NOTICE '   Run FIX-PARENT-DATA.sql to fix relationships';
  ELSIF auth_parents != profile_parents THEN
    RAISE NOTICE '❌ PROBLEM: Auth and profile counts dont match!';
    RAISE NOTICE '   Some parents cant log in';
  ELSE
    RAISE NOTICE '✅ Database looks good!';
    RAISE NOTICE '   If parents still dont see data, check RLS policies';
  END IF;
END $$;

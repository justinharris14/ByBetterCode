-- ========================================
-- DIAGNOSE PARENT DATA ISSUES
-- ========================================
-- Run this to see what's in your database

-- Check authenticated users (ALL roles)
SELECT '=== AUTH USERS (can log in) ===' AS section;
SELECT 
  id AS user_id,
  email,
  raw_user_meta_data->>'first_name' AS first_name,
  raw_user_meta_data->>'last_name' AS last_name,
  raw_user_meta_data->>'role' AS role,
  email_confirmed_at IS NOT NULL AS can_login,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- Check profile users (ALL roles)
SELECT '=== PROFILE USERS (in public.users table) ===' AS section;
SELECT 
  user_id,
  email,
  first_name,
  last_name,
  role,
  phone,
  is_active,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 20;

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

-- Check announcements
SELECT '=== RECENT ANNOUNCEMENTS ===' AS section;
SELECT 
  announcement_id,
  title,
  LEFT(message, 100) AS message_preview,
  created_at
FROM announcements
ORDER BY created_at DESC
LIMIT 5;

-- Check RLS policies on ALL key tables
SELECT '=== RLS POLICIES (ALL TABLES) ===' AS section;
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN '✅'
    ELSE '❌'
  END AS has_using_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Summary and diagnosis
DO $$
DECLARE
  auth_users INTEGER;
  auth_parents INTEGER;
  auth_admins INTEGER;
  profile_users INTEGER;
  profile_parents INTEGER;
  profile_admins INTEGER;
  total_children INTEGER;
  orphan_children INTEGER;
  total_attendance INTEGER;
  total_payments INTEGER;
  total_events INTEGER;
  total_announcements INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count users
  SELECT COUNT(*) INTO auth_users FROM auth.users;
  SELECT COUNT(*) INTO auth_parents FROM auth.users WHERE raw_user_meta_data->>'role' = 'parent';
  SELECT COUNT(*) INTO auth_admins FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin';
  SELECT COUNT(*) INTO profile_users FROM public.users;
  SELECT COUNT(*) INTO profile_parents FROM public.users WHERE role = 'parent';
  SELECT COUNT(*) INTO profile_admins FROM public.users WHERE role = 'admin';
  
  -- Count data
  SELECT COUNT(*) INTO total_children FROM children;
  SELECT COUNT(*) INTO orphan_children FROM children 
    WHERE parent_id NOT IN (SELECT user_id FROM public.users WHERE role = 'parent');
  SELECT COUNT(*) INTO total_attendance FROM attendance;
  SELECT COUNT(*) INTO total_payments FROM payments;
  SELECT COUNT(*) INTO total_events FROM events WHERE event_datetime >= NOW();
  SELECT COUNT(*) INTO total_announcements FROM announcements;
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  
  RAISE NOTICE '
╔═══════════════════════════════════════════════════════════════╗
║                    DATABASE DIAGNOSIS                          ║
╚═══════════════════════════════════════════════════════════════╝

📊 USERS:
   Auth users (can log in):     %
   Profile users:               %
   
👥 PARENTS:
   Auth parents:                %
   Profile parents:             %
   Match: %
   
👔 ADMINS:
   Auth admins:                 %
   Profile admins:              %
   Match: %

👶 DATA:
   Children:                    %
   Orphaned children:           %
   Attendance records:          %
   Payment records:             %
   Upcoming events:             %
   Announcements:               %
   
🔒 SECURITY:
   RLS policies:                %
', 
    auth_users, profile_users,
    auth_parents, profile_parents, 
    CASE WHEN auth_parents = profile_parents THEN '✅' ELSE '❌' END,
    auth_admins, profile_admins,
    CASE WHEN auth_admins = profile_admins THEN '✅' ELSE '❌' END,
    total_children, orphan_children, total_attendance, 
    total_payments, total_events, total_announcements,
    policy_count;
  
  -- Diagnose issues
  RAISE NOTICE '
╔═══════════════════════════════════════════════════════════════╗
║                         DIAGNOSIS                              ║
╚═══════════════════════════════════════════════════════════════╝
';
  
  IF total_children = 0 THEN
    RAISE NOTICE '❌ CRITICAL: No children in database!';
    RAISE NOTICE '   → Action: Run FIX-PARENT-DATA.sql to add test data';
    RAISE NOTICE '';
  END IF;
  
  IF orphan_children > 0 THEN
    RAISE NOTICE '❌ ERROR: % children have invalid parent_id!', orphan_children;
    RAISE NOTICE '   → Action: Run FIX-PARENT-DATA.sql to fix relationships';
    RAISE NOTICE '';
  END IF;
  
  IF auth_parents != profile_parents THEN
    RAISE NOTICE '⚠️  WARNING: Auth parents (%) != Profile parents (%)', auth_parents, profile_parents;
    RAISE NOTICE '   → Some parents may not be able to log in';
    RAISE NOTICE '   → Action: Check trigger function or run sync script';
    RAISE NOTICE '';
  END IF;
  
  IF auth_admins != profile_admins THEN
    RAISE NOTICE '⚠️  WARNING: Auth admins (%) != Profile admins (%)', auth_admins, profile_admins;
    RAISE NOTICE '   → Admin accounts may have issues';
    RAISE NOTICE '';
  END IF;
  
  IF policy_count < 10 THEN
    RAISE NOTICE '⚠️  WARNING: Only % RLS policies found (expected 10+)', policy_count;
    RAISE NOTICE '   → Action: Run FIX-RLS-POLICIES.sql';
    RAISE NOTICE '';
  END IF;
  
  IF total_children > 0 AND orphan_children = 0 AND policy_count >= 10 THEN
    RAISE NOTICE '✅ Database looks healthy!';
    RAISE NOTICE '   → If dashboard still shows no data:';
    RAISE NOTICE '   → 1. Verify you''re logged in as correct user';
    RAISE NOTICE '   → 2. Check browser console for errors';
    RAISE NOTICE '   → 3. Try pull-to-refresh on dashboard';
    RAISE NOTICE '   → 4. Verify parent_id matches your auth.uid()';
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '
╔═══════════════════════════════════════════════════════════════╗
║                      NEXT STEPS                                ║
╚═══════════════════════════════════════════════════════════════╝
';
  
  IF total_children = 0 OR orphan_children > 0 THEN
    RAISE NOTICE '1️⃣  Run: supabase/FIX-PARENT-DATA.sql';
  END IF;
  
  IF policy_count < 10 THEN
    RAISE NOTICE '2️⃣  Run: supabase/FIX-RLS-POLICIES.sql';
  END IF;
  
  RAISE NOTICE '3️⃣  Test login with: thabo@example.com / Password123!';
  RAISE NOTICE '4️⃣  Check dashboard - should show data';
  RAISE NOTICE '';
  
END $$;

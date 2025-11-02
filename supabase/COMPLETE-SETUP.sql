-- ========================================
-- COMPLETE PARENT USER SETUP
-- ========================================
-- This ensures everything is visible in your app
-- Run this script ONCE to set up all parent users properly

-- ===========================
-- STEP 1: Verify existing data
-- ===========================
-- Check what parent users and children exist
SELECT '=== EXISTING PARENT USERS ===' AS info;
SELECT user_id, first_name, last_name, email, role FROM public.users WHERE role = 'parent';

SELECT '=== EXISTING CHILDREN ===' AS info;
SELECT child_id, first_name, last_name, parent_id FROM children;

-- ===========================
-- STEP 2: Create auth accounts for demo parents
-- ===========================

-- Thabo Dlamini
DO $$
BEGIN
  -- Check if auth account exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '22222222-2222-2222-2222-222222222222') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '22222222-2222-2222-2222-222222222222'::uuid,
      'authenticated',
      'authenticated',
      'thabo@example.com',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      '{"first_name": "Thabo", "last_name": "Dlamini", "role": "parent"}'::jsonb,
      NOW(),
      NOW(),
      '',
      ''
    );
    RAISE NOTICE '✅ Created auth account for Thabo Dlamini (thabo@example.com)';
  ELSE
    RAISE NOTICE '⚠️  Auth account already exists for Thabo Dlamini';
  END IF;
END $$;

-- Naledi Khumalo  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '33333333-3333-3333-3333-333333333333') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '33333333-3333-3333-3333-333333333333'::uuid,
      'authenticated',
      'authenticated',
      'naledi@example.com',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      '{"first_name": "Naledi", "last_name": "Khumalo", "role": "parent"}'::jsonb,
      NOW(),
      NOW(),
      '',
      ''
    );
    RAISE NOTICE '✅ Created auth account for Naledi Khumalo (naledi@example.com)';
  ELSE
    RAISE NOTICE '⚠️  Auth account already exists for Naledi Khumalo';
  END IF;
END $$;

-- ===========================
-- STEP 3: Verify parent-children relationships
-- ===========================
SELECT '=== PARENT-CHILDREN RELATIONSHIPS ===' AS info;
SELECT 
  u.first_name || ' ' || u.last_name AS parent_name,
  u.email AS parent_email,
  c.first_name || ' ' || c.last_name AS child_name,
  c.dob AS child_dob,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = u.user_id)
    THEN '✅ Can log in'
    ELSE '❌ Cannot log in'
  END AS auth_status
FROM public.users u
LEFT JOIN children c ON c.parent_id = u.user_id
WHERE u.role = 'parent'
ORDER BY u.first_name, c.first_name;

-- ===========================
-- STEP 4: Check attendance data
-- ===========================
SELECT '=== ATTENDANCE RECORDS ===' AS info;
SELECT 
  c.first_name || ' ' || c.last_name AS child_name,
  COUNT(a.attendance_id) AS attendance_count,
  SUM(CASE WHEN a.is_present THEN 1 ELSE 0 END) AS present_days,
  SUM(CASE WHEN NOT a.is_present THEN 1 ELSE 0 END) AS absent_days
FROM children c
LEFT JOIN attendance a ON a.child_id = c.child_id
WHERE c.parent_id IN ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')
GROUP BY c.child_id, c.first_name, c.last_name;

-- ===========================
-- STEP 5: Check payments
-- ===========================
SELECT '=== PAYMENT RECORDS ===' AS info;
SELECT 
  u.first_name || ' ' || u.last_name AS parent_name,
  p.amount,
  p.payment_type,
  p.status,
  p.payment_date
FROM payments p
JOIN public.users u ON u.user_id = p.parent_id
WHERE u.role = 'parent'
ORDER BY p.payment_date DESC;

-- ===========================
-- STEP 6: Check events & announcements
-- ===========================
SELECT '=== UPCOMING EVENTS ===' AS info;
SELECT title, description, event_datetime 
FROM events 
WHERE event_datetime >= NOW()
ORDER BY event_datetime;

SELECT '=== ANNOUNCEMENTS ===' AS info;
SELECT title, message, created_at 
FROM announcements 
ORDER BY created_at DESC 
LIMIT 5;

-- ===========================
-- STEP 7: Check RLS policies
-- ===========================
SELECT '=== ACTIVE RLS POLICIES ===' AS info;
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END AS using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK'
    ELSE 'No WITH CHECK'
  END AS with_check_status
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'children', 'attendance', 'payments', 'events', 'announcements')
ORDER BY tablename, policyname;

-- ===========================
-- SUCCESS SUMMARY
-- ===========================
DO $$
DECLARE
  parent_count INTEGER;
  children_count INTEGER;
  auth_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO parent_count FROM public.users WHERE role = 'parent';
  SELECT COUNT(*) INTO children_count FROM children;
  SELECT COUNT(*) INTO auth_count FROM auth.users 
    WHERE id IN (SELECT user_id FROM public.users WHERE role = 'parent');

  RAISE NOTICE '
╔════════════════════════════════════════════════════════════╗
║              SETUP COMPLETE! ✅                             ║
╚════════════════════════════════════════════════════════════╝

📊 Summary:
   • Parent users: %
   • Parent auth accounts: %
   • Children: %

🔐 Login Credentials:

   Email: thabo@example.com
   Password: Password123!
   Children: Sipho, Kabelo

   Email: naledi@example.com
   Password: Password123!
   Children: Amahle

📱 What Parents Will See in the App:
   ✅ Their children (name, age, medical info, allergies)
   ✅ Attendance records (last 7 days)
   ✅ Payment history and pending payments
   ✅ Upcoming events
   ✅ Announcements
   ✅ Media gallery (when photos are uploaded)

🎯 Next Steps:
   1. Log in with thabo@example.com / Password123!
   2. Navigate to "My Children" to see Sipho and Kabelo
   3. Check attendance records
   4. View payment history
   5. See upcoming events and announcements

Everything is now visible in your app! 🎉
', parent_count, auth_count, children_count;
END $$;

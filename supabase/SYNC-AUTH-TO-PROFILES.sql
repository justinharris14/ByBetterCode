-- ========================================
-- SYNC AUTH USERS TO PROFILES
-- ========================================
-- Creates profiles for auth users that don't have them
-- (Opposite of sync-existing-users.sql)

-- ===========================
-- STEP 1: Show orphaned auth users
-- ===========================
SELECT '=== Orphaned Auth Users (No Profile) ===' AS section;

SELECT 
  a.id AS auth_user_id,
  a.email,
  a.created_at AS signed_up_at,
  a.raw_user_meta_data,
  '❌ Needs profile created' AS status
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY a.created_at DESC;

-- ===========================
-- STEP 2: Create missing profiles
-- ===========================
DO $$
DECLARE
  auth_rec RECORD;
  created_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Creating missing profiles...';
  RAISE NOTICE '';
  
  -- Loop through all auth users without profiles
  FOR auth_rec IN 
    SELECT 
      a.id,
      a.email,
      a.raw_user_meta_data
    FROM auth.users a
    LEFT JOIN public.users p ON a.id = p.user_id
    WHERE p.user_id IS NULL
  LOOP
    -- Create profile
    INSERT INTO public.users (
      user_id,
      email,
      first_name,
      last_name,
      role,
      phone,
      is_active
    ) VALUES (
      auth_rec.id,
      auth_rec.email,
      COALESCE(auth_rec.raw_user_meta_data->>'first_name', 'User'),
      COALESCE(auth_rec.raw_user_meta_data->>'last_name', 'Name'),
      COALESCE(auth_rec.raw_user_meta_data->>'role', 'parent'),
      COALESCE(auth_rec.raw_user_meta_data->>'phone', ''),
      true
    );
    
    created_count := created_count + 1;
    RAISE NOTICE '✅ Created profile for: %', auth_rec.email;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '────────────────────────────────────────';
  RAISE NOTICE '📊 Summary: Created % profile(s)', created_count;
  RAISE NOTICE '────────────────────────────────────────';
  
  IF created_count = 0 THEN
    RAISE NOTICE 'ℹ️  All auth users already have profiles!';
  END IF;
END $$;

-- ===========================
-- STEP 3: Verify all users now have profiles
-- ===========================
SELECT '=== Verification: All Users ===' AS section;

SELECT 
  a.id AS auth_user_id,
  a.email AS auth_email,
  p.user_id AS profile_id,
  p.email AS profile_email,
  p.role,
  p.is_active,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ Still missing profile!'
    WHEN p.role IS NULL THEN '⚠️ Profile exists but no role!'
    WHEN p.is_active = false THEN '⚠️ Profile inactive'
    ELSE '✅ All good!'
  END AS status
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.user_id
ORDER BY a.created_at DESC;

-- ===========================
-- SUCCESS MESSAGE
-- ===========================
DO $$
DECLARE
  total_auth INTEGER;
  total_profiles INTEGER;
  orphaned INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_auth FROM auth.users;
  SELECT COUNT(*) INTO total_profiles FROM public.users;
  
  SELECT COUNT(*) INTO orphaned
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.user_id
  WHERE p.user_id IS NULL;
  
  RAISE NOTICE '
╔══════════════════════════════════════════════════════════╗
║            PROFILES SYNCED SUCCESSFULLY! ✅               ║
╚══════════════════════════════════════════════════════════╝

📊 Final Statistics:
   • Total auth users: %
   • Total profiles: %
   • Orphaned (remaining): %
   
', total_auth, total_profiles, orphaned;
  
  IF orphaned = 0 THEN
    RAISE NOTICE '🎉 SUCCESS! All auth users now have profiles!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Clear app cache';
    RAISE NOTICE '   2. Close and reopen app';
    RAISE NOTICE '   3. Try logging in';
    RAISE NOTICE '   4. Role should be detected!';
  ELSE
    RAISE NOTICE '⚠️  WARNING: % user(s) still missing profiles!', orphaned;
    RAISE NOTICE '   Check if there are RLS policy issues.';
  END IF;
  
END $$;

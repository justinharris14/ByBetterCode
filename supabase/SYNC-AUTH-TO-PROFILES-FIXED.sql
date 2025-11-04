-- ========================================
-- SYNC AUTH USERS TO PROFILES (FIXED)
-- ========================================
-- Handles duplicate email conflicts

-- ===========================
-- STEP 1: Diagnose the issue
-- ===========================
SELECT '=== DIAGNOSIS: Orphaned Auth Users ===' AS section;

SELECT 
  a.id AS auth_user_id,
  a.email AS auth_email,
  p.user_id AS existing_profile_id,
  p.email AS existing_profile_email,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ No profile - needs creation'
    WHEN p.user_id != a.id THEN '⚠️ Profile exists but user_id mismatch!'
    ELSE '✅ Already synced'
  END AS status
FROM auth.users a
LEFT JOIN public.users p ON a.email = p.email
ORDER BY a.created_at DESC;

-- ===========================
-- STEP 2: Temporarily disable triggers (if they exist)
-- ===========================
DO $$
BEGIN
  ALTER TABLE public.users DISABLE TRIGGER set_updated_at_users;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'Trigger set_updated_at_users does not exist, skipping...';
END $$;

-- ===========================
-- STEP 3: Fix mismatched users
-- ===========================
DO $$
DECLARE
  auth_rec RECORD;
  existing_profile_id UUID;
  updated_count INTEGER := 0;
  created_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Syncing auth users to profiles...';
  RAISE NOTICE '';
  
  -- Loop through all auth users
  FOR auth_rec IN 
    SELECT 
      a.id AS auth_id,
      a.email,
      a.raw_user_meta_data
    FROM auth.users a
  LOOP
    -- Check if profile exists by email
    SELECT user_id INTO existing_profile_id
    FROM public.users
    WHERE email = auth_rec.email;
    
    IF existing_profile_id IS NULL THEN
      -- No profile exists - create one
      INSERT INTO public.users (
        user_id,
        email,
        first_name,
        last_name,
        role,
        phone,
        is_active
      ) VALUES (
        auth_rec.auth_id,
        auth_rec.email,
        COALESCE(auth_rec.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(auth_rec.raw_user_meta_data->>'last_name', 'Name'),
        COALESCE(auth_rec.raw_user_meta_data->>'role', 'parent'),
        COALESCE(auth_rec.raw_user_meta_data->>'phone', ''),
        true
      );
      created_count := created_count + 1;
      RAISE NOTICE '✅ Created profile for: %', auth_rec.email;
      
    ELSIF existing_profile_id != auth_rec.auth_id THEN
      -- Profile exists but user_id doesn't match - update it
      UPDATE public.users
      SET user_id = auth_rec.auth_id
      WHERE email = auth_rec.email;
      
      updated_count := updated_count + 1;
      RAISE NOTICE '🔧 Fixed user_id mismatch for: % (old: %, new: %)', 
        auth_rec.email, existing_profile_id, auth_rec.auth_id;
    ELSE
      -- Already correct
      RAISE NOTICE '✓ Already synced: %', auth_rec.email;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '────────────────────────────────────────';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   • Profiles created: %', created_count;
  RAISE NOTICE '   • Profiles fixed: %', updated_count;
  RAISE NOTICE '────────────────────────────────────────';
END $$;

-- ===========================
-- STEP 4: Re-enable triggers (if they exist)
-- ===========================
DO $$
BEGIN
  ALTER TABLE public.users ENABLE TRIGGER set_updated_at_users;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'Trigger set_updated_at_users does not exist, skipping...';
END $$;

-- ===========================
-- STEP 5: Verify all users
-- ===========================
SELECT '=== VERIFICATION: All Users ===' AS section;

SELECT 
  a.id AS auth_user_id,
  a.email AS auth_email,
  p.user_id AS profile_id,
  p.role,
  p.is_active,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ Missing profile!'
    WHEN p.user_id != a.id THEN '❌ ID mismatch!'
    WHEN p.role IS NULL THEN '⚠️ No role!'
    WHEN p.is_active = false THEN '⚠️ Inactive'
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
  mismatched INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_auth FROM auth.users;
  SELECT COUNT(*) INTO total_profiles FROM public.users;
  
  SELECT COUNT(*) INTO mismatched
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.user_id
  WHERE p.user_id IS NULL;
  
  RAISE NOTICE '
╔══════════════════════════════════════════════════════════╗
║         PROFILES SYNCED SUCCESSFULLY! ✅                  ║
╚══════════════════════════════════════════════════════════╝

📊 Final Statistics:
   • Total auth users: %
   • Total profiles: %
   • Still mismatched: %
   
', total_auth, total_profiles, mismatched;
  
  IF mismatched = 0 THEN
    RAISE NOTICE '🎉 SUCCESS! All auth users now have matching profiles!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Try logging in with senzoman2@gmail.com';
    RAISE NOTICE '   2. Check if role is detected';
    RAISE NOTICE '   3. You should be able to use the app now!';
  ELSE
    RAISE NOTICE '⚠️  WARNING: % user(s) still have issues!', mismatched;
    RAISE NOTICE '   Manual intervention may be needed.';
  END IF;
END $$;

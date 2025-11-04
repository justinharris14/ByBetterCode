-- ========================================
-- CHECK TRIGGER STATUS
-- ========================================
-- Diagnose if your trigger exists and works

-- ===========================
-- STEP 1: Does the trigger exist?
-- ===========================
SELECT '=== STEP 1: Checking if trigger exists ===' AS info;

SELECT 
  trigger_name,
  event_object_table AS on_table,
  action_timing AS when_fires,
  event_manipulation AS on_action,
  action_statement AS what_it_does,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅ Trigger EXISTS'
    ELSE '❌ Trigger MISSING'
  END AS status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- If nothing shows up above, the trigger doesn't exist!

-- ===========================
-- STEP 2: Does the function exist?
-- ===========================
SELECT '=== STEP 2: Checking if function exists ===' AS info;

SELECT 
  routine_name AS function_name,
  routine_type AS type,
  security_type,
  CASE 
    WHEN routine_name IS NOT NULL THEN '✅ Function EXISTS'
    ELSE '❌ Function MISSING'
  END AS status
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- ===========================
-- STEP 3: Show function code (if exists)
-- ===========================
SELECT '=== STEP 3: Function definition ===' AS info;

SELECT 
  pg_get_functiondef(oid) AS function_code
FROM pg_proc
WHERE proname = 'handle_new_user' 
  AND pronamespace = 'public'::regnamespace;

-- ===========================
-- STEP 4: Test if trigger would work
-- ===========================
SELECT '=== STEP 4: Testing trigger logic ===' AS info;

-- Simulate what happens when a user signs up
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Check if we can insert into users table
  BEGIN
    RAISE NOTICE '🧪 Testing if trigger function can create profiles...';
    
    -- Try to see if function exists and is callable
    IF EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'handle_new_user'
    ) THEN
      RAISE NOTICE '✅ Function exists';
    ELSE
      RAISE NOTICE '❌ Function does NOT exist - This is your problem!';
      RAISE NOTICE '   → Run FIX-TRIGGER-COMPLETE.sql to create it';
    END IF;
    
    -- Check if trigger is attached
    IF EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN
      RAISE NOTICE '✅ Trigger exists and is attached';
    ELSE
      RAISE NOTICE '❌ Trigger does NOT exist - This is your problem!';
      RAISE NOTICE '   → Run FIX-TRIGGER-COMPLETE.sql to create it';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error testing trigger: %', SQLERRM;
  END;
END $$;

-- ===========================
-- STEP 5: Check for orphaned auth users
-- ===========================
SELECT '=== STEP 5: Users with auth but no profile ===' AS info;

SELECT 
  a.id AS auth_user_id,
  a.email,
  a.created_at AS signed_up_at,
  '❌ NO PROFILE - Trigger failed!' AS issue
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY a.created_at DESC;

-- ===========================
-- DIAGNOSIS SUMMARY
-- ===========================
DO $$
DECLARE
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
  orphaned_count INTEGER;
BEGIN
  -- Check trigger
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) INTO trigger_exists;
  
  -- Check function
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user' 
    AND pronamespace = 'public'::regnamespace
  ) INTO function_exists;
  
  -- Count orphaned users
  SELECT COUNT(*) INTO orphaned_count
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.user_id
  WHERE p.user_id IS NULL;
  
  RAISE NOTICE '
╔══════════════════════════════════════════════════════════╗
║                  TRIGGER DIAGNOSIS                        ║
╚══════════════════════════════════════════════════════════╝

📊 Status:
   • Trigger exists: %
   • Function exists: %
   • Orphaned auth users: %
   
', 
  CASE WHEN trigger_exists THEN '✅ YES' ELSE '❌ NO' END,
  CASE WHEN function_exists THEN '✅ YES' ELSE '❌ NO' END,
  orphaned_count;
  
  -- Diagnose the issue
  IF NOT function_exists THEN
    RAISE NOTICE '❌ PROBLEM FOUND: Function is missing!';
    RAISE NOTICE '   The function that creates profiles does not exist.';
    RAISE NOTICE '';
    RAISE NOTICE '✅ SOLUTION:';
    RAISE NOTICE '   Run: FIX-TRIGGER-COMPLETE.sql';
    RAISE NOTICE '';
  ELSIF NOT trigger_exists THEN
    RAISE NOTICE '❌ PROBLEM FOUND: Trigger is missing!';
    RAISE NOTICE '   The trigger that calls the function is not attached.';
    RAISE NOTICE '';
    RAISE NOTICE '✅ SOLUTION:';
    RAISE NOTICE '   Run: FIX-TRIGGER-COMPLETE.sql';
    RAISE NOTICE '';
  ELSIF orphaned_count > 0 THEN
    RAISE NOTICE '⚠️  PROBLEM FOUND: Trigger exists but profiles are missing!';
    RAISE NOTICE '   The trigger exists but % user(s) have no profile.', orphaned_count;
    RAISE NOTICE '   This means:';
    RAISE NOTICE '   1. Trigger was added AFTER users signed up, OR';
    RAISE NOTICE '   2. Trigger had errors when it fired, OR';
    RAISE NOTICE '   3. RLS policies blocked profile creation';
    RAISE NOTICE '';
    RAISE NOTICE '✅ SOLUTION:';
    RAISE NOTICE '   1. Run: FIX-TRIGGER-COMPLETE.sql (fixes trigger)';
    RAISE NOTICE '   2. Run: SYNC-EXISTING-USERS.sql (creates missing profiles)';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ Everything looks good!';
    RAISE NOTICE '   Trigger and function exist, no orphaned users.';
    RAISE NOTICE '';
    RAISE NOTICE '🤔 If you still have login issues, the problem is likely:';
    RAISE NOTICE '   • RLS policies (recursive loop)';
    RAISE NOTICE '   → Run: RLS-POLICIES-OPTIMIZED.sql';
    RAISE NOTICE '';
  END IF;
  
END $$;

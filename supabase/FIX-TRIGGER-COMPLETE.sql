-- ========================================
-- FIX TRIGGER COMPLETELY
-- ========================================
-- Creates/fixes the trigger that auto-creates user profiles

-- ===========================
-- STEP 1: Drop existing trigger and function
-- ===========================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

RAISE NOTICE '✅ Cleaned up old trigger/function';

-- ===========================
-- STEP 2: Create the function
-- ===========================
-- This function runs AFTER a user signs up
-- SECURITY DEFINER means it bypasses RLS (needed to create profiles)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER  -- ⭐ This bypasses RLS!
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new profile into public.users
  INSERT INTO public.users (
    user_id,
    email,
    first_name,
    last_name,
    role,
    phone,
    is_active
  )
  VALUES (
    NEW.id,                                              -- user_id from auth.users
    NEW.email,                                           -- email from auth.users
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),  -- from signup metadata
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),   -- from signup metadata
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),      -- default to 'parent'
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),           -- from signup metadata
    true                                                  -- is_active = true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

RAISE NOTICE '✅ Function created';

-- ===========================
-- STEP 3: Attach the trigger
-- ===========================
-- This trigger fires AFTER a new user is inserted into auth.users

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

RAISE NOTICE '✅ Trigger attached';

-- ===========================
-- STEP 4: Grant permissions
-- ===========================
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

RAISE NOTICE '✅ Permissions granted';

-- ===========================
-- STEP 5: Verify setup
-- ===========================
SELECT '=== VERIFICATION ===' AS section;

SELECT 
  t.trigger_name,
  t.event_object_table AS on_table,
  t.action_timing || ' ' || t.event_manipulation AS fires_when,
  '✅ Active' AS status
FROM information_schema.triggers t
WHERE t.trigger_name = 'on_auth_user_created';

SELECT 
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  'TRIGGER' AS type,
  '✅ Ready' AS status
FROM pg_proc p
WHERE p.proname = 'handle_new_user'
  AND p.pronamespace = 'public'::regnamespace;

-- ===========================
-- SUCCESS MESSAGE
-- ===========================
DO $$
BEGIN
  RAISE NOTICE '
╔══════════════════════════════════════════════════════════╗
║              TRIGGER FIXED SUCCESSFULLY! ✅               ║
╚══════════════════════════════════════════════════════════╝

✅ What was created:
   1. Function: handle_new_user()
      • Runs with SECURITY DEFINER (bypasses RLS)
      • Creates profile in public.users
      • Gets data from signup metadata
      • Has error handling
      
   2. Trigger: on_auth_user_created
      • Attached to auth.users table
      • Fires AFTER INSERT
      • Calls handle_new_user() function
      
🎯 What this does:
   When someone signs up:
   1. Supabase creates auth account
   2. Trigger fires automatically
   3. Function creates profile with role
   4. User can log in and see dashboard!
   
⚠️  IMPORTANT:
   • This only works for NEW signups
   • Existing users without profiles need a separate fix
   • Run SYNC-EXISTING-USERS.sql to fix existing users
   
🎉 NEW USERS will now get profiles automatically!
';
END $$;

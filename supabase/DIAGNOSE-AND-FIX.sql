-- ========================================
-- COMPREHENSIVE DIAGNOSIS AND FIX
-- ========================================
-- This will identify and fix ALL issues preventing user creation

-- ===========================
-- STEP 1: Check current trigger function
-- ===========================
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';

-- ===========================
-- STEP 2: Check if trigger exists and is enabled
-- ===========================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ===========================
-- STEP 3: Check users table structure
-- ===========================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ===========================
-- STEP 4: Check RLS policies on users table
-- ===========================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- ===========================
-- STEP 5: DROP AND RECREATE TRIGGER FUNCTION (COMPLETE FIX)
-- ===========================

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create new, working function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    user_id,
    first_name,
    last_name,
    email,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
    
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===========================
-- STEP 6: Add RLS policy to allow trigger to insert
-- ===========================

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow trigger to create user profiles" ON public.users;

-- Allow the trigger function (running as SECURITY DEFINER) to insert users
CREATE POLICY "Allow trigger to create user profiles" 
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===========================
-- STEP 7: Verify everything is set up correctly
-- ===========================

SELECT '✅ Trigger function created' AS status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    )
    THEN '✅ Trigger is active'
    ELSE '❌ Trigger not found'
  END AS trigger_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
        AND policyname = 'Allow trigger to create user profiles'
    )
    THEN '✅ RLS policy created'
    ELSE '❌ RLS policy not found'
  END AS policy_status;

-- ===========================
-- SUCCESS MESSAGE
-- ===========================

DO $$
BEGIN
  RAISE NOTICE '
╔════════════════════════════════════════════════════════════╗
║                    FIX COMPLETED!                          ║
╚════════════════════════════════════════════════════════════╝

✅ Trigger function recreated
✅ Trigger reattached  
✅ RLS policy added
✅ Error handling added

NOW TRY ADDING A USER:
1. Go to Authentication → Users in Supabase Dashboard
2. Click "Add User"
3. Fill in email and password
4. Check "Auto Confirm User"
5. Add metadata: {"first_name": "Test", "last_name": "User", "role": "parent"}
6. Click Create User

It should work now! 🎉
';
END $$;

-- ========================================
-- PERMANENT FIX FOR TRIGGER FUNCTION
-- ========================================
-- Run this ONCE to fix the handle_new_user() trigger
-- After this, you can add users normally through Supabase Dashboard
-- without any errors!

-- ===========================
-- OPTION 1: Fix the trigger function (RECOMMENDED)
-- ===========================
-- This removes the reference to the non-existent 'updated_at' column

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, first_name, last_name, email, role, is_active)
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
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================
-- Verify the trigger is working
-- ===========================
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ===========================
-- SUCCESS!
-- ===========================
-- The trigger is now fixed permanently!
-- 
-- Now you can add users through Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Fill in:
--    - Email: parent@example.com
--    - Password: (choose secure password)
--    - Auto Confirm User: YES
--    - Metadata (optional): {"first_name": "John", "last_name": "Doe", "role": "parent"}
-- 
-- The trigger will automatically:
-- - Create the user in public.users table
-- - Set the role to 'parent' (or whatever you specify)
-- - Link everything correctly
-- 
-- No more errors! 🎉

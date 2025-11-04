-- ========================================
-- CREATE ADMIN USER: admin@example.com
-- ========================================
-- Password will be: admin123456

-- STEP 1: Check if admin@example.com already exists
SELECT '=== CHECKING EXISTING USER ===' AS section;
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'admin@example.com';

-- STEP 2: Create the user
-- NOTE: You'll need to run this through the Supabase Auth API or Dashboard
-- because we can't directly insert into auth.users from SQL

-- Instead, use this approach:
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) INTO admin_exists;
  
  IF admin_exists THEN
    RAISE NOTICE '⚠️  User admin@example.com already exists in auth!';
    RAISE NOTICE '   If you forgot the password, use the "Forgot Password" feature.';
  ELSE
    RAISE NOTICE '❌ User admin@example.com does NOT exist!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 TO CREATE THIS USER, choose one of these options:';
    RAISE NOTICE '';
    RAISE NOTICE 'OPTION 1: Use the app signup';
    RAISE NOTICE '  1. Go to your app';
    RAISE NOTICE '  2. Sign up with admin@example.com';
    RAISE NOTICE '  3. Then run the SQL below to set role to admin';
    RAISE NOTICE '';
    RAISE NOTICE 'OPTION 2: Run create-admin.js script';
    RAISE NOTICE '  1. Edit: scripts/create-admin.js';
    RAISE NOTICE '  2. Change email to: admin@example.com';
    RAISE NOTICE '  3. Run: node scripts/create-admin.js';
    RAISE NOTICE '';
    RAISE NOTICE 'OPTION 3: Create in Supabase Dashboard';
    RAISE NOTICE '  1. Go to: Authentication → Users';
    RAISE NOTICE '  2. Click "Add User"';
    RAISE NOTICE '  3. Email: admin@example.com';
    RAISE NOTICE '  4. Password: admin123456 (or your choice)';
    RAISE NOTICE '  5. Then run SQL below to create profile';
  END IF;
END $$;

-- STEP 3: Create profile in public.users (run AFTER creating auth user)
-- Replace 'AUTH_USER_ID_HERE' with the actual ID from auth.users
/*
INSERT INTO public.users (user_id, email, first_name, last_name, role, phone, is_active)
VALUES (
  'AUTH_USER_ID_HERE',  -- ⬅️ Get this from auth.users after creating the user
  'admin@example.com',
  'Admin',
  'User',
  'admin',
  '',
  true
);
*/

-- STEP 4: Or use this dynamic version (if auth user already exists)
DO $$
DECLARE
  auth_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Get auth user ID
  SELECT id INTO auth_id 
  FROM auth.users 
  WHERE email = 'admin@example.com';
  
  IF auth_id IS NULL THEN
    RAISE NOTICE '❌ Cannot create profile: admin@example.com not found in auth.users';
    RAISE NOTICE '   Create the auth user first (see options above)';
    RETURN;
  END IF;
  
  -- Check if profile already exists
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE user_id = auth_id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE NOTICE '✅ Profile already exists!';
    
    -- Show current profile
    DECLARE
      user_rec RECORD;
    BEGIN
      SELECT * INTO user_rec FROM public.users WHERE user_id = auth_id;
      RAISE NOTICE '';
      RAISE NOTICE 'Current profile:';
      RAISE NOTICE '  Email: %', user_rec.email;
      RAISE NOTICE '  Name: % %', user_rec.first_name, user_rec.last_name;
      RAISE NOTICE '  Role: %', user_rec.role;
      RAISE NOTICE '  Active: %', user_rec.is_active;
      
      -- Update role to admin if needed
      IF user_rec.role != 'admin' THEN
        UPDATE public.users SET role = 'admin' WHERE user_id = auth_id;
        RAISE NOTICE '';
        RAISE NOTICE '✅ Updated role to admin!';
      END IF;
    END;
  ELSE
    RAISE NOTICE '⚠️  Auth user exists but profile missing. Creating now...';
    
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
      auth_id,
      'admin@example.com',
      'Admin',
      'User',
      'admin',
      '',
      true
    );
    
    RAISE NOTICE '✅ Profile created successfully!';
    RAISE NOTICE '   User ID: %', auth_id;
    RAISE NOTICE '   Email: admin@example.com';
    RAISE NOTICE '   Role: admin';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Admin user is ready!';
  RAISE NOTICE '   You can now log in with admin@example.com';
END $$;

-- STEP 5: Verify
SELECT '=== VERIFICATION ===' AS section;
SELECT 
  u.user_id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.is_active,
  CASE 
    WHEN EXISTS(SELECT 1 FROM auth.users WHERE id = u.user_id)
    THEN '✅ Can log in'
    ELSE '❌ Cannot log in'
  END AS auth_status
FROM public.users u
WHERE u.email = 'admin@example.com';

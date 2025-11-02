-- ========================================
-- SYNC EXISTING DEMO USERS
-- ========================================
-- This creates auth accounts for users that already exist in public.users
-- but don't have authentication accounts yet

-- ===========================
-- Check which users exist in public.users but NOT in auth.users
-- ===========================
SELECT 
  u.user_id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = u.user_id)
    THEN '✅ Has auth account'
    ELSE '❌ Missing auth account'
  END as auth_status
FROM public.users u
WHERE u.role = 'parent'
ORDER BY u.created_at;

-- ===========================
-- Create auth accounts for existing parent users
-- ===========================

-- Thabo Dlamini (if auth account doesn't exist)
DO $$
BEGIN
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
    RAISE NOTICE '✅ Created auth account for Thabo Dlamini';
  ELSE
    RAISE NOTICE '⚠️ Auth account already exists for Thabo Dlamini';
  END IF;
END $$;

-- Naledi Khumalo (if auth account doesn't exist)
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
    RAISE NOTICE '✅ Created auth account for Naledi Khumalo';
  ELSE
    RAISE NOTICE '⚠️ Auth account already exists for Naledi Khumalo';
  END IF;
END $$;

-- ===========================
-- Verify all parent users now have auth accounts
-- ===========================
SELECT 
  u.user_id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = u.user_id)
    THEN '✅ Has auth account'
    ELSE '❌ Missing auth account'
  END as auth_status
FROM public.users u
WHERE u.role = 'parent'
ORDER BY u.created_at;

-- ===========================
-- SUCCESS!
-- ===========================
-- Demo parent users can now log in with:
-- 
-- Email: thabo@example.com
-- Password: Password123!
-- 
-- Email: naledi@example.com  
-- Password: Password123!
-- ===========================

-- Complete Parent User Setup for CrècheConnect
-- This script does everything in one go - auth + profiles
-- Run this in your Supabase SQL Editor

-- ===========================
-- STEP 1: Fix the trigger function (remove updated_at reference)
-- ===========================

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
    last_name = EXCLUDED.last_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================
-- STEP 2: Create auth users with Supabase admin function
-- ===========================

-- Parent 1: Sarah Johnson
DO $$
DECLARE
  new_user_id uuid := '44444444-4444-4444-4444-444444444444';
BEGIN
  -- Create auth user (this will trigger the handle_new_user function)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'sarah.johnson@example.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"first_name": "Sarah", "last_name": "Johnson", "role": "parent"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Update profile with additional details
  UPDATE public.users SET
    phone = '+27821234567',
    address = '12 Garden Avenue',
    city = 'Cape Town',
    postal_code = '8001',
    id_number = '8905125800087',
    work_phone = '+27215551234',
    emergency_contact_name = 'James Johnson',
    emergency_contact_phone = '+27823456780',
    emergency_contact_relationship = 'Spouse'
  WHERE user_id = new_user_id;
END $$;

-- Parent 2: Michael Smith
DO $$
DECLARE
  new_user_id uuid := '55555555-5555-5555-5555-555555555555';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
    'michael.smith@example.com', crypt('Password123!', gen_salt('bf')), NOW(),
    '{"first_name": "Michael", "last_name": "Smith", "role": "parent"}'::jsonb,
    NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;
  
  UPDATE public.users SET
    phone = '+27822345678', address = '56 Beach Road', city = 'Durban',
    postal_code = '4001', id_number = '8712225800088', work_phone = '+27315552345',
    emergency_contact_name = 'Emma Smith', emergency_contact_phone = '+27834567891',
    emergency_contact_relationship = 'Spouse'
  WHERE user_id = new_user_id;
END $$;

-- Parent 3: Zanele Moyo
DO $$
DECLARE
  new_user_id uuid := '66666666-6666-6666-6666-666666666666';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
    'zanele.moyo@example.com', crypt('Password123!', gen_salt('bf')), NOW(),
    '{"first_name": "Zanele", "last_name": "Moyo", "role": "parent"}'::jsonb,
    NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;
  
  UPDATE public.users SET
    phone = '+27823456789', address = '89 Park Street', city = 'Johannesburg',
    postal_code = '2000', id_number = '9101125900089', work_phone = '+27115553456',
    emergency_contact_name = 'Thandi Moyo', emergency_contact_phone = '+27845678902',
    emergency_contact_relationship = 'Sister'
  WHERE user_id = new_user_id;
END $$;

-- Parent 4: David Lee
DO $$
DECLARE
  new_user_id uuid := '77777777-7777-7777-7777-777777777777';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
    'david.lee@example.com', crypt('Password123!', gen_salt('bf')), NOW(),
    '{"first_name": "David", "last_name": "Lee", "role": "parent"}'::jsonb,
    NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;
  
  UPDATE public.users SET
    phone = '+27824567890', address = '34 Mountain View', city = 'Pretoria',
    postal_code = '0002', id_number = '8203035800090', work_phone = '+27125554567',
    emergency_contact_name = 'Linda Lee', emergency_contact_phone = '+27856789013',
    emergency_contact_relationship = 'Spouse'
  WHERE user_id = new_user_id;
END $$;

-- Parent 5: Nomvula Zulu
DO $$
DECLARE
  new_user_id uuid := '88888888-8888-8888-8888-888888888888';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated',
    'nomvula.zulu@example.com', crypt('Password123!', gen_salt('bf')), NOW(),
    '{"first_name": "Nomvula", "last_name": "Zulu", "role": "parent"}'::jsonb,
    NOW(), NOW(), '', ''
  ) ON CONFLICT (id) DO NOTHING;
  
  UPDATE public.users SET
    phone = '+27825678901', address = '67 Valley Drive', city = 'Port Elizabeth',
    postal_code = '6001', id_number = '9402145900091', work_phone = '+27415555678',
    emergency_contact_name = 'Sibusiso Zulu', emergency_contact_phone = '+27867890124',
    emergency_contact_relationship = 'Brother'
  WHERE user_id = new_user_id;
END $$;

-- ===========================
-- VERIFY USERS WERE CREATED
-- ===========================
SELECT 
  u.user_id,
  u.first_name,
  u.last_name,
  u.email,
  u.role,
  u.is_active,
  u.phone,
  u.city
FROM public.users u
WHERE u.role = 'parent'
  AND u.user_id IN (
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888'
  )
ORDER BY u.created_at DESC;

-- ===========================
-- SUCCESS! 
-- ===========================
-- All 5 parent users created with:
-- - Authentication accounts (can log in)
-- - Complete profiles with contact details
-- - Default password: Password123!
-- 
-- Test login with:
-- Email: sarah.johnson@example.com
-- Password: Password123!

-- Add Parent Users to CrècheConnect
-- SIMPLIFIED VERSION - Only inserts into public.users table
-- Authentication is managed separately through Supabase Dashboard
-- Run this in your Supabase SQL Editor

-- ===========================
-- PARENT USERS - PUBLIC PROFILES ONLY
-- ===========================
-- Note: After running this, you need to create auth accounts in Supabase Dashboard
-- Go to Authentication > Users > Add User for each parent below

-- Parent 2: Michael Smith
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role
)
VALUES (
  '55555555-5555-5555-5555-555555555555'::uuid,
  'michael.smith@example.com',
  crypt('Password123!', gen_salt('bf')), -- Change this password
  NOW(),
  '{"first_name": "Michael", "last_name": "Smith", "role": "parent"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Parent 3: Zanele Moyo
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role
)
VALUES (
  '66666666-6666-6666-6666-666666666666'::uuid,
  'zanele.moyo@example.com',
  crypt('Password123!', gen_salt('bf')), -- Change this password
  NOW(),
  '{"first_name": "Zanele", "last_name": "Moyo", "role": "parent"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Parent 4: David Lee
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role
)
VALUES (
  '77777777-7777-7777-7777-777777777777'::uuid,
  'david.lee@example.com',
  crypt('Password123!', gen_salt('bf')), -- Change this password
  NOW(),
  '{"first_name": "David", "last_name": "Lee", "role": "parent"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Parent 5: Nomvula Zulu
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role
)
VALUES (
  '88888888-8888-8888-8888-888888888888'::uuid,
  'nomvula.zulu@example.com',
  crypt('Password123!', gen_salt('bf')), -- Change this password
  NOW(),
  '{"first_name": "Nomvula", "last_name": "Zulu", "role": "parent"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================
-- ADD PUBLIC USER PROFILES
-- (The trigger should handle this automatically, but adding manually as fallback)
-- ===========================

INSERT INTO public.users (
  user_id, first_name, last_name, email, phone, role, is_active,
  address, city, postal_code, id_number, work_phone,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
)
VALUES 
  (
    '44444444-4444-4444-4444-444444444444',
    'Sarah', 'Johnson', 'sarah.johnson@example.com', '+27821234567', 'parent', true,
    '12 Garden Avenue', 'Cape Town', '8001', '8905125800087', '+27215551234',
    'James Johnson', '+27823456780', 'Spouse'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Michael', 'Smith', 'michael.smith@example.com', '+27822345678', 'parent', true,
    '56 Beach Road', 'Durban', '4001', '8712225800088', '+27315552345',
    'Emma Smith', '+27834567891', 'Spouse'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Zanele', 'Moyo', 'zanele.moyo@example.com', '+27823456789', 'parent', true,
    '89 Park Street', 'Johannesburg', '2000', '9101125900089', '+27115553456',
    'Thandi Moyo', '+27845678902', 'Sister'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'David', 'Lee', 'david.lee@example.com', '+27824567890', 'parent', true,
    '34 Mountain View', 'Pretoria', '0002', '8203035800090', '+27125554567',
    'Linda Lee', '+27856789013', 'Spouse'
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'Nomvula', 'Zulu', 'nomvula.zulu@example.com', '+27825678901', 'parent', true,
    '67 Valley Drive', 'Port Elizabeth', '6001', '9402145900091', '+27415555678',
    'Sibusiso Zulu', '+27867890124', 'Brother'
  )
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone;

-- ===========================
-- Re-enable trigger
-- ===========================
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- ===========================
-- VERIFY USERS WERE ADDED
-- ===========================
SELECT 
  u.user_id,
  u.first_name,
  u.last_name,
  u.email,
  u.role,
  u.is_active,
  u.phone
FROM public.users u
WHERE u.role = 'parent'
ORDER BY u.created_at DESC;

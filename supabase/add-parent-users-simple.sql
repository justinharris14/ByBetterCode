-- Add Parent Users to CrècheConnect
-- SIMPLE VERSION - Only adds to public.users table
-- You'll create auth accounts through Supabase Dashboard separately
-- Run this in your Supabase SQL Editor

-- ===========================
-- ADD PUBLIC USER PROFILES
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

-- ===========================
-- NEXT STEPS - CREATE AUTH ACCOUNTS
-- ===========================
-- Now go to Supabase Dashboard and create authentication accounts:
-- 
-- 1. Go to: https://supabase.com/dashboard/project/bldlekwvgeatnqjwiowq/auth/users
-- 2. Click "Add User" button
-- 3. For EACH parent above, create an auth account:
--
--    User 1:
--    - Email: sarah.johnson@example.com
--    - Password: Password123! (give this to the parent)
--    - User UID: 44444444-4444-4444-4444-444444444444 (IMPORTANT: Use exact UUID from above!)
--    - Auto Confirm User: YES
--
--    User 2:
--    - Email: michael.smith@example.com
--    - Password: Password123!
--    - User UID: 55555555-5555-5555-5555-555555555555
--    - Auto Confirm User: YES
--
--    User 3:
--    - Email: zanele.moyo@example.com
--    - Password: Password123!
--    - User UID: 66666666-6666-6666-6666-666666666666
--    - Auto Confirm User: YES
--
--    User 4:
--    - Email: david.lee@example.com
--    - Password: Password123!
--    - User UID: 77777777-7777-7777-7777-777777777777
--    - Auto Confirm User: YES
--
--    User 5:
--    - Email: nomvula.zulu@example.com
--    - Password: Password123!
--    - User UID: 88888888-8888-8888-8888-888888888888
--    - Auto Confirm User: YES
--
-- IMPORTANT: The User UID MUST match the user_id in the public.users table!

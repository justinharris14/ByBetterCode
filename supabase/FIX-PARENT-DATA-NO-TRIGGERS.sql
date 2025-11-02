-- ========================================
-- FIX PARENT DATA - DISABLE TRIGGERS VERSION
-- ========================================
-- Temporarily disable triggers that use missing realtime functions

-- Disable the problematic triggers (ignore errors if they don't exist)
DO $$
BEGIN
  ALTER TABLE attendance DISABLE TRIGGER create_absence_notification_trigger;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE absence_notifications DISABLE TRIGGER broadcast_absence_notification_trigger;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Now run the parent data script content
-- ===========================
-- STEP 1: Ensure test parents exist
-- ===========================

-- Thabo Dlamini (thabo@example.com)
DO $$
BEGIN
  -- Create auth user if doesn't exist (check both ID and email)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '22222222-2222-2222-2222-222222222222' OR email = 'thabo@example.com') THEN
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
    RAISE NOTICE 'ℹ️ Auth account already exists for Thabo Dlamini';
  END IF;
  
  -- Ensure profile exists
  INSERT INTO public.users (user_id, first_name, last_name, email, role, is_active, phone)
  VALUES (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Thabo',
    'Dlamini',
    'thabo@example.com',
    'parent',
    true,
    '+27821234567'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;
    
  RAISE NOTICE '✅ Ensured profile for Thabo Dlamini';
END $$;

-- Naledi Khumalo (naledi@example.com)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '33333333-3333-3333-3333-333333333333' OR email = 'naledi@example.com') THEN
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
    RAISE NOTICE 'ℹ️ Auth account already exists for Naledi Khumalo';
  END IF;
  
  INSERT INTO public.users (user_id, first_name, last_name, email, role, is_active, phone)
  VALUES (
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Naledi',
    'Khumalo',
    'naledi@example.com',
    'parent',
    true,
    '+27822345678'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;
    
  RAISE NOTICE '✅ Ensured profile for Naledi Khumalo';
END $$;

-- ===========================
-- STEP 2: Add children for Thabo Dlamini
-- ===========================

-- Sipho Dlamini
INSERT INTO children (
  child_id,
  parent_id,
  first_name,
  last_name,
  dob,
  gender,
  allergies,
  medical_info,
  dietary_restrictions
) VALUES (
  'c1111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Sipho',
  'Dlamini',
  '2020-03-15'::date,
  'male',
  'Peanuts',
  'None',
  'No peanuts'
)
ON CONFLICT (child_id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Kabelo Dlamini
INSERT INTO children (
  child_id,
  parent_id,
  first_name,
  last_name,
  dob,
  gender,
  allergies,
  medical_info,
  dietary_restrictions
) VALUES (
  'c2222222-2222-2222-2222-222222222222'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Kabelo',
  'Dlamini',
  '2021-07-22'::date,
  'male',
  'None',
  'Asthma - has inhaler',
  'None'
)
ON CONFLICT (child_id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

DO $$ BEGIN
  RAISE NOTICE '✅ Added children for Thabo: Sipho and Kabelo';
END $$;

-- ===========================
-- STEP 3: Add child for Naledi Khumalo
-- ===========================

INSERT INTO children (
  child_id,
  parent_id,
  first_name,
  last_name,
  dob,
  gender,
  allergies,
  medical_info,
  dietary_restrictions
) VALUES (
  'c3333333-3333-3333-3333-333333333333'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Amahle',
  'Khumalo',
  '2019-11-08'::date,
  'female',
  'Dairy',
  'Lactose intolerant',
  'No dairy products'
)
ON CONFLICT (child_id) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

DO $$ BEGIN
  RAISE NOTICE '✅ Added child for Naledi: Amahle';
END $$;

-- ===========================
-- STEP 4: Add sample attendance records
-- ===========================

-- Last 7 days attendance for Sipho
INSERT INTO attendance (attendance_id, child_id, date, is_present)
SELECT 
  gen_random_uuid(),
  'c1111111-1111-1111-1111-111111111111'::uuid,
  date::date,
  (random() > 0.2) -- 80% present
FROM generate_series(
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '1 day',
  INTERVAL '1 day'
) AS date
ON CONFLICT DO NOTHING;

-- Last 7 days attendance for Kabelo
INSERT INTO attendance (attendance_id, child_id, date, is_present)
SELECT 
  gen_random_uuid(),
  'c2222222-2222-2222-2222-222222222222'::uuid,
  date::date,
  (random() > 0.15) -- 85% present
FROM generate_series(
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '1 day',
  INTERVAL '1 day'
) AS date
ON CONFLICT DO NOTHING;

-- Last 7 days attendance for Amahle
INSERT INTO attendance (attendance_id, child_id, date, is_present)
SELECT 
  gen_random_uuid(),
  'c3333333-3333-3333-3333-333333333333'::uuid,
  date::date,
  (random() > 0.1) -- 90% present
FROM generate_series(
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '1 day',
  INTERVAL '1 day'
) AS date
ON CONFLICT DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE '✅ Added attendance records for last 7 days';
END $$;

-- ===========================
-- STEP 5: Add sample payments
-- ===========================

-- Thabo's payments
INSERT INTO payments (payment_id, parent_id, amount, payment_type, status, payment_date, description)
VALUES 
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 150000, 'tuition', 'paid', NOW() - INTERVAL '15 days', 'October Tuition Fee'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 8000, 'weekly_meal', 'paid', NOW() - INTERVAL '7 days', 'Weekly Meal Plan'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222'::uuid, 150000, 'tuition', 'pending', NOW() + INTERVAL '5 days', 'November Tuition Fee')
ON CONFLICT DO NOTHING;

-- Naledi's payments
INSERT INTO payments (payment_id, parent_id, amount, payment_type, status, payment_date, description)
VALUES 
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333'::uuid, 150000, 'tuition', 'paid', NOW() - INTERVAL '20 days', 'October Tuition Fee'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333'::uuid, 150000, 'tuition', 'overdue', NOW() - INTERVAL '5 days', 'November Tuition Fee - OVERDUE')
ON CONFLICT DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE '✅ Added payment records';
END $$;

-- ===========================
-- STEP 6: Add upcoming events
-- ===========================

INSERT INTO events (event_id, title, description, event_datetime)
VALUES 
  (gen_random_uuid(), 'Parent-Teacher Conference', 'Discuss your childs progress with teachers', NOW() + INTERVAL '5 days'),
  (gen_random_uuid(), 'Sports Day', 'Annual sports day event for all children', NOW() + INTERVAL '10 days'),
  (gen_random_uuid(), 'End of Year Concert', 'Children will perform songs and dances', NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE '✅ Added upcoming events';
END $$;

-- ===========================
-- STEP 7: Add announcements
-- ===========================

INSERT INTO announcements (announcement_id, title, message, priority)
VALUES 
  (gen_random_uuid(), 'School Closed Next Monday', 'The school will be closed on Monday for a public holiday.', 'high'),
  (gen_random_uuid(), 'New Meal Menu', 'Check out our new healthy meal menu starting next week!', 'medium'),
  (gen_random_uuid(), 'Photo Day Next Week', 'Professional photos will be taken on Thursday. Please dress your child nicely.', 'medium')
ON CONFLICT DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE '✅ Added announcements';
END $$;

-- Re-enable the triggers
DO $$
BEGIN
  ALTER TABLE attendance ENABLE TRIGGER create_absence_notification_trigger;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE absence_notifications ENABLE TRIGGER broadcast_absence_notification_trigger;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- ===========================
-- SUCCESS!
-- ===========================
DO $$
DECLARE
  thabo_children INTEGER;
  naledi_children INTEGER;
BEGIN
  SELECT COUNT(*) INTO thabo_children FROM children WHERE parent_id = '22222222-2222-2222-2222-222222222222';
  SELECT COUNT(*) INTO naledi_children FROM children WHERE parent_id = '33333333-3333-3333-3333-333333333333';
  
  RAISE NOTICE '
  ╔══════════════════════════════════════════════════════════╗
  ║           TEST DATA CREATED SUCCESSFULLY! ✅              ║
  ╚══════════════════════════════════════════════════════════╝
  
  👨‍👦 Thabo Dlamini (thabo@example.com) - % children
  👩‍👧 Naledi Khumalo (naledi@example.com) - % child
  
  ✅ Sample data added:
     • Children with full details
     • 7 days of attendance records
     • Payment history (paid, pending, overdue)
     • 3 upcoming events
     • 3 announcements
     
  🔐 Test login:
     Email: thabo@example.com
     Password: Password123!
     
  🎉 Parent dashboard should now show all data!
  ', thabo_children, naledi_children;
END $$;

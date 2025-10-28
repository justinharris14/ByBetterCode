
-- CrècheConnect Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'parent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  -- Address information
  address TEXT,
  city TEXT,
  postal_code TEXT,
  id_number TEXT,
  work_phone TEXT,
  -- Emergency contacts
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  secondary_emergency_contact_name TEXT,
  secondary_emergency_contact_phone TEXT,
  secondary_emergency_contact_relationship TEXT
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  child_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  allergies TEXT,
  medical_info TEXT,
  parent_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Medical information
  blood_type TEXT,
  doctor_name TEXT,
  doctor_phone TEXT,
  medical_aid_name TEXT,
  medical_aid_number TEXT,
  chronic_conditions TEXT,
  medications TEXT,
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  -- Special needs
  special_needs TEXT,
  dietary_restrictions TEXT
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(child_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_present BOOLEAN NOT NULL DEFAULT FALSE,
  marked_by UUID REFERENCES users(user_id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, date)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by_id UUID REFERENCES users(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Notifications table
CREATE TABLE IF NOT EXISTS event_notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  announcement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by_id UUID REFERENCES users(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  media_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(child_id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(user_id),
  media_kind TEXT NOT NULL CHECK (media_kind IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  consent_granted BOOLEAN DEFAULT FALSE,
  caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Children policies
CREATE POLICY "Parents can view their own children" ON children
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Admins can view all children" ON children
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Attendance policies
CREATE POLICY "Parents can view their children's attendance" ON attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM children WHERE children.child_id = attendance.child_id AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Events policies
CREATE POLICY "Everyone can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Event Notifications policies
CREATE POLICY "Parents can view their own notifications" ON event_notifications
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents can update their own notifications" ON event_notifications
  FOR UPDATE USING (parent_id = auth.uid());

-- Payments policies
CREATE POLICY "Parents can view their own payments" ON payments
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Announcements policies
CREATE POLICY "Everyone can view announcements" ON announcements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Media policies
CREATE POLICY "Parents can view media of their children with consent" ON media
  FOR SELECT USING (
    consent_granted = true AND EXISTS (
      SELECT 1 FROM children WHERE children.child_id = media.child_id AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all media" ON media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert demo data with enhanced details

-- Admin user
INSERT INTO users (
  user_id, first_name, last_name, email, phone, role, is_active,
  address, city, postal_code, work_phone,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'Lindiwe', 'Mkhize', 'admin@crecheconnect.com', '+27123456789', 'admin', true,
  '123 Main Street', 'Johannesburg', '2001', '+27119876543',
  'John Mkhize', '+27823456789', 'Spouse'
);

-- Parent users with comprehensive details
INSERT INTO users (
  user_id, first_name, last_name, email, phone, role, is_active,
  address, city, postal_code, id_number, work_phone,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
  secondary_emergency_contact_name, secondary_emergency_contact_phone, secondary_emergency_contact_relationship
)
VALUES 
  (
    '22222222-2222-2222-2222-222222222222', 
    'Thabo', 'Dlamini', 'thabo@example.com', '+27123456780', 'parent', true,
    '45 Oak Avenue', 'Pretoria', '0002', '8501015800083', '+27126543210',
    'Nomsa Dlamini', '+27834567890', 'Spouse',
    'Grace Dlamini', '+27845678901', 'Mother'
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    'Naledi', 'Khumalo', 'naledi@example.com', '+27123456781', 'parent', true,
    '78 Pine Road', 'Durban', '4001', '9203125900084', '+27315678901',
    'Peter Khumalo', '+27856789012', 'Brother',
    'Sarah Khumalo', '+27867890123', 'Sister'
  );

-- Children with comprehensive medical and emergency information
INSERT INTO children (
  child_id, first_name, last_name, dob, gender, parent_id,
  allergies, chronic_conditions, medications, medical_info,
  blood_type, doctor_name, doctor_phone,
  medical_aid_name, medical_aid_number,
  emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
  special_needs, dietary_restrictions
)
VALUES 
  (
    '44444444-4444-4444-4444-444444444444', 
    'Sipho', 'Dlamini', '2019-03-15', 'male', '22222222-2222-2222-2222-222222222222',
    'Peanuts, Tree nuts', 'Asthma', 'Ventolin inhaler - 2 puffs as needed', 'Uses blue inhaler for asthma. Keep spare in emergency kit.',
    'A+', 'Dr. James Nkosi', '+27115551234',
    'Discovery Health', '1234567890',
    'Grace Dlamini', '+27845678901', 'Grandmother',
    'None', 'No nuts, nut-free diet'
  ),
  (
    '55555555-5555-5555-5555-555555555555', 
    'Kabelo', 'Dlamini', '2021-07-22', 'male', '22222222-2222-2222-2222-222222222222',
    NULL, NULL, NULL, 'Healthy, no known conditions',
    'O+', 'Dr. James Nkosi', '+27115551234',
    'Discovery Health', '1234567890',
    'Grace Dlamini', '+27845678901', 'Grandmother',
    'None', 'None'
  ),
  (
    '66666666-6666-6666-6666-666666666666', 
    'Amahle', 'Khumalo', '2020-11-10', 'female', '33333333-3333-3333-3333-333333333333',
    'Dairy (lactose intolerant)', NULL, NULL, 'Lactose intolerant - avoid all dairy products',
    'B+', 'Dr. Sarah Mbatha', '+27315552345',
    'Bonitas Medical Fund', '9876543210',
    'Peter Khumalo', '+27856789012', 'Uncle',
    'None', 'Lactose-free diet, no dairy products'
  );

-- Events
INSERT INTO events (event_id, title, description, event_datetime, created_by_id)
VALUES 
  ('77777777-7777-7777-7777-777777777777', 'Sports Day', 'Annual sports day with fun activities for all children', '2025-02-15 09:00:00+02', '11111111-1111-1111-1111-111111111111'),
  ('88888888-8888-8888-8888-888888888888', 'Parent Meeting', 'Quarterly parent-teacher meeting to discuss progress', '2025-02-20 18:00:00+02', '11111111-1111-1111-1111-111111111111');

-- Announcements
INSERT INTO announcements (announcement_id, title, message, created_by_id)
VALUES 
  ('99999999-9999-9999-9999-999999999999', 'Welcome Back!', 'We are excited to welcome all our children back for the new term. Let us make this a wonderful year together!', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Fees Due Reminder', 'Please note that school fees for February are due by the 5th. Contact the office if you need assistance.', '11111111-1111-1111-1111-111111111111');

-- Payments
INSERT INTO payments (payment_id, parent_id, amount, payment_type, status, payment_date)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 1500.00, 'Tuition - February', 'paid', '2025-02-01'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 800.00, 'Activity Fee', 'pending', '2025-02-15'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 1500.00, 'Tuition - February', 'paid', '2025-02-01');

-- Media
INSERT INTO media (media_id, child_id, uploaded_by, media_kind, media_url, consent_granted, caption)
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'photo', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9', true, 'Sipho enjoying art class'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'photo', 'https://images.unsplash.com/photo-1587616211892-e5e9c4f3f1e0', true, 'Kabelo playing with blocks'),
  ('10101010-1010-1010-1010-101010101010', '66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'photo', 'https://images.unsplash.com/photo-1560421683-6856ea585c78', true, 'Amahle at storytime');

-- Attendance records (last 7 days)
INSERT INTO attendance (child_id, date, is_present, marked_by)
SELECT 
  c.child_id,
  CURRENT_DATE - (n || ' days')::interval,
  (random() > 0.1)::boolean,
  '11111111-1111-1111-1111-111111111111'
FROM children c
CROSS JOIN generate_series(0, 6) n;

-- Function to sync auth.users with public.users
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comments
COMMENT ON COLUMN users.emergency_contact_name IS 'Primary emergency contact full name';
COMMENT ON COLUMN users.emergency_contact_phone IS 'Primary emergency contact phone number';
COMMENT ON COLUMN users.emergency_contact_relationship IS 'Relationship to parent (e.g., spouse, sibling, friend)';
COMMENT ON COLUMN children.emergency_contact_name IS 'Emergency contact if parent unavailable';
COMMENT ON COLUMN children.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN children.chronic_conditions IS 'Any chronic medical conditions (e.g., asthma, diabetes)';
COMMENT ON COLUMN children.medications IS 'Current medications and dosages';
COMMENT ON COLUMN children.blood_type IS 'Blood type (e.g., A+, O-, AB+)';
COMMENT ON COLUMN children.dietary_restrictions IS 'Any dietary restrictions or special diet requirements';

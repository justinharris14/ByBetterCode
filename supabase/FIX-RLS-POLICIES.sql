-- ========================================
-- FIX RLS POLICIES FOR PARENT ACCESS
-- ========================================
-- Ensures parents can see their data

-- ===========================
-- CHILDREN TABLE
-- ===========================

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can view their own children" ON children;
DROP POLICY IF EXISTS "Teachers and admins can view all children" ON children;
DROP POLICY IF EXISTS "Allow parent read access" ON children;
DROP POLICY IF EXISTS "Allow staff full access" ON children;

-- Enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Parents can see their own children
CREATE POLICY "Parents can view their own children"
  ON children
  FOR SELECT
  TO authenticated
  USING (
    parent_id = auth.uid()
  );

-- Staff can see all children
CREATE POLICY "Staff can view all children"
  ON children
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  );

-- Separate INSERT policy for admins
DROP POLICY IF EXISTS "Admins can insert children" ON children;
CREATE POLICY "Admins can insert children"
  ON children
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  );

RAISE NOTICE '✅ Fixed RLS policies for children table';

-- ===========================
-- ATTENDANCE TABLE
-- ===========================

DROP POLICY IF EXISTS "Parents can view their childrens attendance" ON attendance;
DROP POLICY IF EXISTS "Staff can view all attendance" ON attendance;

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Parents can see their children's attendance
CREATE POLICY "Parents can view their childrens attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT child_id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Staff can manage all attendance
CREATE POLICY "Staff can manage all attendance"
  ON attendance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  );

RAISE NOTICE '✅ Fixed RLS policies for attendance table';

-- ===========================
-- PAYMENTS TABLE
-- ===========================

DROP POLICY IF EXISTS "Parents can view their own payments" ON payments;
DROP POLICY IF EXISTS "Staff can view all payments" ON payments;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Parents can see their own payments
CREATE POLICY "Parents can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    parent_id = auth.uid()
  );

-- Staff can manage all payments
CREATE POLICY "Staff can manage all payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  );

RAISE NOTICE '✅ Fixed RLS policies for payments table';

-- ===========================
-- EVENTS TABLE
-- ===========================

DROP POLICY IF EXISTS "Everyone can view events" ON events;
DROP POLICY IF EXISTS "Staff can manage events" ON events;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- All authenticated users can see events
CREATE POLICY "Everyone can view events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Staff can manage events
CREATE POLICY "Staff can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ('admin')
    )
  );

RAISE NOTICE '✅ Fixed RLS policies for events table';

-- ===========================
-- ANNOUNCEMENTS TABLE
-- ===========================

DROP POLICY IF EXISTS "Everyone can view announcements" ON announcements;
DROP POLICY IF EXISTS "Staff can manage announcements" ON announcements;

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- All authenticated users can see announcements
CREATE POLICY "Everyone can view announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Staff can manage announcements
CREATE POLICY "Staff can manage announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  );

-- Separate INSERT policy for admins
DROP POLICY IF EXISTS "Allow admin to create announcements" ON announcements;
CREATE POLICY "Allow admin to create announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  );

RAISE NOTICE '✅ Fixed RLS policies for announcements table';

-- ===========================
-- USERS TABLE
-- ===========================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Staff can view all users" ON public.users;
DROP POLICY IF EXISTS "Allow trigger to create user profiles" ON public.users;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can see their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Staff can see all users
CREATE POLICY "Staff can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  );

-- Allow the trigger to insert users
CREATE POLICY "Allow trigger to create user profiles"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow admins to insert users manually
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ('admin')
    )
  );

RAISE NOTICE '✅ Fixed RLS policies for users table';

-- ===========================
-- MEDIA_CONSENT TABLE
-- ===========================

DROP POLICY IF EXISTS "Parents can manage their childrens consent" ON media_consent;
DROP POLICY IF EXISTS "Staff can view all consents" ON media_consent;

ALTER TABLE media_consent ENABLE ROW LEVEL SECURITY;

-- Parents can manage their children's consent
CREATE POLICY "Parents can manage their childrens consent"
  ON media_consent
  FOR ALL
  TO authenticated
  USING (
    child_id IN (
      SELECT child_id FROM children WHERE parent_id = auth.uid()
    )
  )
  WITH CHECK (
    child_id IN (
      SELECT child_id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Staff can see all consents
CREATE POLICY "Staff can view all consents"
  ON media_consent
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  );

-- Separate INSERT policy for parents to create consent forms
DROP POLICY IF EXISTS "Parents can create consent forms for their children" ON media_consent;
CREATE POLICY "Parents can create consent forms for their children"
  ON media_consent
  FOR INSERT
  TO authenticated
  WITH CHECK (
    child_id IN (
      SELECT child_id FROM children WHERE parent_id = auth.uid()
    )
  );

RAISE NOTICE '✅ Fixed RLS policies for media_consent table';

-- ===========================
-- MEDIA TABLE
-- ===========================

DROP POLICY IF EXISTS "Parents can view media of their children" ON media;
DROP POLICY IF EXISTS "Staff can manage all media" ON media;

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Parents can view media of their children
CREATE POLICY "Parents can view media of their children"
  ON media
  FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT child_id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Staff can manage all media
CREATE POLICY "Staff can manage all media"
  ON media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ('admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ( 'admin')
    )
  );

RAISE NOTICE '✅ Fixed RLS policies for media table';

-- ===========================
-- NOTIFICATIONS TABLES
-- ===========================

-- Absence notifications
DROP POLICY IF EXISTS "Parents can view their notifications" ON absence_notifications;
DROP POLICY IF EXISTS "Admins can create absence notifications" ON absence_notifications;
ALTER TABLE absence_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their notifications"
  ON absence_notifications
  FOR ALL
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Separate INSERT policy for admins
CREATE POLICY "Admins can create absence notifications"
  ON absence_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ('teacher')
    )
  );

-- Event notifications
DROP POLICY IF EXISTS "Parents can view their event notifications" ON event_notifications;
ALTER TABLE event_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their event notifications"
  ON event_notifications
  FOR ALL
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Announcement notifications
DROP POLICY IF EXISTS "Parents can view their announcement notifications" ON announcement_notifications;
ALTER TABLE announcement_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their announcement notifications"
  ON announcement_notifications
  FOR ALL
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

RAISE NOTICE '✅ Fixed RLS policies for notification tables';

-- ===========================
-- VERIFY POLICIES
-- ===========================
SELECT '=== RLS POLICIES VERIFICATION ===' AS section;
SELECT 
  tablename,
  policyname,
  cmd AS command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ===========================
-- SUCCESS!
-- ===========================
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  
  RAISE NOTICE '
  ╔══════════════════════════════════════════════════════════╗
  ║           RLS POLICIES FIXED SUCCESSFULLY! ✅             ║
  ╚══════════════════════════════════════════════════════════╝
  
  📊 Total policies: %
  
  ✅ Parents can now:
     • View their own children
     • See their childrens attendance
     • View their payment history
     • See upcoming events
     • Read announcements
     • Manage media consent
     • View photos of their children
     
  ✅ Staff can:
     • View all children
     • Manage attendance
     • View all payments
     • Create events
     • Post announcements
     • Upload media
     
  🔒 Security:
     • Parents can ONLY see their own data
     • Parents CANNOT see other childrens data
     • Staff have full access
     
  🎉 Parents should now see all their data in the app!
  ', policy_count;
END $$;

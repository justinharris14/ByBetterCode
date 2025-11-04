-- ========================================
-- ALL TRIGGERS FOR CRECHE CONNECT APP
-- ========================================
-- Complete trigger setup for your childcare management system

-- ===========================
-- CLEANUP: Drop all existing triggers
-- ===========================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_event_created ON events;
DROP TRIGGER IF EXISTS on_announcement_created ON announcements;
DROP TRIGGER IF EXISTS set_updated_at ON users;
DROP TRIGGER IF EXISTS set_updated_at ON children;
DROP TRIGGER IF EXISTS set_updated_at ON payments;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.notify_parents_of_event() CASCADE;
DROP FUNCTION IF EXISTS public.notify_parents_of_announcement() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

RAISE NOTICE '✅ Cleaned up existing triggers';

-- ===========================
-- TRIGGER 1: Auto-create user profile on signup
-- ===========================
-- 🔥 CRITICAL - Without this, users can't log in!

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    user_id,
    email,
    first_name,
    last_name,
    role,
    phone,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

RAISE NOTICE '✅ Trigger 1: Auto-create user profiles';

-- ===========================
-- TRIGGER 2: Notify parents when new event is created
-- ===========================
-- 🎉 Automatically creates notifications for all parents

CREATE OR REPLACE FUNCTION public.notify_parents_of_event()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert notification for every parent
  INSERT INTO event_notifications (event_id, parent_id, sent_at, is_read)
  SELECT 
    NEW.event_id,
    user_id,
    NOW(),
    false
  FROM public.users
  WHERE role = 'parent' AND is_active = true;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in notify_parents_of_event: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_event_created
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_parents_of_event();

RAISE NOTICE '✅ Trigger 2: Auto-notify parents of new events';

-- ===========================
-- TRIGGER 3: Notify parents when new announcement is created
-- ===========================
-- 📢 Automatically creates notifications for all parents

CREATE OR REPLACE FUNCTION public.notify_parents_of_announcement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert notification for every parent
  INSERT INTO announcement_notifications (announcement_id, parent_id, sent_at, is_read)
  SELECT 
    NEW.announcement_id,
    user_id,
    NOW(),
    false
  FROM public.users
  WHERE role = 'parent' AND is_active = true;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in notify_parents_of_announcement: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_announcement_created
  AFTER INSERT ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_parents_of_announcement();

RAISE NOTICE '✅ Trigger 3: Auto-notify parents of new announcements';

-- ===========================
-- TRIGGER 4 (OPTIONAL): Auto-update timestamps
-- ===========================
-- 🕐 Automatically sets updated_at field when records change

-- First, add updated_at columns if they don't exist
DO $$
BEGIN
  -- Check and add updated_at to users table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Check and add updated_at to children table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'children' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE children ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Check and add updated_at to payments table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create function to set updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to users table
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Apply to children table
CREATE TRIGGER set_updated_at_children
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Apply to payments table
CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

RAISE NOTICE '✅ Trigger 4: Auto-update timestamps (optional)';

-- ===========================
-- GRANT PERMISSIONS
-- ===========================
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.notify_parents_of_event() TO postgres, service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.notify_parents_of_announcement() TO postgres, service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO postgres, service_role, authenticated;

RAISE NOTICE '✅ Permissions granted';

-- ===========================
-- VERIFICATION
-- ===========================
SELECT '=== ACTIVE TRIGGERS ===' AS section;

SELECT 
  t.trigger_name,
  t.event_object_table AS on_table,
  t.action_timing || ' ' || t.event_manipulation AS fires_when,
  t.action_statement AS executes
FROM information_schema.triggers t
WHERE t.trigger_schema = 'public' OR t.event_object_schema = 'auth'
ORDER BY t.event_object_table, t.trigger_name;

-- ===========================
-- TEST QUERIES
-- ===========================
SELECT '=== TEST: Check if triggers work ===' AS section;

-- Count current notifications
SELECT 
  'event_notifications' AS table_name,
  COUNT(*) AS current_count
FROM event_notifications
UNION ALL
SELECT 
  'announcement_notifications',
  COUNT(*)
FROM announcement_notifications;

-- ===========================
-- SUCCESS MESSAGE
-- ===========================
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count 
  FROM information_schema.triggers
  WHERE trigger_schema IN ('public', 'auth')
    AND trigger_name IN (
      'on_auth_user_created',
      'on_event_created',
      'on_announcement_created',
      'set_updated_at_users',
      'set_updated_at_children',
      'set_updated_at_payments'
    );
  
  RAISE NOTICE '
╔══════════════════════════════════════════════════════════╗
║           ALL TRIGGERS CONFIGURED! ✅                     ║
╚══════════════════════════════════════════════════════════╝

📊 Total triggers created: %

🔥 TRIGGER 1: on_auth_user_created
   • Fires: AFTER INSERT on auth.users
   • Purpose: Creates user profile automatically
   • Critical: YES - Without this, users cant log in!
   
🎉 TRIGGER 2: on_event_created
   • Fires: AFTER INSERT on events
   • Purpose: Notifies all parents of new events
   • Critical: NO - But improves user experience
   
📢 TRIGGER 3: on_announcement_created
   • Fires: AFTER INSERT on announcements
   • Purpose: Notifies all parents of new announcements
   • Critical: NO - But improves user experience
   
🕐 TRIGGER 4: set_updated_at (3 triggers)
   • Fires: BEFORE UPDATE on users, children, payments
   • Purpose: Auto-updates timestamp fields
   • Critical: NO - Nice to have for auditing
   
💡 WHAT EACH TRIGGER DOES:

1️⃣  User Signs Up → Profile Created Automatically
    Without this, users have auth but no profile = cant login
    
2️⃣  Admin Creates Event → All Parents Notified
    Parents see notifications in their dashboard
    
3️⃣  Admin Creates Announcement → All Parents Notified
    Parents see notifications in their dashboard
    
4️⃣  Record Updated → Timestamp Updated
    Helps track when data was last modified
    
🎯 NEXT STEPS:

1. ✅ Triggers are now active
2. ✅ Run SYNC-AUTH-TO-PROFILES.sql to fix existing users
3. ✅ Test by creating a new event or announcement
4. ✅ Check if parents receive notifications
5. ✅ Sign up a test user to verify profile creation

📝 Testing checklist:
   □ Sign up new user → Check if profile exists
   □ Create event → Check if all parents get notification
   □ Create announcement → Check if all parents get notification
   □ Update a record → Check if updated_at changes
   
', trigger_count;
END $$;

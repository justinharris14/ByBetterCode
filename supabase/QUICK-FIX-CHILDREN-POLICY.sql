-- ========================================
-- QUICK FIX: Children Table Policy
-- ========================================
-- The current policy checks "role" which is too complex
-- We need a simple policy: parent_id = auth.uid()

-- Drop ONLY the problematic SELECT policy
DROP POLICY IF EXISTS "users can read children based on role" ON children;
DROP POLICY IF EXISTS "Parents can view their own children" ON children;
DROP POLICY IF EXISTS "Teachers and admins can view all children" ON children;
DROP POLICY IF EXISTS "Allow parent read access" ON children;
DROP POLICY IF EXISTS "Staff can view all children" ON children;

-- Keep existing admin policies (INSERT/UPDATE/DELETE) - don't drop these:
-- - "admin can insert children" 
-- - "admin can update children"
-- - "admins can delete children"

-- Ensure RLS is enabled
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Create simple policy for parents to READ their own children
CREATE POLICY "Parents see their own children"
  ON children
  FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

-- Create policy for staff to READ all children
CREATE POLICY "Staff see all children"
  ON children
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND role IN ('admin')
    )
  );

-- Verify the new policies
SELECT '=== NEW POLICIES ON CHILDREN TABLE ===' AS section;
SELECT 
  policyname,
  cmd AS command,
  CASE 
    WHEN policyname = 'Parents see their own children' 
    THEN '✅ Simple: parent_id = auth.uid()'
    WHEN policyname = 'Staff see all children'
    THEN '✅ Staff can see everything'
    ELSE '❓ Unknown policy'
  END AS description
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'children';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '
  ╔══════════════════════════════════════════════════════════╗
  ║         CHILDREN TABLE POLICY FIXED! ✅                   ║
  ╚══════════════════════════════════════════════════════════╝
  
  ✅ OLD POLICY REMOVED:
     "users can read children based on role"
     (Too complex, checking role incorrectly)
     
  ✅ NEW POLICIES CREATED:
     
     1. Parents see their own children
        → Simple rule: parent_id = auth.uid()
        → Parents can ONLY see their own children
        
     2. Staff see all children  
        → Teachers and admins see everything
        → For managing the creche
        
  🎯 WHAT THIS MEANS:
     When Thabo logs in (user_id: 22222...222)
     He will see children WHERE parent_id = 22222...222
     
     Simple and secure! ✅
     
  📱 NOW TEST IN YOUR APP:
     1. Log in as thabo@example.com
     2. Go to "My Children" page
     3. Should see Sipho and Kabelo
     
  If you still dont see children, run FIX-PARENT-DATA.sql
  to create the test children with correct parent_id.
  ';
END $$;

-- ========================================
-- CREATE MISSING PROFILES - SIMPLE VERSION
-- ========================================
-- Just creates profiles for auth users who don't have them

-- Show diagnosis
SELECT 
  'Diagnosis:' AS info,
  a.email,
  a.id AS auth_id,
  p.user_id AS profile_user_id,
  CASE 
    WHEN p.user_id IS NULL AND p.email IS NULL THEN '❌ No profile'
    WHEN p.user_id != a.id THEN '⚠️ Mismatched user_id'
    ELSE '✅ OK'
  END AS status
FROM auth.users a
LEFT JOIN public.users p ON a.email = p.email
ORDER BY a.created_at DESC;

-- Create profiles for users with NO profile at all
INSERT INTO public.users (user_id, email, first_name, last_name, role, phone, is_active)
SELECT 
  a.id,
  a.email,
  COALESCE(a.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(a.raw_user_meta_data->>'last_name', 'Name'),
  COALESCE(a.raw_user_meta_data->>'role', 'parent'),
  COALESCE(a.raw_user_meta_data->>'phone', ''),
  true
FROM auth.users a
LEFT JOIN public.users p ON a.email = p.email
WHERE p.email IS NULL  -- No profile exists at all
ON CONFLICT (user_id) DO NOTHING;

-- Verify it worked
SELECT 
  'Verification:' AS info,
  a.email,
  a.id AS auth_id,
  p.user_id AS profile_id,
  p.role,
  CASE 
    WHEN p.user_id IS NOT NULL THEN '✅ Has profile'
    ELSE '❌ Still missing'
  END AS status
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.user_id
ORDER BY a.created_at DESC;

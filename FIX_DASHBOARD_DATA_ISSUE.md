# 🔧 Fix Dashboard Data Issue - Complete Guide

## Problem Identified

Your application is loading and authentication works, but the dashboard shows **no data** after login. This is a common issue with Supabase applications.

## Root Causes

Based on your project structure, there are **3 possible causes**:

1. **Row Level Security (RLS) Policies** - Database policies are blocking data access
2. **Missing Data** - Your database tables are empty
3. **Auth-Profile Mismatch** - The logged-in user's ID doesn't match the parent_id in children records

## 🎯 Solution Steps

Follow these steps **in order** to diagnose and fix the issue:

---

## Step 1: Diagnose the Problem

Run the diagnostic script to see what's in your database.

### How to Run:

1. Open **Supabase Dashboard**: https://supabase.com/dashboard/project/bldlekwvgeatnqjwiowq
2. Click **SQL Editor** in the left sidebar
3. Open the file: `supabase/DIAGNOSE-PARENT-DATA.sql`
4. Copy all contents and paste into SQL Editor
5. Click **Run** (or press Ctrl+Enter)

### What to Look For:

The script will show you:
- ✅ Which users can log in (auth.users)
- ✅ Which users have profiles (public.users)
- ✅ All children in the database
- ✅ Parent-child relationships
- ⚠️ Any orphaned children (children without valid parents)
- 📊 Attendance, payment, and event counts
- 🔒 Current RLS policies

### Expected Output:

Look at the final section "DATABASE STATUS":
- If **Total children: 0** → You need test data (go to Step 2)
- If **Children without valid parent: > 0** → Parent-child mismatch (go to Step 2)
- If **Auth and profile counts don't match** → Auth sync issue (go to Step 2)
- If everything looks good → RLS policy issue (go to Step 3)

---

## Step 2: Add Test Data (If Needed)

If your database is empty or has invalid relationships, you need to add test data.

### Option A: Use Existing Script

1. Open **SQL Editor** in Supabase
2. Open the file: `supabase/FIX-PARENT-DATA.sql`
3. Copy all contents and paste into SQL Editor
4. Click **Run**

This will create:
- 2 parent accounts (auth + profile)
- 3 children with medical info
- 7 days of attendance records
- Sample payments (paid/pending/overdue)
- 3 upcoming events
- 3 announcements

**Test Credentials Created:**
- Email: `thabo@example.com` | Password: `Password123!`
- Email: `naledi@example.com` | Password: `Password123!`

### Option B: Link Your Actual Account to Children

If you want to use your **real** account instead of test accounts:

1. First, find your user ID:
```sql
-- Run this in SQL Editor
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

2. Then, insert children linked to YOUR user ID:
```sql
-- Replace 'YOUR-USER-ID-HERE' with the ID from step 1
INSERT INTO children (
  child_id, parent_id, first_name, last_name, dob, gender, 
  allergies, medical_info
) VALUES 
  (
    gen_random_uuid(),
    'YOUR-USER-ID-HERE'::uuid,  -- ⬅️ Replace this!
    'Emma',
    'Smith',
    '2019-05-15'::date,
    'female',
    'None',
    'Healthy, no known conditions'
  ),
  (
    gen_random_uuid(),
    'YOUR-USER-ID-HERE'::uuid,  -- ⬅️ Replace this!
    'Liam',
    'Smith',
    '2021-08-20'::date,
    'male',
    'Peanuts',
    'Allergic to peanuts - keep EpiPen on hand'
  );
```

3. Add attendance records:
```sql
-- This creates attendance for the last 7 days for all children
INSERT INTO attendance (child_id, date, is_present, marked_by)
SELECT 
  c.child_id,
  CURRENT_DATE - (n || ' days')::interval,
  (random() > 0.1)::boolean,  -- 90% attendance rate
  (SELECT user_id FROM users WHERE role = 'admin' LIMIT 1)
FROM children c
CROSS JOIN generate_series(0, 6) n
WHERE c.parent_id = 'YOUR-USER-ID-HERE'::uuid;  -- ⬅️ Replace this!
```

4. Add sample payments:
```sql
INSERT INTO payments (parent_id, amount, payment_type, status, payment_date)
VALUES 
  ('YOUR-USER-ID-HERE'::uuid, 1500.00, 'Tuition - January', 'paid', CURRENT_DATE - 10),
  ('YOUR-USER-ID-HERE'::uuid, 1500.00, 'Tuition - February', 'pending', CURRENT_DATE + 5);
```

---

## Step 3: Fix RLS Policies

Even with data in the database, if RLS policies are wrong, parents won't see their data.

### Run the Fix Script:

1. Open **SQL Editor** in Supabase
2. Open the file: `supabase/FIX-RLS-POLICIES.sql`
3. Copy all contents and paste into SQL Editor
4. Click **Run**

This will:
- ✅ Drop old/conflicting policies
- ✅ Create correct policies for all tables
- ✅ Allow parents to see ONLY their own data
- ✅ Allow admins to see everything

### Verify Policies:

After running the script, verify policies are correct:

```sql
-- Check RLS policies on key tables
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('children', 'attendance', 'payments', 'events')
ORDER BY tablename, policyname;
```

You should see policies like:
- `Parents can view their own children`
- `Parents can view their childrens attendance`
- `Parents can view their own payments`
- `Everyone can view events`

---

## Step 4: Test the App

Now test if the data is showing:

### Admin Dashboard Test:

1. Log in as admin: `admin@crecheconnect.com`
2. Dashboard should show:
   - Total Children count
   - Upcoming Events count
   - Attendance rate

### Parent Dashboard Test:

1. Log in as parent (use test account or your real account)
2. Dashboard should show:
   - Children count
   - Upcoming events
   - Notifications
   - Pending payments

### Specific Pages to Check:

- **My Children** → Should list all your children
- **Attendance** → Should show attendance records
- **Payments** → Should show payment history
- **Events** → Should show upcoming events
- **Announcements** → Should show latest announcements

### If Still No Data:

1. **Pull to refresh** on the dashboard (swipe down)
2. **Sign out and sign back in**
3. **Check browser console** for errors:
   - Open DevTools (F12)
   - Look for red errors in Console tab
   - Look for messages like "Error loading children"

---

## 🐛 Troubleshooting

### Issue: "Error loading children"

**Cause:** RLS policies blocking access

**Fix:**
```sql
-- Check if parent has children
SELECT * FROM children WHERE parent_id = auth.uid();

-- If empty, the logged-in user doesn't have children
-- Add a child:
INSERT INTO children (parent_id, first_name, last_name, dob, gender)
VALUES (auth.uid(), 'Test', 'Child', '2020-01-01', 'male');
```

### Issue: Children exist but parent can't see them

**Cause:** `parent_id` doesn't match `auth.uid()`

**Fix:**
```sql
-- Find the mismatch
SELECT 
  c.child_id,
  c.first_name,
  c.parent_id AS stored_parent_id,
  u.user_id AS profile_user_id,
  u.email
FROM children c
LEFT JOIN users u ON u.email = 'your-email@example.com';

-- Update parent_id to match auth user
UPDATE children
SET parent_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
WHERE child_id = 'CHILD-ID-HERE';
```

### Issue: Admin can see data but parents cannot

**Cause:** Parent-specific RLS policies missing

**Fix:** Re-run `FIX-RLS-POLICIES.sql` from Step 3

### Issue: No test accounts work

**Cause:** Auth accounts weren't created

**Fix:**
```sql
-- Check if auth users exist
SELECT email FROM auth.users WHERE email LIKE '%example.com';

-- If empty, the FIX-PARENT-DATA.sql didn't run completely
-- Re-run the entire script
```

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Diagnostic script runs without errors
- [ ] Database has children records
- [ ] Parent-child relationships are correct (parent_id matches auth.uid)
- [ ] RLS policies are in place for all tables
- [ ] Admin dashboard shows stats (children count, events, attendance rate)
- [ ] Parent dashboard shows stats (children count, events, notifications)
- [ ] My Children page shows all children
- [ ] Attendance page shows records
- [ ] Payments page shows history
- [ ] No console errors in browser DevTools

---

## 📊 Quick Status Check

Run this quick query to verify everything is working:

```sql
-- Quick status check
DO $$
DECLARE
  total_users INTEGER;
  total_children INTEGER;
  total_attendance INTEGER;
  total_payments INTEGER;
  total_events INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO total_children FROM children;
  SELECT COUNT(*) INTO total_attendance FROM attendance;
  SELECT COUNT(*) INTO total_payments FROM payments;
  SELECT COUNT(*) INTO total_events FROM events;
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  
  RAISE NOTICE '
  ═══════════════════════════════════════
  DATABASE STATUS
  ═══════════════════════════════════════
  
  👥 Total Users: %
  👶 Total Children: %
  ✅ Attendance Records: %
  💰 Payment Records: %
  📅 Events: %
  🔒 RLS Policies: %
  
  ', total_users, total_children, total_attendance, total_payments, total_events, policy_count;
  
  IF total_children = 0 THEN
    RAISE NOTICE '⚠️  WARNING: No children in database!';
  END IF;
  
  IF policy_count < 10 THEN
    RAISE NOTICE '⚠️  WARNING: Not enough RLS policies!';
  END IF;
  
  IF total_children > 0 AND policy_count >= 10 THEN
    RAISE NOTICE '✅ Database looks healthy!';
  END IF;
END $$;
```

---

## 🎯 Most Common Solution

Based on similar issues, **90% of the time** the problem is:

1. **Empty database** - Run `FIX-PARENT-DATA.sql`
2. **Wrong RLS policies** - Run `FIX-RLS-POLICIES.sql`

These two scripts will fix the majority of dashboard data issues.

---

## 📞 Need More Help?

If data still doesn't show after following this guide:

1. Share the output of `DIAGNOSE-PARENT-DATA.sql`
2. Share any console errors from browser DevTools
3. Confirm which account you're logged in as
4. Verify your Supabase project URL matches: `https://bldlekwvgeatnqjwiowq.supabase.co`

---

## 🎉 Expected Result

After completing all steps:

**Admin Dashboard:**
```
Total Children: 3
Upcoming Events: 2
Attendance Today: 85%
```

**Parent Dashboard (Thabo):**
```
My Children: 2 (Sipho & Kabelo)
Upcoming Events: 2
Unread Notifications: 0
Pending Payments: 1
```

**Parent Dashboard (Naledi):**
```
My Children: 1 (Amahle)
Upcoming Events: 2
Unread Notifications: 0
Pending Payments: 0
```

All pages should load with data, and pull-to-refresh should work!

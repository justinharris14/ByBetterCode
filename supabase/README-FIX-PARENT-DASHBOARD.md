# Fix Parent Dashboard - No Data Showing

## Problem
Parents can log in but don't see:
- Their children
- Attendance records
- Payment history
- Events
- Any other information

## Root Causes
1. **No children linked to parent accounts** - Children records don't exist or have wrong parent_id
2. **Missing RLS policies** - Row Level Security blocking data access
3. **Empty database** - No test data to display

## Solution - Run These Scripts in Order

### Step 1: Diagnose the Problem
**File:** `DIAGNOSE-PARENT-DATA.sql`

Run this first to see what's in your database:
```sql
-- Copy and paste contents into Supabase SQL Editor
-- This will show you:
-- - Which parents exist
-- - Which children exist
-- - Parent-child relationships
-- - Missing data
```

### Step 2: Add Test Data
**File:** `FIX-PARENT-DATA.sql`

This creates:
- 2 parent accounts with login credentials
- 3 children (2 for Thabo, 1 for Naledi)
- 7 days of attendance records
- Sample payments (paid, pending, overdue)
- 3 upcoming events
- 3 announcements

**Test Credentials:**
- Email: `thabo@example.com` | Password: `Password123!`
- Email: `naledi@example.com` | Password: `Password123!`

### Step 3: Fix Security Policies
**File:** `FIX-RLS-POLICIES.sql`

This fixes Row Level Security so:
- Parents can see ONLY their own children and data
- Parents CANNOT see other children's data
- Staff can see everything
- All tables are properly secured

## How to Run

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard/project/bldlekwvgeatnqjwiowq

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Run scripts in order:**
   ```
   1. DIAGNOSE-PARENT-DATA.sql   (see what's wrong)
   2. FIX-PARENT-DATA.sql        (add test data)
   3. FIX-RLS-POLICIES.sql       (fix permissions)
   ```

4. **Test the app**
   - Log in as: thabo@example.com / Password123!
   - You should see:
     - 2 children: Sipho and Kabelo
     - Attendance records for the last 7 days
     - Payment history
     - Upcoming events
     - Announcements

## What Each Script Does

### DIAGNOSE-PARENT-DATA.sql
- Shows auth users vs profile users
- Lists all children
- Shows parent-child relationships
- Identifies orphaned children (no valid parent)
- Counts attendance, payments, events
- Highlights problems

### FIX-PARENT-DATA.sql
- Creates 2 parent accounts (auth + profile)
- Adds 3 children with full details:
  - Sipho Dlamini (age 4, allergic to peanuts)
  - Kabelo Dlamini (age 3, has asthma)
  - Amahle Khumalo (age 5, lactose intolerant)
- Adds 7 days attendance for each child
- Creates payment records (paid/pending/overdue)
- Adds 3 upcoming events
- Creates 3 announcements

### FIX-RLS-POLICIES.sql
- Fixes all Row Level Security policies
- Ensures parents can only see their own data
- Gives staff full access
- Secures all tables:
  - children
  - attendance
  - payments
  - events
  - announcements
  - media
  - media_consent
  - notifications

## Expected Results

After running all scripts, parents should see:

✅ **Dashboard:**
- Children count: 1-2
- Upcoming events: 3
- Notifications (if any)
- Pending payments

✅ **My Children page:**
- Child name, age, photo
- Date of birth
- Gender
- Allergies
- Medical information
- Dietary restrictions

✅ **Attendance page:**
- Last 7 days of attendance
- Present/absent status
- Notes (if any)

✅ **Payments page:**
- Payment history
- Pending payments
- Overdue payments
- Quick payment buttons

✅ **Events page:**
- Upcoming events with dates
- Event descriptions
- Add to calendar button

## Troubleshooting

### Still no data showing?

1. **Check you're logged in as the right user**
   - Must be: thabo@example.com or naledi@example.com

2. **Check the console logs**
   - Look for errors in the app console
   - Common: "Error loading children: ..."

3. **Verify in database**
   - Run DIAGNOSE-PARENT-DATA.sql again
   - Check if children have correct parent_id

4. **Check RLS policies**
   - Supabase Dashboard → Authentication → Policies
   - Each table should have policies listed

5. **Try pulling to refresh**
   - Swipe down on any screen to refresh data

### Common Issues

**"No children registered"**
- Children don't exist in database
- Run FIX-PARENT-DATA.sql

**"Error loading children"**
- RLS policies blocking access
- Run FIX-RLS-POLICIES.sql

**Login fails**
- Auth account doesn't exist
- Run FIX-PARENT-DATA.sql (creates auth)

**Children exist but parent can't see them**
- parent_id doesn't match auth user's ID
- Check with DIAGNOSE-PARENT-DATA.sql
- Fix relationships in database

## Need More Test Data?

To add more children for Thabo:

```sql
INSERT INTO children (child_id, parent_id, first_name, last_name, dob, gender)
VALUES (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222'::uuid,
  'New Child',
  'Dlamini',
  '2022-01-15'::date,
  'female'
);
```

## Success Criteria

✅ Parent can log in
✅ Dashboard shows correct counts
✅ My Children page shows all children
✅ Attendance page shows records
✅ Payments page shows history
✅ Events page shows upcoming events
✅ No console errors

🎉 All data visible and working!

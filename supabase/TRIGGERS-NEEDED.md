# Triggers Needed for Your Creche App 🔥

## Essential Triggers (MUST HAVE)

### 1️⃣ **Auto-Create User Profile** ⭐ CRITICAL

**Trigger Name:** `on_auth_user_created`  
**Fires:** AFTER INSERT on `auth.users`  
**Purpose:** Creates profile in `public.users` when someone signs up

```
User signs up → Auth account created → Trigger fires → Profile created
```

**Why it's critical:**
- ❌ Without this: Users can't log in (no role, no profile)
- ✅ With this: Users can log in immediately after signup

**Status:** This is your MAIN problem right now!

---

## Useful Triggers (SHOULD HAVE)

### 2️⃣ **Auto-Notify Parents of Events**

**Trigger Name:** `on_event_created`  
**Fires:** AFTER INSERT on `events`  
**Purpose:** Creates notification for all parents when event is posted

```
Admin creates event → Trigger fires → All parents get notification
```

**Why it's useful:**
- Parents see events in their dashboard automatically
- No need to manually create notifications
- Better user experience

---

### 3️⃣ **Auto-Notify Parents of Announcements**

**Trigger Name:** `on_announcement_created`  
**Fires:** AFTER INSERT on `announcements`  
**Purpose:** Creates notification for all parents when announcement is posted

```
Admin posts announcement → Trigger fires → All parents get notification
```

**Why it's useful:**
- Parents stay informed automatically
- Reduces admin workload
- Ensures no parent misses important info

---

## Optional Triggers (NICE TO HAVE)

### 4️⃣ **Auto-Update Timestamps**

**Trigger Names:** 
- `set_updated_at_users`
- `set_updated_at_children`
- `set_updated_at_payments`

**Fires:** BEFORE UPDATE on respective tables  
**Purpose:** Automatically sets `updated_at` field when record changes

```
Admin updates child info → Trigger fires → updated_at = NOW()
```

**Why it's useful:**
- Track when data was last modified
- Helpful for auditing
- Helpful for syncing data

---

## Triggers You DON'T Need

### ❌ Auto-Delete Child When Parent Deleted
**Why not:** Already handled by `ON DELETE CASCADE` in foreign keys

### ❌ Validate Email Format
**Why not:** Already handled by Supabase Auth and app validation

### ❌ Auto-Calculate Payment Totals
**Why not:** Should be done in application logic for flexibility

### ❌ Log All Changes
**Why not:** Use Supabase's built-in audit logging instead

---

## Summary Table

| Trigger | Table | Priority | Status |
|---------|-------|----------|--------|
| `on_auth_user_created` | `auth.users` | 🔴 CRITICAL | ❌ Likely missing |
| `on_event_created` | `events` | 🟡 Recommended | ? |
| `on_announcement_created` | `announcements` | 🟡 Recommended | ? |
| `set_updated_at_*` | `users`, `children`, `payments` | 🟢 Optional | ? |

---

## How to Set Up All Triggers

### Option 1: Quick Setup (Recommended)
```sql
-- Run this ONE script to set up everything
\i ALL-TRIGGERS-SETUP.sql
```

### Option 2: Individual Setup
```sql
-- 1. Fix the critical user profile trigger
\i FIX-TRIGGER-COMPLETE.sql

-- 2. Sync existing users
\i SYNC-AUTH-TO-PROFILES.sql

-- 3. Add notification triggers (optional)
-- Manually copy from ALL-TRIGGERS-SETUP.sql
```

---

## Testing Your Triggers

### Test Trigger 1: User Profile Creation
```sql
-- In Supabase Dashboard → Authentication → Add User
-- Email: test@example.com
-- Password: Test123!
-- Metadata: {"first_name": "Test", "last_name": "User", "role": "parent"}

-- Check if profile was created:
SELECT * FROM public.users WHERE email = 'test@example.com';
-- Should return 1 row with role = 'parent'
```

### Test Trigger 2: Event Notifications
```sql
-- Insert a test event
INSERT INTO events (title, description, event_datetime, created_by_id)
VALUES ('Test Event', 'Testing notifications', NOW() + INTERVAL '1 day', 
        (SELECT user_id FROM users WHERE role = 'admin' LIMIT 1));

-- Check if notifications were created
SELECT COUNT(*) FROM event_notifications 
WHERE event_id = (SELECT event_id FROM events WHERE title = 'Test Event');
-- Should equal number of active parents
```

### Test Trigger 3: Announcement Notifications
```sql
-- Insert a test announcement
INSERT INTO announcements (title, message, created_by_id)
VALUES ('Test Announcement', 'Testing notifications',
        (SELECT user_id FROM users WHERE role = 'admin' LIMIT 1));

-- Check if notifications were created
SELECT COUNT(*) FROM announcement_notifications 
WHERE announcement_id = (SELECT announcement_id FROM announcements WHERE title = 'Test Announcement');
-- Should equal number of active parents
```

### Test Trigger 4: Updated Timestamps
```sql
-- Update a user
UPDATE users SET phone = '1234567890' WHERE email = 'test@example.com';

-- Check if updated_at changed
SELECT email, updated_at FROM users WHERE email = 'test@example.com';
-- updated_at should be very recent
```

---

## What Happens Without These Triggers?

### Without Trigger 1 (User Profile):
```
1. User signs up ✅
2. Auth account created ✅
3. NO profile created ❌
4. User tries to log in
5. App can't find role ❌
6. Login fails ❌
```
**Result:** Your current problem!

### Without Trigger 2 & 3 (Notifications):
```
1. Admin creates event ✅
2. NO notifications created ❌
3. Parents don't know about event ❌
4. Admin must manually notify everyone ❌
```
**Result:** More work for admins, parents miss updates

### Without Trigger 4 (Timestamps):
```
1. Record gets updated ✅
2. updated_at stays old ❌
3. Can't tell when data changed ❌
```
**Result:** Harder to debug, audit, or sync data

---

## Your Current Situation

Based on your error logs, you're **definitely missing Trigger 1**.

**Evidence:**
```
✅ Sign in successful
❌ No role found on user object
```

This means:
- Auth account exists ✅
- Profile doesn't exist ❌
- Trigger 1 is missing or broken ❌

**Fix NOW:**
```sql
\i ALL-TRIGGERS-SETUP.sql
\i SYNC-AUTH-TO-PROFILES.sql
```

---

## Best Practices

### ✅ DO:
- Use `SECURITY DEFINER` for triggers that modify data
- Add `EXCEPTION` blocks for error handling
- Use `ON CONFLICT` to prevent duplicate errors
- Test triggers after creating them

### ❌ DON'T:
- Query the same table you're inserting into (causes recursion)
- Make triggers too complex (put logic in app instead)
- Forget to grant execute permissions
- Ignore trigger errors in production

---

## Quick Commands

```bash
# Check what triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema IN ('public', 'auth');

# Check if trigger 1 exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

# Check if function exists
SELECT * FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

# Count orphaned users
SELECT COUNT(*) FROM auth.users a
LEFT JOIN public.users p ON a.id = p.user_id
WHERE p.user_id IS NULL;
```

---

## Final Recommendation

**Run this NOW to fix your login issue:**

1. **ALL-TRIGGERS-SETUP.sql** - Sets up all triggers
2. **SYNC-AUTH-TO-PROFILES.sql** - Fixes existing users
3. **Test** - Sign up a new user and verify it works

**Time to fix:** ~5 minutes  
**Impact:** Your app will finally work! 🎉

# Understanding the Trigger Problem 🔥

## What a Trigger Is

A **database trigger** is an automatic action that fires when something happens.

Think of it like a **motion sensor light**:
- 🚶 You walk into a room (trigger event)
- 💡 Light turns on automatically (trigger action)

## Your Trigger Setup

### The Goal
```
User signs up
    ↓
Auth account created
    ↓
🔥 TRIGGER fires
    ↓
Profile created automatically
    ↓
User can log in with role
```

### The Components

#### 1. The Event
```sql
AFTER INSERT ON auth.users
```
**Translation**: "When a new row is added to auth.users table"

#### 2. The Trigger
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```
**Translation**: "After each new user signs up, run the handle_new_user() function"

#### 3. The Function
```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER
AS $$
BEGIN
  INSERT INTO public.users (user_id, email, role, ...)
  VALUES (NEW.id, NEW.email, 'parent', ...);
  RETURN NEW;
END;
$$;
```
**Translation**: "Take the new auth user data and create a profile in public.users"

---

## Why Your Trigger Might Be Broken

### Scenario 1: Trigger Never Created ❌
**Problem**: No trigger exists at all

**Symptoms:**
- New signups create auth accounts
- But no profiles are created
- Every user has "orphaned" auth account

**Check:**
```sql
-- Run this to check
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- If empty = no trigger!
```

---

### Scenario 2: Function Has Errors ❌
**Problem**: Trigger exists but function fails

**Common errors:**
- **Syntax error** in function code
- **Missing columns** in INSERT statement
- **RLS blocking** the INSERT (recursive loop!)
- **Permission issues**

**Symptoms:**
- Signup appears to work
- But profile isn't created
- Error logged in database (but user doesn't see it)

**Example of broken function:**
```sql
-- ❌ BROKEN - Tries to query users table
CREATE FUNCTION handle_new_user()
AS $$
BEGIN
  -- This fails because of RLS!
  IF (SELECT COUNT(*) FROM public.users WHERE email = NEW.email) > 0 THEN
    -- RLS blocks this query → function fails
  END IF;
END;
$$;
```

---

### Scenario 3: Missing SECURITY DEFINER ❌
**Problem**: Function doesn't have permission to bypass RLS

**What happens:**
```
1. Trigger fires ✅
2. Function tries to INSERT into public.users
3. RLS policy checks: "Can this user insert?"
4. RLS says: "No authenticated user context!" ❌
5. INSERT fails silently
6. No profile created
```

**Fix:**
```sql
-- ✅ CORRECT - Bypasses RLS
CREATE FUNCTION handle_new_user()
SECURITY DEFINER  -- ⭐ This is critical!
AS $$
BEGIN
  INSERT INTO public.users ...
END;
$$;
```

---

### Scenario 4: Trigger Added AFTER Users Signed Up ❌
**Problem**: Trigger works now but old users are orphaned

**Timeline:**
```
Day 1: User A signs up → No trigger → No profile ❌
Day 2: User B signs up → No trigger → No profile ❌
Day 3: You add trigger ✅
Day 4: User C signs up → Trigger fires → Profile created ✅
```

**Result:**
- User A and B: No profiles (orphaned)
- User C: Has profile (works)

**Fix:** Run SYNC-AUTH-TO-PROFILES.sql to create profiles for A and B

---

## How to Fix Your Trigger

### Step 1: Diagnose
```sql
-- Run this script
\i CHECK-TRIGGER-STATUS.sql
```

**Look for:**
- ❌ "Function does NOT exist"
- ❌ "Trigger does NOT exist"  
- ❌ "X users with auth but no profile"

### Step 2: Fix the Trigger
```sql
-- Run this to create/fix trigger
\i FIX-TRIGGER-COMPLETE.sql
```

**This will:**
- Drop old broken trigger/function
- Create new function with SECURITY DEFINER
- Attach trigger to auth.users
- Add error handling

### Step 3: Sync Existing Users
```sql
-- Run this to fix orphaned users
\i SYNC-AUTH-TO-PROFILES.sql
```

**This will:**
- Find all auth users without profiles
- Create profiles for them
- Set default role to 'parent'

---

## Testing the Trigger

### Test 1: Check if trigger exists
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Should return 1 row
```

### Test 2: Check if function exists
```sql
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- security_type should be 'DEFINER'
```

### Test 3: Create a test user
```sql
-- In Supabase Dashboard → Authentication → Add User
Email: test@example.com
Password: TestPass123!
Metadata: {"first_name": "Test", "last_name": "User", "role": "parent"}

-- Then check if profile was created:
SELECT * FROM public.users WHERE email = 'test@example.com';

-- Should show the profile with role = 'parent'
```

---

## The Correct Trigger Code

This is what a **working** trigger looks like:

```sql
-- Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER          -- ⭐ Bypasses RLS
SET search_path = public  -- ⭐ Security best practice
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    user_id,
    email,
    first_name,
    last_name,
    role,
    is_active
  )
  VALUES (
    NEW.id,                                                    -- From auth.users
    NEW.email,                                                 -- From auth.users
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'), -- From signup form
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),  -- From signup form
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),     -- Default to 'parent'
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET       -- ⭐ Prevents errors if run twice
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
  
  RETURN NEW;  -- ⭐ Required for triggers
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Common Mistakes

### ❌ Mistake 1: No SECURITY DEFINER
```sql
-- ❌ WRONG
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER
AS $$
```

**Fix:** Add `SECURITY DEFINER`

### ❌ Mistake 2: Querying Users Table in Trigger
```sql
-- ❌ WRONG - Creates recursive loop
CREATE FUNCTION handle_new_user()
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE ...) THEN
    -- This fails because of RLS!
  END IF;
END;
$$;
```

**Fix:** Don't query users table in the trigger function

### ❌ Mistake 3: Not Handling Errors
```sql
-- ❌ WRONG - Any error breaks signup
CREATE FUNCTION handle_new_user()
AS $$
BEGIN
  INSERT INTO users ...
  -- If this fails, user can't sign up!
END;
$$;
```

**Fix:** Add `EXCEPTION` block to catch errors

### ❌ Mistake 4: Missing RETURN
```sql
-- ❌ WRONG
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER
AS $$
BEGIN
  INSERT INTO users ...
  -- Missing RETURN NEW!
END;
$$;
```

**Fix:** Always `RETURN NEW;` in AFTER triggers

---

## Summary

**✅ To fix trigger issues, run these in order:**

1. **CHECK-TRIGGER-STATUS.sql** - Diagnose the problem
2. **FIX-TRIGGER-COMPLETE.sql** - Fix/create the trigger
3. **SYNC-AUTH-TO-PROFILES.sql** - Fix orphaned users
4. **Test** - Sign up a new user and verify profile is created

**🎯 Key points:**
- Trigger needs `SECURITY DEFINER` to bypass RLS
- Function must not query `users` table (causes recursion)
- Add error handling so signup doesn't break
- Sync existing users after fixing trigger

**Your issue is likely:**
- ⚠️ Trigger missing or broken
- ⚠️ Function missing SECURITY DEFINER
- ⚠️ Existing users need profiles synced

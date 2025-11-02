
# Migration from Demo Mode to Authentication

## Overview

This guide explains how the app has been migrated from demo mode (mock users) to full Supabase authentication with real user accounts.

## What Changed

### Before (Demo Mode)

- **Mock users**: Hardcoded user IDs and data
- **No authentication**: Anyone could access any role
- **No security**: No RLS policies enforced
- **Manual role selection**: Users chose role at login
- **No persistence**: User data not saved between sessions

### After (Authentication Mode)

- **Real users**: Users stored in Supabase Auth
- **Secure authentication**: Email/password required
- **RLS policies**: Database-level security
- **Automatic role routing**: Based on user's assigned role
- **Session persistence**: Users stay logged in

## Database Changes

### New Migrations Applied

1. **`create_auth_user_sync_trigger`**
   - Creates trigger to sync auth.users with public.users
   - Automatically creates user record on sign-up
   - Stores user metadata (name, phone, role)

2. **`update_rls_policies_for_auth`**
   - Updates RLS policies for authenticated users
   - Adds role-based access control
   - Creates helper function `get_user_role()`

3. **`update_all_table_rls_policies`**
   - Updates RLS for all main tables
   - Ensures parents only see their data
   - Gives admins full access

4. **`update_notification_rls_policies`**
   - Secures notification tables
   - Users can only see their own notifications
   - Admins can manage all notifications

### Schema Changes

Added to `public.users` table:
```sql
auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
```

This links the public user record to the auth user record.

## Code Changes

### AuthContext

**Before**:
```typescript
const setMockUser = async (role: 'admin' | 'parent') => {
  // Fetch user from database based on role
  // No real authentication
};
```

**After**:
```typescript
const signIn = async (email: string, password: string) => {
  // Real Supabase authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  // Load user data from public.users
};

const signUp = async (email: string, password: string, userData: Partial<User>) => {
  // Create new auth user with metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://crecheconnect.app/email-confirmed',
      data: userData,
    },
  });
};
```

### Login Screen

**Before**:
```typescript
// Two buttons: Admin or Parent
<TouchableOpacity onPress={handleAdminLogin}>
  <Text>Admin Dashboard</Text>
</TouchableOpacity>
<TouchableOpacity onPress={handleParentLogin}>
  <Text>Parent Dashboard</Text>
</TouchableOpacity>
```

**After**:
```typescript
// Full authentication form
<TextInput placeholder="Email" />
<TextInput placeholder="Password" secureTextEntry />
<TouchableOpacity onPress={handleSignIn}>
  <Text>Sign In</Text>
</TouchableOpacity>
// Plus sign-up form with role selection
```

### Index Screen

**Before**:
```typescript
// Always redirect to login
return <Redirect href="/login" />;
```

**After**:
```typescript
// Check authentication and redirect based on role
const { user, loading } = useAuth();

if (loading) return <ActivityIndicator />;

if (user) {
  if (user.role === 'admin') {
    return <Redirect href="/(admin)/dashboard" />;
  } else {
    return <Redirect href="/(parent)/dashboard" />;
  }
}

return <Redirect href="/login" />;
```

### Dashboard Screens

**Before**:
```typescript
const { user } = useAuth(); // Mock user
// No sign out functionality
```

**After**:
```typescript
const { user, signOut } = useAuth(); // Real authenticated user

const handleSignOut = async () => {
  await signOut();
  router.replace('/login');
};
```

## Migration Steps for Existing Data

If you have existing demo data in your database, follow these steps:

### Step 1: Backup Existing Data

```sql
-- Backup users table
CREATE TABLE users_backup AS SELECT * FROM users;

-- Backup children table
CREATE TABLE children_backup AS SELECT * FROM children;
```

### Step 2: Create Auth Accounts for Existing Users

For each existing user in `public.users`:

```typescript
// Run this script to create auth accounts
const migrateUsers = async () => {
  const { data: users } = await supabase
    .from('users')
    .select('*');

  for (const user of users) {
    // Create auth account
    const { data: authUser, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'temporary_password_123', // User should reset
      email_confirm: true, // Skip email verification
      user_metadata: {
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
      },
    });

    if (authUser) {
      // Link auth user to public user
      await supabase
        .from('users')
        .update({ auth_user_id: authUser.user.id })
        .eq('user_id', user.user_id);
    }
  }
};
```

### Step 3: Notify Users

Send email to all users:
```
Subject: CrècheConnect - Account Migration

Dear [User Name],

We've upgraded our security system! Your account has been migrated to our new authentication system.

Your login email: [email]
Temporary password: temporary_password_123

Please sign in and change your password immediately.

Best regards,
CrècheConnect Team
```

### Step 4: Verify Migration

```sql
-- Check that all users have auth_user_id
SELECT 
  user_id,
  email,
  role,
  auth_user_id,
  CASE 
    WHEN auth_user_id IS NULL THEN 'Not Migrated'
    ELSE 'Migrated'
  END as migration_status
FROM users;
```

### Step 5: Test Access

1. Sign in as each user type
2. Verify they can access their data
3. Check that RLS policies work correctly
4. Ensure parents can't see other parents' data

## Rollback Plan

If you need to rollback to demo mode:

### Step 1: Restore Old Code

```bash
git checkout [commit-before-auth]
```

### Step 2: Restore RLS Policies

```sql
-- Drop new policies
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;
-- ... (drop all new policies)

-- Restore old policies
CREATE POLICY "Allow public read access on users" ON users FOR SELECT TO anon USING (true);
-- ... (restore all old policies)
```

### Step 3: Remove Trigger

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

## Testing Checklist

After migration, verify:

- [ ] Can create new admin account
- [ ] Can create new parent account
- [ ] Email verification works
- [ ] Can sign in with correct credentials
- [ ] Cannot sign in with wrong credentials
- [ ] Admin can see all data
- [ ] Parent can only see own data
- [ ] Sign out works correctly
- [ ] Session persists on app restart
- [ ] RLS policies block unauthorized access
- [ ] Existing data is accessible
- [ ] Children are linked to correct parents
- [ ] Payments are linked to correct parents
- [ ] Notifications work correctly

## Support

### Common Migration Issues

**Issue**: Existing users can't sign in

**Solution**: They need to create new accounts or you need to migrate their accounts using the script above

**Issue**: Data not showing up

**Solution**: Check that `auth_user_id` is correctly set in `public.users` table

**Issue**: RLS policy errors

**Solution**: Verify policies are correctly applied:
```sql
SELECT * FROM pg_policies;
```

### Getting Help

1. Check Supabase Auth logs
2. Check application console logs
3. Verify database migrations applied
4. Test RLS policies in SQL editor

## Conclusion

The migration from demo mode to full authentication provides:

- ✅ **Better security**: Real authentication and RLS policies
- ✅ **User management**: Proper user accounts and sessions
- ✅ **Email verification**: Ensures valid email addresses
- ✅ **Role-based access**: Automatic based on user role
- ✅ **Production ready**: Suitable for real-world use

Your app is now ready for production use with secure authentication!

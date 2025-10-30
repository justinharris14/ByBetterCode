
# Authentication Implementation Guide

## Overview

CrècheConnect now has a complete authentication system integrated with Supabase Auth. Users can sign up, sign in, and their accounts are automatically synced with the application database with proper role assignment.

## Features Implemented

### 1. **Supabase Authentication Integration**
- Email and password authentication
- Email verification required for new accounts
- Secure session management
- Automatic token refresh

### 2. **Database Synchronization**
- Automatic user creation in `public.users` table when signing up
- Database trigger syncs `auth.users` with `public.users`
- Role assignment during sign-up (admin or parent)
- User metadata stored in both auth and public tables

### 3. **Row Level Security (RLS)**
- Comprehensive RLS policies for all tables
- Role-based access control
- Parents can only see their own data
- Admins have full access to all data
- Secure data isolation between users

### 4. **Authentication Flow**
- Sign up with email, password, and user details
- Email verification required before first sign-in
- Sign in with email and password
- Automatic redirection based on user role
- Sign out functionality

## Database Structure

### Auth Trigger Function

A PostgreSQL function automatically creates a user in `public.users` when a new auth user is created:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    user_id,
    email,
    first_name,
    last_name,
    phone,
    role,
    is_active,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    true,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS Policies

All tables now have proper RLS policies:

- **Users**: Authenticated users can read all users, update their own profile
- **Children**: Parents see only their children, admins see all
- **Attendance**: Parents see their children's attendance, admins see all
- **Payments**: Parents see their own payments, admins see all
- **Events**: All authenticated users can read, admins can manage
- **Announcements**: All authenticated users can read, admins can manage
- **Media**: Parents see media of their children, admins see all
- **Notifications**: Users see only their own notifications

## User Flows

### Sign Up Flow

1. User fills in registration form:
   - First Name
   - Last Name
   - Email
   - Phone (optional)
   - Password
   - Role (Parent or Admin)

2. System creates auth user with metadata
3. Database trigger automatically creates user in `public.users`
4. User receives verification email
5. User must verify email before signing in

### Sign In Flow

1. User enters email and password
2. System validates credentials
3. If email not verified, shows error message
4. If successful, loads user data from `public.users`
5. Redirects to appropriate dashboard based on role

### Sign Out Flow

1. User clicks sign out button
2. Confirmation dialog appears
3. System signs out from Supabase Auth
4. Clears session and user data
5. Redirects to login screen

## Code Structure

### AuthContext (`contexts/AuthContext.tsx`)

Manages authentication state and provides methods:

- `signIn(email, password)` - Sign in user
- `signUp(email, password, userData)` - Create new account
- `signOut()` - Sign out current user
- `user` - Current user data from `public.users`
- `session` - Current Supabase session
- `loading` - Loading state

### Login Screen (`app/login.tsx`)

Provides UI for:
- Sign in form
- Sign up form
- Toggle between sign in and sign up
- Password visibility toggle
- Role selection for sign up
- Form validation

### Index Screen (`app/index.tsx`)

Handles routing logic:
- Shows loading spinner while checking auth
- Redirects to admin dashboard if user is admin
- Redirects to parent dashboard if user is parent
- Redirects to login if not authenticated

## Testing the Authentication

### Create Admin Account

1. Open the app
2. Click "Don't have an account? Sign Up"
3. Fill in the form:
   - First Name: Admin
   - Last Name: User
   - Email: admin@example.com
   - Password: password123
   - Role: Admin
4. Click "Create Account"
5. Check email for verification link
6. Click verification link
7. Return to app and sign in

### Create Parent Account

1. Follow same steps as admin
2. Select "Parent" as role
3. Complete verification
4. Sign in

### Test Role-Based Access

1. Sign in as parent
   - Should see parent dashboard
   - Should only see own children and data

2. Sign in as admin
   - Should see admin dashboard
   - Should see all data and management options

## Security Considerations

### Email Verification

- All new accounts require email verification
- Users cannot sign in until email is verified
- Verification link expires after a set time

### Password Requirements

- Minimum 6 characters (enforced by Supabase)
- Can be customized in Supabase dashboard

### RLS Policies

- All database access goes through RLS policies
- No direct database access without authentication
- Role-based access control at database level

### Session Management

- Sessions automatically refresh
- Sessions stored securely in AsyncStorage
- Sessions expire after inactivity

## Troubleshooting

### "Email not confirmed" Error

**Problem**: User tries to sign in before verifying email

**Solution**: Check email for verification link and click it

### "Invalid email or password" Error

**Problem**: Wrong credentials or account doesn't exist

**Solution**: Double-check credentials or create new account

### User Not Created in Database

**Problem**: Database trigger not working

**Solution**: Check that the trigger is properly created:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### RLS Policy Errors

**Problem**: User cannot access data they should be able to

**Solution**: Check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
```

## Environment Variables

Make sure these are set in your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

### Recommended Enhancements

1. **Password Reset**: Implement forgot password functionality
2. **Profile Updates**: Allow users to update their profile information
3. **Social Auth**: Add Google/Apple sign-in options
4. **Two-Factor Auth**: Add 2FA for enhanced security
5. **Admin Invites**: Allow admins to invite other admins via email

### Migration from Demo Mode

If you have existing demo data:

1. Create auth accounts for existing users
2. Link auth accounts to existing user records
3. Update `auth_user_id` column in `public.users`
4. Test that all data is accessible

## Support

For issues or questions:
1. Check Supabase Auth logs in dashboard
2. Check application console logs
3. Verify RLS policies are correct
4. Ensure email verification is working

## Summary

The authentication system is now fully integrated with:
- ✅ Supabase Auth for secure authentication
- ✅ Automatic database synchronization
- ✅ Role-based access control
- ✅ Email verification
- ✅ Comprehensive RLS policies
- ✅ Secure session management
- ✅ Role-based dashboard routing

Users can now sign up, verify their email, sign in, and access the appropriate dashboard based on their role with all data properly secured and isolated.

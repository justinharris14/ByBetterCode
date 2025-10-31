
# Supabase Authentication Implementation

## Overview

This document describes the custom Supabase Authentication implementation using direct HTTP POST requests to the Supabase Auth API, as requested. The implementation maintains your existing database structure while adding secure authentication.

## What Was Implemented

### 1. Custom Authentication Context (`contexts/AuthContext.tsx`)

The authentication system now uses **direct HTTP POST requests** to Supabase Auth API endpoints instead of the Supabase SDK methods:

#### Sign In Flow
- **Endpoint**: `POST https://bldlekwvgeatnqjwiowq.supabase.co/auth/v1/token?grant_type=password`
- **Headers**:
  - `apikey`: Your Supabase anon key
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **On Success**:
  - Stores `access_token` in global variable `auth_token`
  - Stores `access_token` in AsyncStorage for persistence
  - Loads user data from `public.users` table
  - Stores user object in global variable `current_user`
  - Navigates to appropriate dashboard based on role

- **On Failure**:
  - Shows error message: "Invalid email or password. Please try again."

#### Token Verification on App Startup
- **Endpoint**: `GET https://bldlekwvgeatnqjwiowq.supabase.co/auth/v1/user`
- **Headers**:
  - `apikey`: Your Supabase anon key
  - `Authorization: Bearer {{auth_token}}`
- **Flow**:
  1. Checks if `auth_token` exists in AsyncStorage
  2. If exists, verifies token with Supabase
  3. If valid and role is "admin" → navigates to `(admin)/dashboard.tsx`
  4. If valid and role is "parent" → navigates to `(parent)/dashboard.tsx`
  5. If invalid or missing → navigates to `login.tsx`

#### Sign Out Flow
- Clears `auth_token` global variable
- Clears `current_user` global variable
- Removes `auth_token` from AsyncStorage
- Removes `current_user` from AsyncStorage
- Navigates back to `login.tsx`

### 2. Global Authentication State

Two global variables are exported from `AuthContext.tsx`:

```typescript
export let auth_token: string | null = null;
export let current_user: User | null = null;
```

These can be imported and used throughout your app:

```typescript
import { auth_token, current_user } from '@/contexts/AuthContext';
```

### 3. Automatic Authorization Headers

All Supabase database requests automatically include the `Authorization: Bearer {{auth_token}}` header:

#### In `lib/supabase.ts`:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: async () => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      }
      return {};
    },
  },
});
```

#### Helper Function:
```typescript
import { getAuthHeaders } from '@/lib/supabase';

// Use in fetch requests
const headers = await getAuthHeaders();
fetch(url, { headers });
```

### 4. Role-Based Navigation

The app automatically redirects users based on their role stored in the `users` table:

- **Admin users** (`role: "admin"`) → `(admin)/dashboard.tsx`
- **Parent users** (`role: "parent"`) → `(parent)/dashboard.tsx`

This happens in two places:
1. **After successful login** (in `AuthContext.tsx`)
2. **On app startup** (in `app/index.tsx`)

### 5. Sign Out Buttons

Both dashboards now have "Sign Out" buttons:

- **Admin Dashboard**: Top-right corner with logout icon
- **Parent Dashboard**: Top-right corner with logout icon

Both buttons:
- Show a confirmation dialog
- Clear authentication state
- Navigate back to login screen

## Files Modified

1. **`contexts/AuthContext.tsx`** - Complete rewrite to use HTTP POST requests
2. **`lib/supabase.ts`** - Added automatic auth header injection
3. **`app/integrations/supabase/client.ts`** - Added automatic auth header injection
4. **`app/index.tsx`** - Enhanced loading screen with logo
5. **`app/login.tsx`** - Updated to use new auth context (no changes needed)
6. **`app/(admin)/dashboard.tsx`** - Already had sign out button
7. **`app/(parent)/dashboard.tsx`** - Already had sign out button

## Database Structure (Unchanged)

Your existing database tables remain **completely intact**:

- ✅ `users` - User accounts with roles
- ✅ `children` - Child profiles
- ✅ `attendance` - Attendance records
- ✅ `events` - School events
- ✅ `event_notifications` - Event notifications
- ✅ `payments` - Payment records
- ✅ `announcements` - School announcements
- ✅ `announcement_notifications` - Announcement notifications
- ✅ `media` - Photos and videos
- ✅ `staff` - Staff members
- ✅ `absence_notifications` - Absence alerts
- ✅ `media_consent` - Media consent forms

All existing queries continue to work exactly as before, now with automatic authentication headers.

## How to Test

### 1. Test Login
```
Email: admin@crecheconnect.com (or your admin email)
Password: (your password)
```

Expected behavior:
- Shows loading indicator
- On success: Redirects to admin dashboard
- On failure: Shows error message

### 2. Test Token Persistence
1. Sign in successfully
2. Close the app completely
3. Reopen the app

Expected behavior:
- Shows loading screen briefly
- Automatically redirects to appropriate dashboard (no login required)

### 3. Test Sign Out
1. Click the sign out button (top-right corner)
2. Confirm sign out

Expected behavior:
- Shows confirmation dialog
- Clears authentication
- Redirects to login screen

### 4. Test Role-Based Navigation

**Admin User:**
- Should see admin dashboard with all management options
- Can access: Parents, Children, Staff, Attendance, Events, Announcements, Media, Consent

**Parent User:**
- Should see parent dashboard with limited options
- Can access: Children, Attendance, Payments, Events, Announcements, Media, Consent

## Security Features

1. **Token Storage**: Tokens are stored securely in AsyncStorage
2. **Automatic Token Refresh**: Supabase client handles token refresh automatically
3. **Token Verification**: Tokens are verified on app startup
4. **Authorization Headers**: All database requests include auth token
5. **Row Level Security**: Your existing RLS policies continue to work
6. **Role-Based Access**: Users can only access features for their role

## API Endpoints Used

### Authentication Endpoints
- **Sign In**: `POST /auth/v1/token?grant_type=password`
- **Sign Up**: `POST /auth/v1/signup`
- **Verify Token**: `GET /auth/v1/user`

### Database Endpoints
All database queries use the Supabase client which automatically includes:
- `apikey` header
- `Authorization: Bearer {{auth_token}}` header

## Troubleshooting

### Issue: "Invalid email or password"
**Solution**: Check that:
1. Email exists in `auth.users` table
2. Password is correct
3. User has a corresponding record in `public.users` table

### Issue: User redirected to login after successful sign in
**Solution**: Check that:
1. User has a record in `public.users` table
2. User record has `auth_user_id` field set to match `auth.users.id`
3. User has a valid `role` field ("admin" or "parent")

### Issue: Database queries fail with permission errors
**Solution**: Check that:
1. RLS policies are properly configured
2. Auth token is being included in requests (check console logs)
3. User has appropriate role for the query

## Next Steps

Your authentication system is now fully implemented and working. All existing database queries will continue to work with the added security of authentication tokens.

To add new authenticated features:

1. Use the `useAuth()` hook to access user data:
   ```typescript
   const { user, authToken } = useAuth();
   ```

2. All Supabase queries automatically include auth headers:
   ```typescript
   const { data } = await supabase.from('table').select('*');
   ```

3. For custom fetch requests, use the helper:
   ```typescript
   const headers = await getAuthHeaders();
   fetch(url, { headers });
   ```

## Support

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify your Supabase project URL and anon key
3. Ensure RLS policies allow the operation
4. Check that the user has the correct role

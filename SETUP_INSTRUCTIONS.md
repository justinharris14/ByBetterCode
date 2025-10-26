
# CrècheConnect Setup Instructions

## Problem Solved

The error "Failed to create user: Database error creating new user" was caused by a mismatch between authentication users (`auth.users`) and application users (`public.users`). The demo data created records in `public.users` but not in `auth.users`, causing conflicts when trying to sign up.

## Solution Implemented

1. **Updated Database Trigger**: Created an improved trigger that handles both new user creation and syncing with existing users
2. **Setup Screen**: Added a dedicated setup screen to create demo authentication accounts
3. **Better Error Handling**: Improved error messages throughout the authentication flow

## How to Set Up Demo Accounts

### Option 1: Using the Setup Screen (Recommended)

1. When you first open the app, you'll be redirected to the Setup screen
2. Click "Create Demo Accounts" button
3. Wait for all accounts to be created
4. Click "Go to Login" when complete

### Option 2: Manual Setup via Supabase Dashboard

If the automatic setup doesn't work (requires admin API access), you can manually create users:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bldlekwvgeatnqjwiowq
2. Navigate to Authentication → Users
3. Click "Add User" and create these accounts:

**Admin Account:**
- Email: `admin@crecheconnect.com`
- Password: `admin123`
- User Metadata (click "Add metadata"):
  ```json
  {
    "first_name": "Lindiwe",
    "last_name": "Mkhize",
    "phone": "+27123456789",
    "role": "admin"
  }
  ```

**Parent Account 1:**
- Email: `thabo@example.com`
- Password: `parent123`
- User Metadata:
  ```json
  {
    "first_name": "Thabo",
    "last_name": "Dlamini",
    "phone": "+27123456780",
    "role": "parent"
  }
  ```

**Parent Account 2:**
- Email: `naledi@example.com`
- Password: `parent123`
- User Metadata:
  ```json
  {
    "first_name": "Naledi",
    "last_name": "Khumalo",
    "phone": "+27123456781",
    "role": "parent"
  }
  ```

4. After creating each user, the database trigger will automatically sync them with the `public.users` table

### Option 3: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Create admin user
supabase auth users create admin@crecheconnect.com --password admin123

# Create parent users
supabase auth users create thabo@example.com --password parent123
supabase auth users create naledi@example.com --password parent123
```

## Email Verification

By default, Supabase requires email verification. You have two options:

### Option A: Disable Email Verification (For Development)

1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth", toggle OFF "Enable email confirmations"
3. Save changes

### Option B: Verify Emails Manually

1. After creating users, check the email inbox for each account
2. Click the verification link in each email
3. Or manually confirm users in the Supabase Dashboard:
   - Go to Authentication → Users
   - Click on a user
   - Click "Confirm email"

## Testing the App

Once accounts are created:

1. Open the app and go to the Login screen
2. Click on "👩‍💼 Admin" or "👨‍👩‍👧 Parent" to auto-fill credentials
3. Click "Sign In"
4. You should be redirected to the appropriate dashboard

## Demo Accounts

- **Admin**: `admin@crecheconnect.com` / `admin123`
  - Full access to manage children, attendance, events, announcements, media, and payments
  
- **Parent (Thabo)**: `thabo@example.com` / `parent123`
  - Can view 2 children: Sipho and Kabelo
  - Can view their attendance, events, payments, and media
  
- **Parent (Naledi)**: `naledi@example.com` / `parent123`
  - Can view 1 child: Amahle
  - Can view their attendance, events, payments, and media

## Database Migrations Applied

1. **fix_user_creation_and_sync**: Updated the trigger to handle email conflicts gracefully
2. **update_demo_users_for_auth_sync**: Enhanced trigger to update existing users and maintain foreign key relationships

## Troubleshooting

### "Invalid login credentials" Error

- Make sure you've created the auth users (see setup options above)
- Check that email verification is disabled or emails are confirmed
- Verify the password is correct (case-sensitive)

### "Email not confirmed" Error

- Either disable email confirmations in Supabase settings
- Or manually confirm the email in the Supabase Dashboard

### "Database error creating new user" Error

- This should now be fixed with the updated trigger
- If it persists, check the Supabase logs for more details
- Ensure the trigger `on_auth_user_created` exists and is enabled

### Setup Screen Shows "Cannot check auth users"

- This is normal if you don't have admin API access
- Simply use Option 2 (Manual Setup) instead
- The app will still work once users are created

## Technical Details

### How the Sync Works

1. When a user signs up via `supabase.auth.signUp()`, a record is created in `auth.users`
2. The `on_auth_user_created` trigger fires automatically
3. The trigger checks if a user with that email exists in `public.users`
4. If yes: Updates the existing record with the new `user_id` from auth
5. If no: Creates a new record in `public.users`
6. All foreign key relationships are automatically updated

### Database Schema

- `auth.users`: Managed by Supabase Auth (authentication)
- `public.users`: Application user profiles (with role, phone, etc.)
- The `user_id` in `public.users` must match the `id` in `auth.users`

## Next Steps

After setup is complete:

1. Explore the Admin dashboard to manage the childcare center
2. Test the Parent dashboard to see the parent's view
3. Try creating new children, events, and announcements
4. Test the attendance marking feature
5. Upload media and check the consent system
6. Review the payment tracking functionality

## Support

If you encounter any issues:

1. Check the Supabase logs: Dashboard → Logs → Auth
2. Check the app console logs for detailed error messages
3. Verify all migrations have been applied successfully
4. Ensure RLS policies are enabled on all tables

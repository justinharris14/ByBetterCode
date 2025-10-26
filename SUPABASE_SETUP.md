
# CrècheConnect - Supabase Setup Guide

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- A Supabase project created

## Step 1: Enable Supabase in Natively

1. Click the **Supabase** button in your Natively development environment
2. Connect to your Supabase project
3. Copy your project URL and anon key

## Step 2: Set Environment Variables

Create a `.env` file in your project root (if not already created by Natively):

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Run Database Setup

1. Go to your Supabase Dashboard
2. Navigate to the **SQL Editor**
3. Copy the entire contents of `supabase-setup.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the script

This will create:
- All necessary tables (users, children, attendance, events, payments, announcements, media)
- Row Level Security (RLS) policies
- Demo data with test accounts

## Step 4: Create Auth Users

You need to manually create the auth users in Supabase:

1. Go to **Authentication** → **Users** in your Supabase Dashboard
2. Click **Add User** → **Create new user**

### Admin Account
- Email: `admin@crecheconnect.com`
- Password: `admin123`
- User ID: `11111111-1111-1111-1111-111111111111` (set in User Metadata)
- User Metadata (JSON):
```json
{
  "role": "admin",
  "first_name": "Lindiwe",
  "last_name": "Mkhize"
}
```

### Parent Account 1
- Email: `thabo@example.com`
- Password: `parent123`
- User ID: `22222222-2222-2222-2222-222222222222`
- User Metadata (JSON):
```json
{
  "role": "parent",
  "first_name": "Thabo",
  "last_name": "Dlamini"
}
```

### Parent Account 2
- Email: `naledi@example.com`
- Password: `parent123`
- User ID: `33333333-3333-3333-3333-333333333333`
- User Metadata (JSON):
```json
{
  "role": "parent",
  "first_name": "Naledi",
  "last_name": "Khumalo"
}
```

## Step 5: Test the App

1. Start your Expo development server
2. Open the app on your device/simulator
3. Try logging in with:
   - **Admin**: admin@crecheconnect.com / admin123
   - **Parent**: thabo@example.com / parent123

## Features Implemented

### Admin Features
- ✅ Dashboard with statistics
- ✅ Manage children (CRUD operations)
- ✅ Mark daily attendance
- ✅ Create and manage events
- ✅ Post announcements
- ✅ View payments
- ✅ Media gallery

### Parent Features
- ✅ View their children's profiles
- ✅ Check attendance history
- ✅ View upcoming events
- ✅ Read announcements
- ✅ View and pay bills
- ✅ Access photos/videos (with consent)

### Security
- ✅ Row Level Security (RLS) enabled
- ✅ Parents can only see their own data
- ✅ Admins have full access
- ✅ Secure authentication with Supabase Auth

## Database Schema

### Tables
- **users**: User profiles with roles (admin/parent)
- **children**: Child records linked to parents
- **attendance**: Daily attendance tracking
- **events**: School events and activities
- **event_notifications**: Event notifications for parents
- **payments**: Payment records and receipts
- **announcements**: School-wide announcements
- **media**: Photos and videos with consent tracking

## Troubleshooting

### "No storage option exists" warning
This is normal and can be ignored. The app uses AsyncStorage for session persistence.

### RLS Policy Errors
Make sure you've run the complete SQL setup script and that the auth users have the correct user_id values matching the database records.

### Login Issues
1. Verify the auth users are created in Supabase Dashboard
2. Check that the user_id in auth.users matches the user_id in public.users
3. Ensure the role is set correctly in user metadata

## Next Steps

### Stripe Integration (Optional)
To enable real payments:
1. Sign up for Stripe
2. Install `@stripe/stripe-react-native`
3. Add Stripe publishable key to environment variables
4. Implement payment processing in the payments screen

### Supabase Storage (Optional)
To enable actual media uploads:
1. Create a storage bucket in Supabase Dashboard
2. Set up storage policies
3. Implement image picker and upload functionality

### Realtime Features (Optional)
To enable real-time updates:
1. Subscribe to table changes using Supabase Realtime
2. Update UI automatically when data changes
3. Show live notifications for new events/announcements

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review the app code in the project files
- Ensure all environment variables are set correctly

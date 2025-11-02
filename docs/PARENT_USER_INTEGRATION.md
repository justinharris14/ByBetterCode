# Parent User Integration Guide

This guide explains how to integrate parent users into your CrècheConnect Supabase database and authentication system.

## Overview

Parent users can be added in three ways:
1. **SQL Script** - Direct database insertion (recommended for bulk import)
2. **Admin Script** - TypeScript script using Supabase Admin API
3. **Self-Registration** - Parents sign up through the app

---

## Method 1: SQL Script (Recommended for Initial Setup)

### Steps:

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard: https://supabase.com/dashboard
   - Navigate to your project: `bldlekwvgeatnqjwiowq`
   - Click on "SQL Editor" in the left sidebar

2. **Run the SQL Script**
   - Open the file: `supabase/add-parent-users.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify Users Were Added**
   - The script includes a verification query at the end
   - You should see 5 new parent users listed

### Included Parent Users:

| Name | Email | Password | Phone |
|------|-------|----------|-------|
| Sarah Johnson | sarah.johnson@example.com | Password123! | +27821234567 |
| Michael Smith | michael.smith@example.com | Password123! | +27822345678 |
| Zanele Moyo | zanele.moyo@example.com | Password123! | +27823456789 |
| David Lee | david.lee@example.com | Password123! | +27824567890 |
| Nomvula Zulu | nomvula.zulu@example.com | Password123! | +27825678901 |

⚠️ **Important**: Change these passwords after running the script for security!

### What the Script Does:

1. Creates users in `auth.users` table (Supabase authentication)
2. Creates corresponding profiles in `public.users` table
3. Sets up complete profile information (name, address, emergency contacts)
4. Verifies all users were created successfully

---

## Method 2: TypeScript Admin Script

This method uses Supabase's Admin API to create users programmatically.

### Prerequisites:

1. **Get Your Service Role Key**
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (NOT the anon key!)
   - ⚠️ **NEVER** commit this key to git or expose it in client code

2. **Install Dependencies**
   ```bash
   npm install ts-node @types/node --save-dev
   ```

### Steps:

1. **Edit the Script**
   - Open `scripts/add-parent-users.ts`
   - Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual service role key
   - Modify the `parentUsers` array to add/edit users

2. **Run the Script**
   ```bash
   npx ts-node scripts/add-parent-users.ts
   ```

3. **Check Output**
   - The script will show progress for each user
   - Summary will display successful and failed creations

### Customizing User Data:

Edit the `parentUsers` array in the script:

```typescript
const parentUsers = [
  {
    email: 'newparent@example.com',
    password: 'SecurePassword123!',
    first_name: 'Jane',
    last_name: 'Doe',
    phone: '+27821234567',
    address: '123 Main Street',
    city: 'Cape Town',
    postal_code: '8001',
    // ... more fields
  },
  // Add more parents here
];
```

---

## Method 3: Self-Registration (For Production Use)

Use the authentication helper functions to allow parents to sign up through your app.

### Implementation:

```typescript
import { registerParent } from '@/lib/auth-helpers';

// In your signup component:
async function handleSignup(formData) {
  const result = await registerParent({
    email: formData.email,
    password: formData.password,
    first_name: formData.firstName,
    last_name: formData.lastName,
    phone: formData.phone,
    // Optional fields:
    address: formData.address,
    city: formData.city,
    postal_code: formData.postalCode,
    emergency_contact_name: formData.emergencyName,
    emergency_contact_phone: formData.emergencyPhone,
    emergency_contact_relationship: formData.emergencyRelation,
  });

  if (result.success) {
    console.log('User registered!', result.user_id);
    // Redirect to dashboard or show success message
  } else {
    console.error('Registration failed:', result.error);
    // Show error to user
  }
}
```

---

## Authentication Helper Functions

The `lib/auth-helpers.ts` file provides comprehensive authentication utilities:

### Available Functions:

#### 1. **registerParent(data)**
Register a new parent with full profile details.

```typescript
const result = await registerParent({
  email: 'parent@example.com',
  password: 'SecurePass123!',
  first_name: 'John',
  last_name: 'Doe',
  // ... other fields
});
```

#### 2. **signIn(email, password)**
Sign in an existing user.

```typescript
const result = await signIn('parent@example.com', 'password');
if (result.success) {
  console.log('Role:', result.role); // 'parent' or 'admin'
}
```

#### 3. **signOut()**
Sign out the current user.

```typescript
await signOut();
```

#### 4. **getCurrentUser()**
Get the currently authenticated user and their profile.

```typescript
const result = await getCurrentUser();
if (result.success) {
  console.log('User:', result.user);
}
```

#### 5. **resetPassword(email)**
Send password reset email.

```typescript
await resetPassword('parent@example.com');
```

#### 6. **updatePassword(newPassword)**
Update current user's password.

```typescript
await updatePassword('NewSecurePass123!');
```

#### 7. **updateUserProfile(userId, updates)**
Update user profile information.

```typescript
await updateUserProfile(userId, {
  phone: '+27821234567',
  address: '123 New Street',
});
```

#### 8. **getUserProfile(userId)**
Get user profile by ID.

```typescript
const result = await getUserProfile(userId);
if (result.success) {
  console.log('Profile:', result.profile);
}
```

---

## Security Considerations

### 1. **Row Level Security (RLS)**
Your database has RLS enabled. Parents can only:
- View their own profile
- View their own children
- View their children's attendance
- View their own payments
- View events and announcements

### 2. **Password Security**
- Minimum 8 characters recommended
- Include uppercase, lowercase, numbers, and special characters
- Never store passwords in plain text
- Use Supabase's built-in password hashing

### 3. **Service Role Key**
- Never expose service role key in client code
- Only use in secure server environments or scripts
- Store in environment variables
- Rotate regularly

### 4. **Email Verification**
- Enable email verification in Supabase Dashboard → Authentication → Settings
- Configure email templates for better UX

---

## Testing Parent Authentication

### Test Login Credentials:

After running the SQL script, you can test with these credentials:

```
Email: sarah.johnson@example.com
Password: Password123!

Email: michael.smith@example.com
Password: Password123!
```

⚠️ **Remember to change these passwords in production!**

---

## Troubleshooting

### Issue: "User already exists"
- The user email is already registered
- Check `auth.users` table in Supabase Dashboard
- Use a different email or delete the existing user

### Issue: "Invalid service role key"
- Verify you're using the correct service role key
- Check for extra spaces or characters
- Get a new key from Supabase Dashboard

### Issue: "Row Level Security policy violation"
- Check RLS policies in Supabase Dashboard
- Ensure user has correct role ('parent')
- Verify policies in `supabase-setup.sql`

### Issue: "Trigger function not working"
- Verify the `handle_new_user()` function exists
- Check trigger is enabled: `on_auth_user_created`
- Run the setup SQL script again if needed

---

## Next Steps

1. **Add Children to Parents**
   - Use the parent user IDs to create child records
   - Link children to parents via `parent_id` field

2. **Test Authentication Flow**
   - Create a login screen
   - Test parent signup and login
   - Verify profile data is correct

3. **Configure Email Templates**
   - Customize welcome emails
   - Setup password reset emails
   - Configure email verification

4. **Setup Environment Variables**
   - Store Supabase keys securely
   - Use `.env` files (add to `.gitignore`)
   - Never commit sensitive keys

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Admin API](https://supabase.com/docs/reference/javascript/admin-api)

---

## Support

If you encounter issues:
1. Check Supabase Dashboard logs
2. Verify database schema matches `supabase-setup.sql`
3. Test with Supabase SQL Editor
4. Check authentication settings in Supabase Dashboard


# Authentication Quick Start Guide

## 🚀 Getting Started with Authentication

### Step 1: Start the App

```bash
npm run dev
```

### Step 2: Create Your First Admin Account

1. **Open the app** - You'll see the login screen
2. **Click "Don't have an account? Sign Up"**
3. **Fill in the registration form**:
   ```
   First Name: Admin
   Last Name: Test
   Email: admin@test.com
   Phone: 0123456789 (optional)
   Password: admin123
   Confirm Password: admin123
   Role: 👨‍💼 Admin
   ```
4. **Click "Create Account"**
5. **Check your email** for the verification link
6. **Click the verification link** in the email
7. **Return to the app** and sign in with your credentials

### Step 3: Create a Parent Account

1. **Sign out** from the admin account (if signed in)
2. **Click "Don't have an account? Sign Up"**
3. **Fill in the registration form**:
   ```
   First Name: Parent
   Last Name: Test
   Email: parent@test.com
   Phone: 0987654321 (optional)
   Password: parent123
   Confirm Password: parent123
   Role: 👨‍👩‍👧‍👦 Parent
   ```
4. **Click "Create Account"**
5. **Verify email** and sign in

## 🎯 What You Can Do Now

### As Admin

- ✅ View admin dashboard with statistics
- ✅ Manage parents, children, and staff
- ✅ Mark attendance
- ✅ Create events and announcements
- ✅ Upload media
- ✅ Manage payments
- ✅ View media consent forms

### As Parent

- ✅ View parent dashboard with child information
- ✅ Check attendance history
- ✅ View upcoming events
- ✅ Read announcements
- ✅ Make payments
- ✅ View media gallery
- ✅ Submit media consent forms

## 🔐 Security Features

### Email Verification

- **Required**: All new accounts must verify their email
- **Cannot sign in** until email is verified
- **Check spam folder** if you don't see the email

### Password Requirements

- **Minimum length**: 6 characters
- **Recommendation**: Use a strong password with letters, numbers, and symbols

### Role-Based Access

- **Parents**: Can only see their own children and related data
- **Admins**: Can see and manage all data
- **Automatic routing**: Users are redirected to the correct dashboard based on role

## 📱 Testing the App

### Test Parent Access

1. Sign in as parent
2. Navigate to "My Children" - should only see children assigned to this parent
3. Check "Attendance" - should only see attendance for own children
4. View "Payments" - should only see own payments

### Test Admin Access

1. Sign in as admin
2. Navigate to "Manage Parents" - should see all parents
3. Check "Manage Children" - should see all children
4. View "Attendance" - should see all attendance records

### Test Sign Out

1. Click the sign out button (top right)
2. Confirm sign out
3. Should be redirected to login screen
4. Session should be cleared

## 🐛 Common Issues

### "Email not confirmed"

**Problem**: Trying to sign in before verifying email

**Solution**: 
1. Check your email inbox (and spam folder)
2. Click the verification link
3. Try signing in again

### "Invalid email or password"

**Problem**: Wrong credentials

**Solution**:
1. Double-check your email and password
2. Make sure Caps Lock is off
3. Try resetting password (if implemented)

### Can't see any data

**Problem**: RLS policies blocking access

**Solution**:
1. Make sure you're signed in
2. Check that your role is correct
3. Try refreshing the page

### Email not arriving

**Problem**: Email delivery issues

**Solution**:
1. Check spam/junk folder
2. Wait a few minutes (emails can be delayed)
3. Check Supabase dashboard for email logs
4. Verify email settings in Supabase

## 🔧 Development Tips

### Check Authentication State

Add this to any component to debug auth:

```typescript
const { user, session, loading } = useAuth();
console.log('User:', user);
console.log('Session:', session);
console.log('Loading:', loading);
```

### View Database Records

Check Supabase dashboard:
1. Go to Table Editor
2. Select `users` table
3. Verify user was created with correct role

### Check RLS Policies

In Supabase SQL Editor:

```sql
-- View all policies for users table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Test if current user can read users
SELECT * FROM users;
```

## 📚 Next Steps

### For Development

1. **Add more users**: Create multiple parent and admin accounts
2. **Add children**: Link children to parent accounts
3. **Test features**: Try all features with different roles
4. **Check security**: Verify parents can't see other parents' data

### For Production

1. **Configure email**: Set up custom email templates in Supabase
2. **Add password reset**: Implement forgot password flow
3. **Enable 2FA**: Add two-factor authentication
4. **Monitor logs**: Check Supabase logs regularly

## ✅ Verification Checklist

- [ ] Can create admin account
- [ ] Can create parent account
- [ ] Email verification works
- [ ] Can sign in with verified account
- [ ] Admin sees admin dashboard
- [ ] Parent sees parent dashboard
- [ ] Can sign out successfully
- [ ] Parents only see their own data
- [ ] Admins can see all data
- [ ] RLS policies are working correctly

## 🎉 Success!

You now have a fully functional authentication system with:
- ✅ Secure email/password authentication
- ✅ Email verification
- ✅ Role-based access control
- ✅ Automatic database synchronization
- ✅ Comprehensive security policies

Start creating accounts and exploring the app!

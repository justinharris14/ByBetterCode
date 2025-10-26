
# CrècheConnect - Quick Start Guide

## 🚀 Getting Started (3 Steps)

### Step 1: Open the App
Launch the CrècheConnect app on your device or emulator.

### Step 2: Create Demo Accounts
You'll see the Setup screen. Click **"Create Demo Accounts"** and wait for completion.

### Step 3: Login
Use one of these demo accounts:

**👩‍💼 Admin Access:**
```
Email: admin@crecheconnect.com
Password: admin123
```

**👨‍👩‍👧 Parent Access:**
```
Email: thabo@example.com
Password: parent123
```

---

## 📱 What You Can Do

### As Admin
- ✅ View dashboard statistics
- ✅ Manage all children
- ✅ Mark daily attendance
- ✅ Create events and announcements
- ✅ Upload photos/videos
- ✅ View all payments

### As Parent
- ✅ View your children's profiles
- ✅ Check attendance history
- ✅ See upcoming events
- ✅ Read announcements
- ✅ View photos/videos of your children
- ✅ Track payments

---

## 🔧 If Setup Fails

### Manual Setup (2 minutes)

1. Go to: https://supabase.com/dashboard/project/bldlekwvgeatnqjwiowq
2. Click: **Authentication** → **Users** → **Add User**
3. Create admin user:
   - Email: `admin@crecheconnect.com`
   - Password: `admin123`
   - Click "Add metadata" and paste:
     ```json
     {
       "first_name": "Lindiwe",
       "last_name": "Mkhize",
       "phone": "+27123456789",
       "role": "admin"
     }
     ```
4. Repeat for parent users (see SETUP_INSTRUCTIONS.md)

---

## ⚠️ Common Issues

### "Invalid login credentials"
**Fix:** Make sure you created the demo accounts first (Step 2 above)

### "Email not confirmed"
**Fix:** Go to Supabase Dashboard → Authentication → Settings → Disable "Enable email confirmations"

### "Database error creating new user"
**Fix:** This has been fixed! If you still see it, check SETUP_INSTRUCTIONS.md

---

## 📚 More Help

- **Detailed Setup:** See `SETUP_INSTRUCTIONS.md`
- **What Was Fixed:** See `FIX_SUMMARY.md`
- **App Overview:** See `APP_OVERVIEW.md`
- **Database Setup:** See `SUPABASE_SETUP.md`

---

## 🎯 Demo Data Included

- **3 Users:** 1 Admin, 2 Parents
- **3 Children:** Sipho, Kabelo, Amahle
- **2 Events:** Sports Day, Parent Meeting
- **2 Announcements:** Welcome Back, Fees Due
- **3 Payments:** Various statuses
- **3 Media Items:** Photos with consent
- **21 Attendance Records:** Last 7 days for all children

---

## 💡 Pro Tips

1. **Pull to refresh** on any list screen to reload data
2. **Tap demo buttons** on login screen to auto-fill credentials
3. **Check the setup link** on login if you need to recreate accounts
4. **Use admin account** to see full functionality
5. **Use parent account** to see restricted view

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Can login as admin
- [ ] Can see admin dashboard with stats
- [ ] Can view children list
- [ ] Can mark attendance
- [ ] Can logout
- [ ] Can login as parent
- [ ] Can see parent dashboard
- [ ] Can view own children only
- [ ] Can see attendance history

---

## 🆘 Need Help?

1. Check the console logs for detailed error messages
2. Review Supabase logs: Dashboard → Logs → Auth
3. Verify migrations: Dashboard → Database → Migrations
4. Read the troubleshooting section in SETUP_INSTRUCTIONS.md

---

**You're all set! Enjoy using CrècheConnect! 🏫**

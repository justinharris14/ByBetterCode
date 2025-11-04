
# CrècheConnect

A simplified childcare management application built with React Native, Expo, and Supabase.

## 🎯 Overview

CrècheConnect helps childcare centers manage their daily operations with two user roles:
- **Admin**: Full control over children, attendance, events, announcements, and media
- **Parent**: View-only access to their children's information and activities

## ✨ Features

### Admin Features
- 📊 Dashboard with statistics
- 👶 Children management (Add/Edit/Delete)
- ✅ Daily attendance tracking
- 📅 Events management
- 📢 Announcements
- 📸 Media gallery

### Parent Features
- 👀 View children profiles
- 📋 View attendance history
- 📅 View upcoming events
- 📢 Read announcements
- 📸 View photos/videos

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
Create a `.env` file with your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the App
```bash
npm run dev
```

### 4. Setup Demo Data
- Open the app
- Click "Setup Demo Data" on login screen
- Wait for setup to complete (~10-15 seconds)

### 5. Login
**Admin:**
- Email: admin@crecheconnect.com
- Password: admin123

**Parent:**
- Email: thabo@example.com
- Password: parent123

## 📚 Documentation

- **[CURRENT_STATE.md](CURRENT_STATE.md)** - Complete feature overview
- **[QUICK_START.md](QUICK_START.md)** - User guide
- **[APP_OVERVIEW.md](APP_OVERVIEW.md)** - Technical architecture
- **[REVERSION_SUMMARY.md](REVERSION_SUMMARY.md)** - What was removed
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - Testing guide
- **[WHAT_CHANGED.md](WHAT_CHANGED.md)** - Before/after comparison

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo 54
- **Backend**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State**: React Context API

## 📱 Screens

### Admin
- Dashboard
- Children Management
- Attendance Tracking
- Events Management
- Announcements
- Media Gallery

### Parent
- Dashboard
- My Children
- Attendance History
- Events
- Announcements
- Media Gallery

## 🎨 Design

### Color Scheme
- Primary (Baby Blue): `#A9D6E5`
- Secondary (Light Pink): `#FAD4D8`
- White: `#FFFFFF`
- Card: `#F3F3F3`
- Text: `#003049`
- Success: `#4CAF50`
- Accent: `#FF6B6B`

### UI Features
- Rounded cards
- Soft shadows
- Tab navigation
- Pull-to-refresh
- Loading states
- Empty states

## 🗄️ Database Schema

### Tables
- `users` - User accounts (admin, parent)
- `children` - Child profiles
- `attendance` - Daily attendance records
- `events` - School events
- `announcements` - School updates
- `media` - Photos and videos
- `payments` - Payment records (basic)
- `event_notifications` - Event notification tracking

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Parents can only see their own data
- Admins have full access

## 🧪 Testing

Run through the [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) to verify all features work correctly.

## 📦 Demo Data

The setup screen creates:
- 1 Admin user (Lindiwe Mkhize)
- 2 Parent users (Thabo Dlamini, Naledi Khumalo)
- 3 Children (Sipho, Kabelo, Amahle)
- 2 Events (Sports Day, Parent Meeting)
- 2 Announcements (Welcome Back, Fees Due)
- Sample attendance records
- Sample media

## 🚧 What's Not Included

This is a simplified version. The following features were removed:
- Staff management
- Real-time notifications
- Payment processing (Stripe)
- Media consent forms
- Attendance graphs
- Calendar sync
- Emergency contact management

See [REVERSION_SUMMARY.md](REVERSION_SUMMARY.md) for details.

## 🔄 Adding Features Back

If you want to add removed features:
1. Review [REVERSION_SUMMARY.md](REVERSION_SUMMARY.md) for migration paths
2. Add database tables
3. Create UI screens
4. Implement business logic
5. Test thoroughly
6. Update documentation

## 📝 Development

### Project Structure
```
app/
├── (admin)/          # Admin screens
├── (parent)/         # Parent screens
├── login.tsx         # Login screen
└── setup.tsx         # Demo data setup

components/           # Reusable components
contexts/            # React contexts
lib/                 # Supabase client
types/               # TypeScript types
styles/              # Shared styles
```

### Key Files
- `lib/supabase.ts` - Supabase client configuration
- `contexts/AuthContext.tsx` - Authentication state
- `types/database.types.ts` - Database type definitions
- `styles/commonStyles.ts` - Shared styles and colors

## 🐛 Troubleshooting

### Can't Login
- Make sure you ran "Setup Demo Data" first
- Check Supabase credentials in `.env`
- Verify internet connection

### No Data Showing
- Pull down to refresh
- Check console for errors
- Verify Supabase is configured

### App Crashes
- Check console logs
- Verify all dependencies are installed
- Clear cache: `npm start -- --clear`

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

This is a simplified version for learning. Feel free to:
- Add features incrementally
- Improve the UI/UX
- Enhance security
- Add tests
- Update documentation

## 📞 Support

- Check the documentation files
- Review the code comments
- Test with demo accounts
- Use the testing checklist

## 🎉 Success!

You now have a working childcare management app! Start with the basic features, test thoroughly, and add enhancements as needed.

---

**Version:** 1.0 (Basic)  
**Status:** ✅ Production Ready  
**Last Updated:** 2025

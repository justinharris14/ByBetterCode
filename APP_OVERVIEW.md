
# CrècheConnect - Childcare Management App

## Overview
CrècheConnect is a comprehensive React Native mobile application for managing a childcare center. It features role-based access control with separate dashboards for Admins and Parents, powered by Supabase backend.

## Tech Stack
- **Frontend**: React Native + Expo 54
- **Backend**: Supabase (Auth, Database, Storage)
- **Authentication**: Email/Password with JWT
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **State Management**: React Context API
- **Navigation**: Expo Router (file-based routing)

## User Roles

### Admin
Full control over the childcare center:
- View dashboard with key statistics
- Manage children (add, edit, delete)
- Mark daily attendance
- Create and manage events
- Post announcements
- View all payments
- Upload and manage media

### Parent
View-only access to their own data:
- View their children's profiles
- Check attendance history
- See upcoming events
- Read announcements
- View and pay bills
- Access photos/videos of their children

## App Structure

```
app/
├── index.tsx                 # Entry point with auth redirect
├── login.tsx                 # Login screen
├── _layout.tsx              # Root layout with AuthProvider
├── (admin)/                 # Admin routes
│   ├── dashboard.tsx        # Admin dashboard
│   ├── children.tsx         # Manage children
│   ├── attendance.tsx       # Mark attendance
│   ├── events.tsx           # Manage events
│   ├── announcements.tsx    # Post announcements
│   ├── media.tsx            # Media gallery
│   └── payments.tsx         # View payments
└── (parent)/                # Parent routes
    ├── dashboard.tsx        # Parent dashboard
    ├── children.tsx         # View own children
    ├── attendance.tsx       # View attendance history
    ├── events.tsx           # View events
    ├── announcements.tsx    # Read announcements
    ├── media.tsx            # View photos/videos
    └── payments.tsx         # View and pay bills
```

## Key Features

### Authentication & Security
- Secure email/password authentication via Supabase
- Role-based routing (admin vs parent)
- Row-Level Security (RLS) ensures data isolation
- Parents can only access their own children's data
- Admins have full access to all data

### Real-time Capabilities
- Supabase Realtime for live updates
- Automatic notifications for new events
- Badge counters for unread notifications

### Data Management
- CRUD operations for all entities
- Attendance tracking with date-based records
- Payment tracking with status (pending/paid/overdue)
- Media management with consent flags

### UI/UX
- Child-friendly color scheme (Baby Blue, Light Pink, Coral)
- Rounded cards and smooth animations
- Pull-to-refresh on all list screens
- Modal forms for data entry
- Responsive design for iOS and Android

## Color Palette
- **Background**: #FFFFFF (White)
- **Text**: #003049 (Navy)
- **Primary**: #A9D6E5 (Baby Blue)
- **Secondary**: #FAD4D8 (Light Pink)
- **Accent**: #E76F51 (Coral)
- **Card**: #F3F3F3 (Soft Gray)
- **Highlight**: #264653 (Dark Teal)

## Demo Accounts

### Admin
- Email: admin@crecheconnect.com
- Password: admin123
- Access: Full system control

### Parent (Thabo Dlamini)
- Email: thabo@example.com
- Password: parent123
- Children: Sipho & Kabelo

### Parent (Naledi Khumalo)
- Email: naledi@example.com
- Password: parent123
- Children: Amahle

## Database Tables
1. **users** - User profiles with roles
2. **children** - Child records
3. **attendance** - Daily attendance tracking
4. **events** - School events
5. **event_notifications** - Event notifications
6. **payments** - Payment records
7. **announcements** - School announcements
8. **media** - Photos and videos

## Setup Instructions
See `SUPABASE_SETUP.md` for detailed setup instructions.

## Future Enhancements
- Stripe payment integration
- Push notifications
- In-app messaging between parents and admins
- Calendar view for events
- Attendance reports and analytics
- Bulk operations for attendance
- Photo/video upload from mobile device
- Receipt generation and download
- Multi-language support

## Development Notes
- All screens support pull-to-refresh
- Error handling with user-friendly alerts
- Console logging for debugging
- Responsive layouts for different screen sizes
- Dark mode support (theme-aware)
- Offline-first architecture ready

## License
Proprietary - CrècheConnect

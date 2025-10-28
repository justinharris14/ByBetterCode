
# CrècheConnect - Current State

## Overview
CrècheConnect is a simplified childcare management app with basic features for Admin and Parent users.

## Features Included

### Authentication
- Simple login system with role-based routing
- Admin and Parent roles
- Demo accounts for testing

### Admin Features
1. **Dashboard**
   - View total children count
   - View total events count
   - View today's attendance rate
   - Quick action buttons to navigate to different sections

2. **Children Management**
   - Add new children with basic information
   - Edit existing children
   - Delete children
   - View all registered children
   - Fields: First Name, Last Name, DOB, Parent ID, Allergies, Medical Info

3. **Attendance Tracking**
   - Mark daily attendance (Present/Absent)
   - Navigate between dates
   - Visual indicators for attendance status
   - Automatic date selection

4. **Events Management**
   - Create new events
   - Edit existing events
   - Delete events
   - View all events
   - Fields: Title, Description, Event Date/Time

5. **Announcements**
   - Create announcements
   - View all announcements
   - Delete announcements
   - Fields: Title, Message

6. **Media Gallery**
   - View uploaded media
   - Upload placeholder (requires Supabase Storage setup)
   - Media types: Photos and Videos
   - Consent tracking

### Parent Features
1. **Dashboard**
   - View number of children
   - View upcoming events count
   - Quick action buttons

2. **My Children**
   - View all children profiles
   - See child details (name, DOB, age, allergies, medical info)

3. **Attendance History**
   - View attendance records for their children
   - Last 30 days of attendance
   - Visual indicators (Present/Absent)

4. **Events**
   - View all upcoming events
   - See event details and countdown

5. **Announcements**
   - Read school announcements
   - View announcement history

6. **Media Gallery**
   - View photos and videos of their children
   - Only shows media with consent granted

## Database Schema

### Tables
- **users**: User accounts (admin, parent)
- **children**: Child profiles
- **attendance**: Daily attendance records
- **events**: School events
- **event_notifications**: Event notification tracking
- **payments**: Payment records (basic)
- **announcements**: School announcements
- **media**: Photos and videos

### Removed Tables (from advanced features)
- staff
- parents
- notifications
- media_consent
- child_staff_assignments

### Removed Columns
- children: emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
- payments: due_date, reminder_sent, stripe_payment_url
- attendance: notes

## Demo Accounts

### Admin
- Email: admin@crecheconnect.com
- Password: admin123
- Name: Lindiwe Mkhize

### Parents
1. Thabo Dlamini
   - Email: thabo@example.com
   - Password: parent123
   - Children: Sipho, Kabelo

2. Naledi Khumalo
   - Email: naledi@example.com
   - Password: parent123
   - Child: Amahle

## Color Scheme
- Primary (Baby Blue): #A9D6E5
- Secondary (Light Pink): #FAD4D8
- White: #FFFFFF
- Card Background: #F3F3F3
- Text: #003049
- Success: #4CAF50
- Accent: #FF6B6B

## Technical Stack
- React Native + Expo 54
- Supabase (Database, Auth, Storage)
- TypeScript
- React Navigation
- Expo Router

## Setup Instructions
1. Install dependencies: `npm install`
2. Configure Supabase credentials in `.env`
3. Run setup screen to create demo accounts
4. Login with demo credentials

## Features NOT Included (Removed)
- Staff management
- Parent detailed profiles
- Real-time notifications system
- Payment reminders and Stripe integration
- Media consent forms
- Attendance graphs
- Calendar sync
- Emergency contact management
- Advanced parent/child relationship tracking

## Next Steps
If you want to add features back, you can:
1. Re-create the database tables
2. Add the corresponding UI screens
3. Implement the business logic
4. Test thoroughly

## Notes
- RLS (Row Level Security) is enabled on all tables
- Public access is currently allowed for testing
- Media upload requires Supabase Storage bucket setup
- The app uses a simplified authentication flow for demo purposes

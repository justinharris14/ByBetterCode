
# CrècheConnect - Quick Start Guide

## Getting Started

### 1. First Time Setup
When you first open the app, you'll see the login screen with a "Setup Demo Data" button.

**Click "Setup Demo Data"** to automatically create:
- Demo admin account
- Demo parent accounts
- Sample children
- Sample events
- Sample announcements
- Sample attendance records
- Sample media

This process takes about 10-15 seconds.

### 2. Login Credentials

#### Admin Account
- **Email**: admin@crecheconnect.com
- **Password**: admin123

#### Parent Accounts
1. **Thabo Dlamini**
   - Email: thabo@example.com
   - Password: parent123
   - Children: Sipho (5 years), Kabelo (3 years)

2. **Naledi Khumalo**
   - Email: naledi@example.com
   - Password: parent123
   - Child: Amahle (4 years)

### 3. Admin Features

#### Dashboard
- View statistics: Total children, events, attendance rate
- Quick access to all management sections

#### Manage Children
- Add new children (requires: name, DOB, parent ID)
- Edit existing children
- Delete children
- View all registered children

#### Mark Attendance
- Select date using arrow buttons
- Tap on child card to toggle Present/Absent
- Visual indicators show attendance status
- Green = Present, Red = Absent

#### Manage Events
- Create events with title, description, and date/time
- Edit or delete existing events
- All parents can view events

#### Post Announcements
- Create announcements with title and message
- All parents can view announcements
- Delete old announcements

#### Media Gallery
- View uploaded media
- Upload photos/videos (requires Supabase Storage setup)
- Track consent for media sharing

### 4. Parent Features

#### Dashboard
- View number of children
- View upcoming events count
- Quick navigation to all sections

#### My Children
- View all your children's profiles
- See details: name, age, DOB, allergies, medical info

#### Attendance History
- View last 30 days of attendance
- See which days your children were present/absent
- Color-coded cards for easy viewing

#### View Events
- See all upcoming events
- View event details and countdown
- Plan ahead for school activities

#### Read Announcements
- Stay updated with school news
- View announcement history

#### Media Gallery
- View photos and videos of your children
- Only shows media with consent granted
- Download or share media

### 5. Navigation

#### Admin Navigation
Bottom tab bar with 5 tabs:
- Dashboard (Home icon)
- Children (People icon)
- Attendance (Checkmark icon)
- Events (Calendar icon)
- Announcements (Megaphone icon)

#### Parent Navigation
Bottom tab bar with 5 tabs:
- Dashboard (Home icon)
- Children (People icon)
- Attendance (Checkmark icon)
- Events (Calendar icon)
- Announcements (Megaphone icon)

### 6. Tips & Tricks

#### For Admins
- Use pull-to-refresh on any screen to reload data
- When adding children, you need the parent's user_id (found in users table)
- Mark attendance daily for accurate statistics
- Create events in advance so parents can plan

#### For Parents
- Check attendance regularly to track your child's presence
- Read announcements for important updates
- View events to stay informed about school activities
- Pull down to refresh any screen

### 7. Common Tasks

#### Adding a New Child (Admin)
1. Go to Children tab
2. Tap "+ Add Child"
3. Fill in: First Name, Last Name, DOB, Parent ID
4. Optionally add: Allergies, Medical Info
5. Tap "Save"

#### Marking Attendance (Admin)
1. Go to Attendance tab
2. Select the date (default is today)
3. Tap on each child's card to mark Present/Absent
4. Status updates immediately

#### Creating an Event (Admin)
1. Go to Events tab
2. Tap "+ Add Event"
3. Fill in: Title, Description, Date/Time (YYYY-MM-DD HH:MM:SS)
4. Tap "Save"

#### Posting an Announcement (Admin)
1. Go to Announcements tab
2. Tap "+ Add Announcement"
3. Fill in: Title, Message
4. Tap "Save"

### 8. Troubleshooting

#### Can't Login?
- Make sure you ran "Setup Demo Data" first
- Check that you're using the correct email and password
- Try refreshing the app

#### No Data Showing?
- Pull down to refresh the screen
- Check your internet connection
- Verify Supabase is configured correctly

#### Can't Add Children?
- Make sure you have the correct parent_id
- Check that all required fields are filled
- Date format should be YYYY-MM-DD

### 9. Sign Out
- Tap the sign-out icon (arrow in square) in the top-right corner of the dashboard
- You'll be redirected to the login screen

### 10. Need Help?
- Check the CURRENT_STATE.md file for detailed feature information
- Review the APP_OVERVIEW.md for architecture details
- Check the SETUP_INSTRUCTIONS.md for technical setup

## Enjoy using CrècheConnect! 🎉


# CrècheConnect Testing Checklist

Use this checklist to verify that the reverted app works correctly.

## Pre-Testing Setup

- [ ] App is running (`npm run dev`)
- [ ] Supabase is configured (check `.env`)
- [ ] Demo data has been created (run setup screen)

## Admin Testing

### Login
- [ ] Can access login screen
- [ ] Can click "Setup Demo Data" button
- [ ] Setup completes successfully
- [ ] Can login with admin@crecheconnect.com / admin123
- [ ] Redirects to admin dashboard

### Dashboard
- [ ] Dashboard loads without errors
- [ ] Shows total children count
- [ ] Shows total events count
- [ ] Shows attendance rate percentage
- [ ] Quick action cards are visible
- [ ] Can tap each quick action card
- [ ] Sign out button works

### Children Management
- [ ] Can navigate to Children screen
- [ ] Existing children are displayed
- [ ] Can tap "+ Add Child" button
- [ ] Modal opens with form
- [ ] Can enter: First Name, Last Name, DOB, Parent ID
- [ ] Can enter optional: Allergies, Medical Info
- [ ] "Save" button works
- [ ] New child appears in list
- [ ] Can tap edit icon on child card
- [ ] Edit modal opens with existing data
- [ ] Can modify child data
- [ ] Changes save correctly
- [ ] Can tap delete icon
- [ ] Confirmation alert appears
- [ ] Can delete child
- [ ] Child removed from list
- [ ] Pull-to-refresh works

### Attendance Tracking
- [ ] Can navigate to Attendance screen
- [ ] Date selector shows today's date
- [ ] Left arrow goes to previous day
- [ ] Right arrow goes to next day
- [ ] All children are listed
- [ ] Can tap child card to mark present
- [ ] Card turns green with checkmark
- [ ] Can tap again to mark absent
- [ ] Card turns red with X
- [ ] Can tap again to unmark
- [ ] Card returns to default
- [ ] Status saves to database
- [ ] Pull-to-refresh works

### Events Management
- [ ] Can navigate to Events screen
- [ ] Existing events are displayed
- [ ] Can tap "+ Add Event" button
- [ ] Modal opens with form
- [ ] Can enter: Title, Description, Date/Time
- [ ] "Save" button works
- [ ] New event appears in list
- [ ] Events show formatted date/time
- [ ] Can tap edit icon
- [ ] Edit modal opens with existing data
- [ ] Can modify event data
- [ ] Changes save correctly
- [ ] Can tap delete icon
- [ ] Confirmation alert appears
- [ ] Can delete event
- [ ] Event removed from list
- [ ] Pull-to-refresh works

### Announcements
- [ ] Can navigate to Announcements screen
- [ ] Existing announcements are displayed
- [ ] Can tap "+ Add Announcement" button
- [ ] Modal opens with form
- [ ] Can enter: Title, Message
- [ ] "Save" button works
- [ ] New announcement appears in list
- [ ] Announcements show date
- [ ] Can tap delete icon
- [ ] Confirmation alert appears
- [ ] Can delete announcement
- [ ] Announcement removed from list
- [ ] Pull-to-refresh works

### Media Gallery
- [ ] Can navigate to Media screen
- [ ] Existing media is displayed
- [ ] Media shows placeholder icons
- [ ] Photo icon for photos
- [ ] Video icon for videos
- [ ] Caption is displayed
- [ ] Date is displayed
- [ ] Consent badge shows when granted
- [ ] Can tap "+ Upload Media" button
- [ ] Alert shows (placeholder functionality)
- [ ] Pull-to-refresh works

### Navigation
- [ ] Bottom tab bar is visible
- [ ] All 5 tabs are present
- [ ] Dashboard tab works
- [ ] Children tab works
- [ ] Attendance tab works
- [ ] Events tab works
- [ ] Announcements tab works
- [ ] Active tab is highlighted
- [ ] Tab icons are correct

## Parent Testing

### Login
- [ ] Can logout from admin
- [ ] Returns to login screen
- [ ] Can login with thabo@example.com / parent123
- [ ] Redirects to parent dashboard

### Dashboard
- [ ] Dashboard loads without errors
- [ ] Shows children count
- [ ] Shows upcoming events count
- [ ] Quick action cards are visible
- [ ] Can tap each quick action card
- [ ] Sign out button works

### My Children
- [ ] Can navigate to Children screen
- [ ] Only parent's children are shown
- [ ] Shows child name
- [ ] Shows DOB
- [ ] Shows age (calculated)
- [ ] Shows allergies if present
- [ ] Shows medical info if present
- [ ] Pull-to-refresh works

### Attendance History
- [ ] Can navigate to Attendance screen
- [ ] Shows attendance records
- [ ] Only shows parent's children
- [ ] Shows last 30 days
- [ ] Present records have green border
- [ ] Absent records have red border
- [ ] Shows child name
- [ ] Shows date
- [ ] Shows status badge
- [ ] Pull-to-refresh works

### Events
- [ ] Can navigate to Events screen
- [ ] Shows all upcoming events
- [ ] Shows event title
- [ ] Shows event description
- [ ] Shows event date/time
- [ ] Shows countdown (days until)
- [ ] Pull-to-refresh works

### Announcements
- [ ] Can navigate to Announcements screen
- [ ] Shows all announcements
- [ ] Shows announcement title
- [ ] Shows announcement message
- [ ] Shows date
- [ ] Pull-to-refresh works

### Media Gallery
- [ ] Can navigate to Media screen
- [ ] Shows media for parent's children only
- [ ] Only shows media with consent granted
- [ ] Shows placeholder icons
- [ ] Shows caption
- [ ] Shows date
- [ ] Pull-to-refresh works

### Navigation
- [ ] Bottom tab bar is visible
- [ ] All 5 tabs are present
- [ ] Dashboard tab works
- [ ] Children tab works
- [ ] Attendance tab works
- [ ] Events tab works
- [ ] Announcements tab works
- [ ] Active tab is highlighted

## Cross-Cutting Concerns

### Performance
- [ ] App loads quickly
- [ ] Screens transition smoothly
- [ ] No lag when scrolling
- [ ] Pull-to-refresh is responsive
- [ ] No memory leaks

### Error Handling
- [ ] Invalid login shows error
- [ ] Network errors show alert
- [ ] Empty states show helpful message
- [ ] Form validation works
- [ ] Delete confirmations work

### UI/UX
- [ ] Colors match theme
- [ ] Text is readable
- [ ] Buttons are tappable
- [ ] Icons are appropriate
- [ ] Spacing is consistent
- [ ] Cards have rounded corners
- [ ] Shadows are subtle

### Data Integrity
- [ ] Data persists after refresh
- [ ] Changes sync to database
- [ ] Multiple users don't conflict
- [ ] Deletes are permanent
- [ ] Updates are immediate

## Removed Features (Should NOT Work)

### Admin
- [ ] ❌ No staff management screen
- [ ] ❌ No notification screen
- [ ] ❌ No payment screen
- [ ] ❌ No attendance graph
- [ ] ❌ No parent management screen
- [ ] ❌ No emergency contacts in children form
- [ ] ❌ No notes field in attendance

### Parent
- [ ] ❌ No notification screen
- [ ] ❌ No payment screen
- [ ] ❌ No media consent screen
- [ ] ❌ No calendar sync option
- [ ] ❌ No automatic notifications

## Database Verification

### Tables Exist
- [ ] users table exists
- [ ] children table exists
- [ ] attendance table exists
- [ ] events table exists
- [ ] announcements table exists
- [ ] media table exists
- [ ] payments table exists
- [ ] event_notifications table exists

### Tables Don't Exist
- [ ] ❌ staff table removed
- [ ] ❌ parents table removed
- [ ] ❌ notifications table removed
- [ ] ❌ media_consent table removed
- [ ] ❌ child_staff_assignments table removed

### Columns Removed
- [ ] ❌ children.emergency_contact_name removed
- [ ] ❌ children.emergency_contact_phone removed
- [ ] ❌ children.emergency_contact_relationship removed
- [ ] ❌ payments.due_date removed
- [ ] ❌ payments.reminder_sent removed
- [ ] ❌ payments.stripe_payment_url removed
- [ ] ❌ attendance.notes removed

## Demo Data Verification

### Users
- [ ] Admin user exists (Lindiwe Mkhize)
- [ ] Parent 1 exists (Thabo Dlamini)
- [ ] Parent 2 exists (Naledi Khumalo)

### Children
- [ ] Sipho exists (Thabo's child)
- [ ] Kabelo exists (Thabo's child)
- [ ] Amahle exists (Naledi's child)

### Events
- [ ] Sports Day event exists
- [ ] Parent Meeting event exists

### Announcements
- [ ] Welcome Back announcement exists
- [ ] Fees Due Reminder announcement exists

### Attendance
- [ ] Some attendance records exist
- [ ] Records are for demo children

### Media
- [ ] Some media records exist
- [ ] Media has consent granted

## Final Checks

### Documentation
- [ ] CURRENT_STATE.md exists and is accurate
- [ ] REVERSION_SUMMARY.md exists
- [ ] QUICK_START.md is updated
- [ ] APP_OVERVIEW.md is updated
- [ ] TESTING_CHECKLIST.md exists (this file)

### Code Quality
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No unused imports
- [ ] Code is formatted
- [ ] Comments are helpful

### Deployment Ready
- [ ] All tests pass
- [ ] No critical bugs
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Demo data works

## Test Results

### Summary
- Total Tests: ___
- Passed: ___
- Failed: ___
- Skipped: ___

### Issues Found
1. _______________
2. _______________
3. _______________

### Notes
_______________________________________________
_______________________________________________
_______________________________________________

### Tester
- Name: _______________
- Date: _______________
- Version: 1.0 (Basic)

---

## Status: [ ] PASS [ ] FAIL

**Sign-off:** _______________

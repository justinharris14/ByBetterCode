
# Troubleshooting Guide - Parent & Child Management

## Common Issues and Solutions

### Parent Management Issues

#### Issue: Cannot add new parent
**Symptoms**: Error message when trying to save parent

**Solutions**:
1. Check that all required fields are filled:
   - First Name
   - Last Name
   - Email
2. Verify email format is correct (must include @)
3. Check if email already exists in system
4. Ensure you have internet connection
5. Try refreshing the page and trying again

#### Issue: Parent dropdown is empty when adding child
**Symptoms**: No parents appear in the dropdown

**Solutions**:
1. Make sure you've added at least one parent first
2. Pull down to refresh the screen
3. Check that parents have role = 'parent' in database
4. Verify parents are marked as active (is_active = true)
5. Log out and log back in

#### Issue: Cannot delete parent
**Symptoms**: Error when trying to delete parent

**Solutions**:
1. Check if parent has children - must delete children first
2. Verify you're logged in as admin
3. Check internet connection
4. Try refreshing and attempting again

### Child Management Issues

#### Issue: Cannot save child information
**Symptoms**: Error message when saving child

**Solutions**:
1. Verify all required fields are filled:
   - First Name
   - Last Name
   - Date of Birth
   - Parent
2. Check date format is YYYY-MM-DD (e.g., 2019-03-15)
3. Ensure parent is selected from dropdown
4. Check internet connection
5. Try closing and reopening the modal

#### Issue: Date of birth not accepting input
**Symptoms**: Cannot type or date is rejected

**Solutions**:
1. Use format: YYYY-MM-DD
2. Example: 2019-03-15 (not 15/03/2019)
3. Ensure year is 4 digits
4. Month must be 01-12
5. Day must be valid for the month

#### Issue: Medical information not displaying
**Symptoms**: Saved medical info doesn't show on child card

**Solutions**:
1. Pull down to refresh the screen
2. Check that information was actually saved
3. Verify you're viewing the correct child
4. Log out and log back in
5. Check database directly if issue persists

### Navigation Issues

#### Issue: Parents tab not showing
**Symptoms**: Cannot see Parents tab in navigation

**Solutions**:
1. Verify you're logged in as admin (not parent)
2. Check that you're in the admin section
3. Log out and log back in
4. Clear app cache and restart
5. Verify app is up to date

#### Issue: Tab navigation not working
**Symptoms**: Clicking tabs doesn't navigate

**Solutions**:
1. Restart the app
2. Check for JavaScript errors in console
3. Verify internet connection
4. Try force-closing and reopening app
5. Clear app cache

### Data Display Issues

#### Issue: Information not updating after edit
**Symptoms**: Changes don't appear after saving

**Solutions**:
1. Pull down to refresh the screen
2. Close and reopen the app
3. Check that save was successful (look for success message)
4. Verify internet connection during save
5. Check database to confirm data was saved

#### Issue: Emergency contacts not showing
**Symptoms**: Emergency contact section is empty

**Solutions**:
1. Verify emergency contact information was entered
2. Check that all three fields are filled:
   - Name
   - Phone
   - Relationship
3. Pull down to refresh
4. Edit the record and re-save

#### Issue: Allergies not displaying with warning icon
**Symptoms**: Allergy text shows but no ⚠️ icon

**Solutions**:
1. This is a display issue, data is still saved
2. Refresh the screen
3. Check that allergies field has content
4. Verify emoji support on device

### Form Issues

#### Issue: Cannot scroll in modal form
**Symptoms**: Form is cut off, cannot see all fields

**Solutions**:
1. Try swiping up/down on the form
2. Close and reopen the modal
3. Rotate device to landscape mode
4. Use a device with larger screen
5. Fields are still accessible, just scroll

#### Issue: Picker/dropdown not opening
**Symptoms**: Clicking parent or gender selector does nothing

**Solutions**:
1. Try tapping again
2. Close and reopen the modal
3. Restart the app
4. Check for JavaScript errors
5. Verify app permissions

#### Issue: Keyboard covering input fields
**Symptoms**: Cannot see what you're typing

**Solutions**:
1. Scroll the form up
2. Tap outside keyboard to dismiss it
3. Use device's keyboard hide button
4. Rotate device
5. This is normal behavior on mobile

### Database Issues

#### Issue: Data not saving to database
**Symptoms**: Success message shows but data doesn't persist

**Solutions**:
1. Check internet connection
2. Verify Supabase project is active
3. Check RLS policies are correct
4. Verify user has admin role
5. Check Supabase logs for errors

#### Issue: Cannot connect to database
**Symptoms**: "Failed to load data" errors

**Solutions**:
1. Check internet connection
2. Verify Supabase URL and key in .env file
3. Check Supabase project status
4. Verify API key is valid
5. Check firewall/network restrictions

#### Issue: RLS policy errors
**Symptoms**: "Row level security policy violation" errors

**Solutions**:
1. Verify user is logged in
2. Check user role is correct (admin/parent)
3. Review RLS policies in Supabase
4. Ensure policies allow the operation
5. Check user_id matches auth.uid()

### Performance Issues

#### Issue: App is slow or laggy
**Symptoms**: Delays when loading or saving data

**Solutions**:
1. Check internet connection speed
2. Close other apps
3. Restart device
4. Clear app cache
5. Check device storage space

#### Issue: Forms take long to load
**Symptoms**: Modal opens slowly

**Solutions**:
1. This is normal with many parents/children
2. Data is loading in background
3. Wait a few seconds
4. Check internet speed
5. Consider pagination if data grows large

### Authentication Issues

#### Issue: Cannot access admin features
**Symptoms**: Admin tabs not showing or access denied

**Solutions**:
1. Verify you're logged in as admin
2. Check email is admin@crecheconnect.com
3. Verify role in database is 'admin'
4. Log out and log back in
5. Check user_id matches in users table

#### Issue: Session expired
**Symptoms**: Suddenly logged out or access denied

**Solutions**:
1. Log in again
2. Check internet connection
3. Verify Supabase session is valid
4. Clear app cache
5. Restart app

## Error Messages

### "Please fill in all required fields"
- Check that First Name, Last Name, Email (parent) are filled
- Check that First Name, Last Name, DOB, Parent (child) are filled
- Look for fields marked with *

### "Failed to load data"
- Check internet connection
- Verify Supabase is accessible
- Try pull-to-refresh
- Restart app

### "Failed to save"
- Check internet connection
- Verify all required fields
- Check data format (especially dates)
- Try again after a few seconds

### "Email already exists"
- This email is already registered
- Use a different email
- Or edit the existing parent record

### "Row level security policy violation"
- You don't have permission for this action
- Verify you're logged in as admin
- Check your role in the database
- Contact system administrator

## Getting Help

If you've tried the solutions above and still have issues:

1. **Check Documentation**
   - Review PARENT_CHILD_MANAGEMENT.md
   - Check QUICK_REFERENCE.md
   - Read this troubleshooting guide completely

2. **Gather Information**
   - What were you trying to do?
   - What error message did you see?
   - What steps did you already try?
   - Can you reproduce the issue?

3. **Check Logs**
   - Look for error messages in app
   - Check Supabase logs
   - Note any error codes

4. **Contact Support**
   - Provide all information gathered above
   - Include screenshots if possible
   - Describe steps to reproduce
   - Note your device and app version

## Prevention Tips

### Best Practices
1. Always fill in required fields first
2. Use correct date format (YYYY-MM-DD)
3. Verify phone numbers before saving
4. Double-check email addresses
5. Save frequently when entering lots of data

### Regular Maintenance
1. Update contact information quarterly
2. Review medical information annually
3. Verify emergency contacts regularly
4. Keep app updated to latest version
5. Backup data regularly

### Data Entry
1. Copy-paste carefully (avoid extra spaces)
2. Use consistent formatting
3. Be specific with allergies and medications
4. Include all relevant details
5. Verify information with parents

## Still Need Help?

If you're still experiencing issues:

1. Document the exact steps to reproduce the problem
2. Take screenshots of any error messages
3. Note the date and time the issue occurred
4. Check if others are experiencing the same issue
5. Contact your system administrator with all details

Remember: Most issues can be resolved by:
- Refreshing the screen (pull down)
- Logging out and back in
- Restarting the app
- Checking internet connection
- Verifying required fields are filled

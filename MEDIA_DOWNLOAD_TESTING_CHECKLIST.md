
# Media Download Testing Checklist

## Pre-Testing Setup

- [ ] Ensure you have test accounts:
  - [ ] Admin account with media upload capability
  - [ ] Parent account with at least one child
  - [ ] Test media files (photos and videos)

- [ ] Verify database setup:
  - [ ] Media table exists with RLS enabled
  - [ ] Children table has test data
  - [ ] Parent-child relationships are correct
  - [ ] Supabase Storage bucket 'media' exists and is public

## Functional Testing

### Media Viewing

- [ ] **Parent can view media**
  - [ ] Open app as parent
  - [ ] Navigate to Media tab
  - [ ] Verify media grid displays
  - [ ] Verify only own children's media is visible

- [ ] **Filter functionality**
  - [ ] If multiple children, verify filter buttons appear
  - [ ] Tap "All Children" - verify all media shows
  - [ ] Tap specific child - verify only that child's media shows
  - [ ] Verify statistics update correctly

- [ ] **Full-screen viewer**
  - [ ] Tap any photo - verify opens in full screen
  - [ ] Verify caption displays
  - [ ] Verify child name displays
  - [ ] Verify upload date displays
  - [ ] Tap X button - verify modal closes

### Download Functionality

- [ ] **First-time download (permissions)**
  - [ ] Tap download button
  - [ ] Verify permission dialog appears
  - [ ] Tap "Allow" or "Grant"
  - [ ] Verify download proceeds

- [ ] **Photo download**
  - [ ] Open a photo in full screen
  - [ ] Tap "Download Photo" button
  - [ ] Verify loading indicator appears
  - [ ] Verify success message appears
  - [ ] Open device photo library
  - [ ] Verify photo is saved
  - [ ] Verify filename format: `CrecheConnect_[ChildName]_[Timestamp].jpg`

- [ ] **Video download**
  - [ ] Open a video in full screen
  - [ ] Tap "Download Video" button
  - [ ] Verify loading indicator appears
  - [ ] Verify success message appears
  - [ ] Open device photo library
  - [ ] Verify video is saved
  - [ ] Verify video plays correctly

- [ ] **Multiple downloads**
  - [ ] Download 3-5 different media items
  - [ ] Verify each downloads successfully
  - [ ] Verify no permission prompt after first download
  - [ ] Verify all files appear in photo library

### Error Handling

- [ ] **Permission denied**
  - [ ] Deny permission when prompted
  - [ ] Verify error message appears
  - [ ] Verify message explains how to enable in settings
  - [ ] Go to settings and enable permission
  - [ ] Return to app and try again
  - [ ] Verify download works

- [ ] **Network error**
  - [ ] Turn off internet/WiFi
  - [ ] Try to download media
  - [ ] Verify error message appears
  - [ ] Turn internet back on
  - [ ] Try again - verify works

- [ ] **Storage full**
  - [ ] (If possible) Fill device storage
  - [ ] Try to download media
  - [ ] Verify appropriate error message

### UI/UX Testing

- [ ] **Loading states**
  - [ ] Verify spinner shows during initial load
  - [ ] Verify download button shows loading during download
  - [ ] Verify button is disabled during download

- [ ] **Visual design**
  - [ ] Verify colors match app theme
  - [ ] Verify download button is clearly visible
  - [ ] Verify button has proper contrast
  - [ ] Verify icons display correctly
  - [ ] Verify text is readable

- [ ] **Responsiveness**
  - [ ] Test on small screen device
  - [ ] Test on large screen device
  - [ ] Test in portrait orientation
  - [ ] Test in landscape orientation (if supported)
  - [ ] Verify grid layout adjusts properly

### Performance Testing

- [ ] **Load time**
  - [ ] Measure time to load media list
  - [ ] Should be < 3 seconds with good connection
  - [ ] Verify images load progressively

- [ ] **Download speed**
  - [ ] Download typical photo (2-5MB)
  - [ ] Should complete in < 5 seconds
  - [ ] Download typical video (10-20MB)
  - [ ] Should complete in < 30 seconds

- [ ] **Memory usage**
  - [ ] Download 10+ media items
  - [ ] Verify app doesn't crash
  - [ ] Verify app remains responsive

### Security Testing

- [ ] **Access control**
  - [ ] Login as Parent A
  - [ ] Note which media is visible
  - [ ] Logout and login as Parent B
  - [ ] Verify different media is visible
  - [ ] Verify Parent B cannot see Parent A's children's media

- [ ] **Data integrity**
  - [ ] Download a photo
  - [ ] Compare with original in admin view
  - [ ] Verify no quality loss or corruption
  - [ ] Verify EXIF data preserved (if applicable)

### Edge Cases

- [ ] **No media available**
  - [ ] Login as parent with no media
  - [ ] Verify empty state displays
  - [ ] Verify helpful message shows

- [ ] **Single child**
  - [ ] Login as parent with one child
  - [ ] Verify filter buttons don't show
  - [ ] Verify media displays correctly

- [ ] **Large media file**
  - [ ] Upload large video (40-50MB)
  - [ ] Try to download
  - [ ] Verify download completes
  - [ ] Verify no timeout errors

- [ ] **Special characters in filename**
  - [ ] Create child with special characters in name
  - [ ] Upload media for that child
  - [ ] Download media
  - [ ] Verify filename is valid

### Platform-Specific Testing

#### iOS Testing
- [ ] Test on iOS 14+
- [ ] Verify permission dialog shows correct message
- [ ] Verify media saves to Photos app
- [ ] Verify media appears in "Recents" album
- [ ] Test on iPhone (various sizes)
- [ ] Test on iPad (if supported)

#### Android Testing
- [ ] Test on Android 10+
- [ ] Verify permission dialog shows correct message
- [ ] Verify media saves to Gallery
- [ ] Verify scoped storage works correctly
- [ ] Test on various Android devices
- [ ] Test on different Android versions

### Regression Testing

- [ ] **Other features still work**
  - [ ] Dashboard loads correctly
  - [ ] Payments work
  - [ ] Events display
  - [ ] Announcements show
  - [ ] Attendance records visible
  - [ ] Children profiles accessible

- [ ] **Admin features unaffected**
  - [ ] Admin can still upload media
  - [ ] Admin can delete media
  - [ ] Admin can view all media

### Accessibility Testing

- [ ] **Screen reader**
  - [ ] Enable screen reader
  - [ ] Navigate to media screen
  - [ ] Verify all elements are announced
  - [ ] Verify download button is accessible

- [ ] **Large text**
  - [ ] Enable large text in device settings
  - [ ] Verify text scales appropriately
  - [ ] Verify layout doesn't break

- [ ] **Color contrast**
  - [ ] Verify download button has sufficient contrast
  - [ ] Verify text is readable on all backgrounds

## Post-Testing

- [ ] **Documentation review**
  - [ ] Read MEDIA_VIEWING_DOWNLOADING_GUIDE.md
  - [ ] Verify all features documented
  - [ ] Verify troubleshooting section is accurate

- [ ] **User guide review**
  - [ ] Read PARENT_MEDIA_QUICK_GUIDE.md
  - [ ] Verify instructions are clear
  - [ ] Verify screenshots match (if added)

- [ ] **Code review**
  - [ ] Review downloadMedia() function
  - [ ] Verify error handling is comprehensive
  - [ ] Verify no console errors
  - [ ] Verify proper cleanup of resources

## Sign-Off


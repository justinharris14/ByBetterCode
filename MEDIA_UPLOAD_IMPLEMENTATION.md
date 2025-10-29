
# Media Upload Implementation Guide

## Overview
This document describes the implementation of the media upload feature that allows admins/teachers to upload photos and videos of daily activities to share with parents.

## Features Implemented

### 1. **Admin Media Upload**
- Admins can upload photos and videos using their device's camera roll
- Support for both images and videos (up to 60 seconds)
- Add captions to media
- Select which child the media is associated with
- Mark parent consent status
- View, preview, and delete uploaded media

### 2. **Parent Media Viewing**
- Parents can view all photos and videos of their children
- Filter media by specific child (if they have multiple children)
- View statistics (total photos, videos, and media count)
- Full-screen media preview
- See upload dates and captions

### 3. **Supabase Storage Integration**
- Created a public storage bucket named `media`
- 50MB file size limit per upload
- Supported formats: JPEG, PNG, GIF, WebP, MP4, QuickTime, AVI
- Row Level Security (RLS) policies implemented:
  - Only admins can upload media
  - Only admins can update/delete media
  - Everyone can view media (public bucket)

## Database Structure

### Media Table
The `media` table already exists with the following structure:
```sql
- media_id (uuid, primary key)
- child_id (uuid, foreign key to children)
- uploaded_by (uuid, foreign key to users)
- media_kind (text: 'photo' or 'video')
- media_url (text: public URL from Supabase Storage)
- caption (text, nullable)
- consent_granted (boolean, default false)
- uploaded_at (timestamp)
```

### Storage Bucket
Created `media` bucket with:
- Public access for viewing
- Admin-only upload/update/delete permissions
- File size limit: 50MB
- Allowed MIME types: images and videos

## Technical Implementation

### Admin Media Screen (`app/(admin)/media.tsx`)

**Key Features:**
1. **Image/Video Picker**
   - Uses `expo-image-picker` for selecting media
   - Requests permissions before accessing camera roll
   - Supports both photos and videos
   - Video duration limited to 60 seconds
   - Image quality set to 0.8 for optimization

2. **Upload Process**
   ```typescript
   1. User selects media from device
   2. User selects child from dropdown
   3. User adds optional caption
   4. User marks consent status
   5. Media is converted to blob
   6. Uploaded to Supabase Storage
   7. Public URL is generated
   8. Database record is created
   ```

3. **Media Management**
   - Grid layout showing all uploaded media
   - Long press to delete media
   - Tap to view full-screen preview
   - Shows consent badges
   - Displays child name and upload date

### Parent Media Screen (`app/(parent)/media.tsx`)

**Key Features:**
1. **Filtered Viewing**
   - Automatically loads media for parent's children only
   - Filter by specific child if multiple children
   - Statistics dashboard showing photo/video counts

2. **Media Display**
   - Grid layout with thumbnails
   - Tap to view full-screen
   - Shows captions and dates
   - Video placeholder with play icon

3. **Real-time Updates**
   - Pull-to-refresh functionality
   - Automatically loads new media

## Usage Instructions

### For Admins/Teachers

1. **Upload Media:**
   - Navigate to Media tab
   - Tap "Upload Photo/Video" button
   - Select media from device
   - Choose the child
   - Add a caption (optional)
   - Mark consent if granted
   - Tap "Upload"

2. **View Media:**
   - Scroll through grid of uploaded media
   - Tap any media to view full-screen
   - See all details including child, date, and caption

3. **Delete Media:**
   - Long press on any media card
   - Confirm deletion
   - Media is removed from storage and database

### For Parents

1. **View Children's Media:**
   - Navigate to Media tab
   - See all photos and videos of your children
   - View statistics at the top

2. **Filter by Child:**
   - If you have multiple children
   - Tap child's name in filter bar
   - View media for that specific child

3. **View Full-Screen:**
   - Tap any media card
   - View in full-screen mode
   - See caption and upload details
   - Tap X to close

## Security & Privacy

### Row Level Security (RLS)
- **Upload:** Only users with role='admin' can upload
- **Update:** Only admins can update media
- **Delete:** Only admins can delete media
- **View:** Public access (all authenticated users)

### Consent Management
- Admins must mark consent status when uploading
- Consent badge displayed on media with granted consent
- Parents can see consent status

### Data Privacy
- Parents only see media of their own children
- Media is associated with specific children
- Upload tracking (who uploaded and when)

## File Organization

### Storage Structure
```
media/
  ├── {child_id}/
  │   ├── {timestamp}-{random}.jpg
  │   ├── {timestamp}-{random}.mp4
  │   └── ...
```

### Naming Convention
- Format: `{timestamp}-{random-string}.{extension}`
- Example: `1704067200000-abc123.jpg`
- Organized by child_id for easy management

## Performance Considerations

1. **Image Optimization**
   - Quality set to 0.8 to reduce file size
   - Maintains good visual quality
   - Faster uploads and downloads

2. **Video Limitations**
   - Maximum duration: 60 seconds
   - Prevents large file uploads
   - Better user experience

3. **Lazy Loading**
   - Images loaded on-demand
   - Grid layout for efficient display
   - Pull-to-refresh for updates

## Error Handling

1. **Permission Errors**
   - Checks for camera roll permissions
   - Shows alert if permission denied
   - Guides user to grant permissions

2. **Upload Errors**
   - Try-catch blocks around upload logic
   - User-friendly error messages
   - Logs errors for debugging

3. **Network Errors**
   - Handles connection issues
   - Retry mechanism via pull-to-refresh
   - Loading states during operations

## Future Enhancements

Potential improvements for future versions:

1. **Video Playback**
   - Integrate video player component
   - In-app video playback
   - Video controls (play, pause, seek)

2. **Bulk Upload**
   - Select multiple photos at once
   - Batch upload functionality
   - Progress indicator for multiple files

3. **Download Feature**
   - Allow parents to download media
   - Save to device gallery
   - Share via other apps

4. **Push Notifications**
   - Notify parents when new media is uploaded
   - Real-time updates
   - Notification preferences

5. **Albums/Collections**
   - Group media by events or dates
   - Create themed albums
   - Better organization

6. **Comments**
   - Allow parents to comment on media
   - Teacher responses
   - Engagement tracking

## Testing Checklist

- [ ] Admin can upload photos
- [ ] Admin can upload videos
- [ ] Admin can select child from dropdown
- [ ] Admin can add captions
- [ ] Admin can mark consent
- [ ] Admin can view uploaded media
- [ ] Admin can delete media
- [ ] Parent can view their children's media
- [ ] Parent can filter by child
- [ ] Parent can view full-screen preview
- [ ] Statistics display correctly
- [ ] Permissions are requested properly
- [ ] Error messages display correctly
- [ ] Pull-to-refresh works
- [ ] RLS policies prevent unauthorized access

## Troubleshooting

### Common Issues

1. **"Permission Required" Alert**
   - Solution: Grant camera roll permissions in device settings
   - Path: Settings > Privacy > Photos > CrècheConnect

2. **Upload Fails**
   - Check internet connection
   - Verify file size is under 50MB
   - Ensure file format is supported

3. **Media Not Showing**
   - Pull to refresh
   - Check if child is selected correctly
   - Verify RLS policies are active

4. **Slow Upload**
   - Large file sizes may take time
   - Consider reducing video length
   - Check network speed

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in console
3. Verify Supabase Storage is configured
4. Check RLS policies are active
5. Test with different file types and sizes

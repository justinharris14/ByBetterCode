
# Media Consent Form System

## Overview

The CrècheConnect app now includes a comprehensive media consent form system that allows parents to grant or deny permission for photos and videos of their children to be taken and used by the childcare center.

## Features

### For Parents

1. **Consent Form Management** (`/(parent)/consent`)
   - View consent status for all children
   - Submit new consent forms
   - Update existing consent forms
   - Digital signature capability

2. **Consent Options**
   - **Grant or Deny**: Simple toggle to grant or deny consent
   - **Media Type Selection**: Choose between photos, videos, or both
   - **Usage Permissions**: Select where media can be used:
     - Internal Use Only (shared only with parents via app)
     - School Website
     - Social Media
     - Promotional Materials
   - **Special Conditions**: Add any specific restrictions or requirements
   - **Digital Signature**: Sign with full name

3. **Dashboard Integration**
   - Alert banner when consent forms are pending
   - Quick access to consent form screen
   - Consent tab in navigation bar

### For Admins

1. **Consent Management** (`/(admin)/consent`)
   - View all children and their consent status
   - Filter by status (All, Granted, Denied, Pending)
   - View detailed consent information
   - Track consent history

2. **Statistics Dashboard**
   - Total children count
   - Granted consents count
   - Denied consents count
   - Pending consents count

3. **Detailed Consent View**
   - Full consent details in modal
   - View usage permissions
   - See special conditions
   - Check digital signature
   - View submission and update dates

## Database Structure

### `media_consent` Table

```sql
- consent_id (UUID, Primary Key)
- child_id (UUID, Foreign Key → children)
- parent_id (UUID, Foreign Key → users)
- consent_granted (Boolean)
- consent_date (Timestamp)
- consent_type (Text: 'photos', 'videos', 'both', 'none')
- usage_permissions (Text Array: 'internal', 'website', 'social_media', 'promotional')
- special_conditions (Text, Optional)
- signature_data (Text)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Row Level Security (RLS)

- Parents can view, create, and update consent forms for their own children
- Admins can view and update all consent forms
- One consent form per child (enforced by unique constraint)

## User Flow

### Parent Flow

1. **First Time Setup**
   - Parent logs in and sees alert on dashboard if consent forms are pending
   - Clicks on alert or navigates to Consent tab
   - Sees list of all their children with consent status

2. **Submitting Consent**
   - Clicks on a child to expand the consent form
   - Toggles consent granted/denied
   - If granted:
     - Selects media type (photos, videos, or both)
     - Checks usage permissions (at least one required)
     - Optionally adds special conditions
   - Enters full name as digital signature
   - Submits form

3. **Updating Consent**
   - Can return to consent screen at any time
   - Clicks on child to expand form
   - Makes changes
   - Re-signs and submits

### Admin Flow

1. **Monitoring Consent Status**
   - Navigates to Consent tab in admin dashboard
   - Views statistics cards showing overall consent status
   - Uses filter buttons to view specific categories

2. **Viewing Details**
   - Clicks on "View Details" icon for any child with consent
   - Modal opens showing:
     - Consent status (granted/denied)
     - Media type
     - Usage permissions
     - Special conditions
     - Digital signature
     - Submission and update dates

## Integration with Media Upload

The consent system integrates with the existing media upload functionality:

- When admins upload media, they can check if consent has been granted
- The `media` table already has a `consent_granted` field
- Admins should verify consent before uploading media of specific children

## Best Practices

### For Parents

1. **Review Carefully**: Read all options before submitting
2. **Be Specific**: Use special conditions to add any specific restrictions
3. **Update as Needed**: You can change your consent preferences at any time
4. **Digital Signature**: Your full name serves as a legal digital signature

### For Admins

1. **Verify Consent**: Always check consent status before uploading media
2. **Respect Restrictions**: Honor any special conditions specified by parents
3. **Regular Monitoring**: Check for pending consents regularly
4. **Privacy First**: Never share media without proper consent

## Legal Considerations

- Parents can revoke consent at any time
- Digital signatures are timestamped and stored securely
- Consent forms include a legal notice about the policy
- All consent data is protected by Row Level Security

## Technical Notes

### TypeScript Types

```typescript
export type ConsentType = 'photos' | 'videos' | 'both' | 'none';
export type UsagePermission = 'internal' | 'website' | 'social_media' | 'promotional';

export interface MediaConsent {
  consent_id: string;
  child_id: string;
  parent_id: string;
  consent_granted: boolean;
  consent_date?: string;
  consent_type: ConsentType;
  usage_permissions?: UsagePermission[];
  special_conditions?: string;
  signature_data?: string;
  created_at: string;
  updated_at: string;
}
```

### Navigation Routes

- Parent Consent: `/(parent)/consent`
- Admin Consent Management: `/(admin)/consent`

### Real-time Updates

The consent system uses Supabase's real-time capabilities to ensure:
- Dashboard stats update immediately when consent is submitted
- Admin view refreshes when new consents are added

## Future Enhancements

Potential improvements for the consent system:

1. **Email Notifications**: Send email reminders for pending consents
2. **Consent Expiry**: Option to set expiry dates for consent forms
3. **Bulk Operations**: Allow admins to export consent data
4. **Consent History**: Track all changes to consent forms over time
5. **Multi-language Support**: Translate consent forms to multiple languages
6. **PDF Export**: Generate PDF copies of signed consent forms

## Support

For questions or issues with the consent form system:
- Parents: Contact your childcare center administrator
- Admins: Refer to the technical documentation or contact support

---

**Last Updated**: January 2025
**Version**: 1.0.0

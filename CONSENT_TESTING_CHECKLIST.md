
# Media Consent Form Testing Checklist

## Setup

- [x] Database migration applied successfully
- [x] `media_consent` table created with RLS policies
- [x] TypeScript types updated
- [x] Parent and admin screens created
- [x] Navigation tabs updated

## Parent Testing

### Initial State
- [ ] Login as parent (e.g., thabo@example.com)
- [ ] Dashboard shows consent alert if forms are pending
- [ ] Alert displays correct count of pending consents
- [ ] Clicking alert navigates to consent screen

### Consent Screen
- [ ] All children are listed
- [ ] Each child shows correct consent status:
  - "Not Submitted" (gray) - no form yet
  - "Consent Granted" (green) - consent given
  - "Consent Denied" (red) - consent denied
- [ ] Clicking child expands/collapses form
- [ ] Last updated date shows for existing consents

### Submitting New Consent (Grant)
- [ ] Toggle "Grant Media Consent" to ON
- [ ] Media type selection appears (Photos, Videos, Both)
- [ ] Can select media type
- [ ] Usage permissions section appears
- [ ] Can check/uncheck multiple permissions
- [ ] At least one permission required (validation)
- [ ] Can add special conditions (optional)
- [ ] Digital signature field appears
- [ ] Signature required (validation)
- [ ] Submit button works
- [ ] Success message appears
- [ ] Form collapses after submission
- [ ] Status updates to "Consent Granted"

### Submitting New Consent (Deny)
- [ ] Toggle "Grant Media Consent" to OFF
- [ ] Only signature field appears
- [ ] Signature required (validation)
- [ ] Submit button works
- [ ] Success message appears
- [ ] Status updates to "Consent Denied"

### Updating Existing Consent
- [ ] Can expand form for child with existing consent
- [ ] Form pre-fills with existing data
- [ ] Can change consent granted/denied
- [ ] Can change media type
- [ ] Can change usage permissions
- [ ] Can update special conditions
- [ ] Must re-sign (enter name again)
- [ ] Update button works
- [ ] Success message appears
- [ ] Updated date changes

### Dashboard Integration
- [ ] Consent alert disappears when all forms submitted
- [ ] Consent tab shows in navigation bar
- [ ] Quick action card for consent (if pending)
- [ ] Badge shows pending count on consent card

### Edge Cases
- [ ] Parent with no children sees "No children registered"
- [ ] Refresh works correctly (pull to refresh)
- [ ] Form validation prevents submission without required fields
- [ ] Can't submit without signature
- [ ] Can't submit granted consent without usage permissions

## Admin Testing

### Consent Management Screen
- [ ] Login as admin (e.g., admin@crecheconnect.com)
- [ ] Navigate to Consent tab
- [ ] Statistics cards show correct counts:
  - Total Children
  - Granted
  - Denied
  - Pending
- [ ] All children listed with consent status

### Filtering
- [ ] "All" filter shows all children
- [ ] "Granted" filter shows only granted consents
- [ ] "Denied" filter shows only denied consents
- [ ] "Pending" filter shows only children without forms
- [ ] Filter buttons highlight when active

### Viewing Details
- [ ] "View Details" icon appears for children with consents
- [ ] Clicking icon opens modal
- [ ] Modal shows all consent information:
  - Status (granted/denied)
  - Media type
  - Usage permissions (if granted)
  - Special conditions (if any)
  - Digital signature
  - Date signed
  - Last updated date
- [ ] Close button works
- [ ] Modal scrolls if content is long

### Data Display
- [ ] Child name displays correctly
- [ ] Parent name displays correctly
- [ ] Consent type displays correctly (Photos, Videos, Both)
- [ ] Usage permissions display as readable text
- [ ] Dates format correctly
- [ ] Status colors are correct (green/red/gray)

### Edge Cases
- [ ] Children without parents show "Unknown" parent
- [ ] Empty state shows when no children match filter
- [ ] Refresh works correctly (pull to refresh)
- [ ] Modal handles missing data gracefully

## Database Testing

### RLS Policies
- [ ] Parents can only see their own children's consents
- [ ] Parents can create consents for their children
- [ ] Parents can update their own consents
- [ ] Admins can see all consents
- [ ] Admins can update any consent
- [ ] Unauthenticated users cannot access consents

### Data Integrity
- [ ] Only one consent per child (unique constraint)
- [ ] Consent type must be valid enum value
- [ ] Usage permissions array stores correctly
- [ ] Timestamps update automatically
- [ ] Foreign keys enforce referential integrity

### Queries
- [ ] Loading consents is fast
- [ ] Filtering works efficiently
- [ ] Joins with children and users work correctly
- [ ] Counts are accurate

## UI/UX Testing

### Design
- [ ] Colors match app theme
- [ ] Icons are appropriate and clear
- [ ] Cards have proper shadows/elevation
- [ ] Text is readable (size, color, contrast)
- [ ] Spacing is consistent

### Responsiveness
- [ ] Works on different screen sizes
- [ ] Scrolling works smoothly
- [ ] Modals fit on screen
- [ ] Forms don't overflow
- [ ] Tab bar doesn't cover content

### Interactions
- [ ] Buttons have visual feedback (press state)
- [ ] Toggles animate smoothly
- [ ] Checkboxes show checked state clearly
- [ ] Expandable sections animate
- [ ] Loading states show when appropriate

### Accessibility
- [ ] Text is readable
- [ ] Touch targets are large enough
- [ ] Color contrast is sufficient
- [ ] Icons have meaning without color

## Integration Testing

### With Media Upload
- [ ] Admin can check consent before uploading
- [ ] Media table `consent_granted` field can be set
- [ ] Parents can only see media with consent

### With Dashboard
- [ ] Stats update when consent submitted
- [ ] Alert appears/disappears correctly
- [ ] Navigation works from all entry points

### Real-time Updates
- [ ] Dashboard updates when consent submitted
- [ ] Admin view updates when new consent added
- [ ] No need to manually refresh

## Performance Testing

- [ ] Consent screen loads quickly
- [ ] Large lists scroll smoothly
- [ ] No lag when expanding/collapsing forms
- [ ] Modal opens/closes smoothly
- [ ] Database queries are optimized

## Error Handling

- [ ] Network errors show appropriate messages
- [ ] Database errors are caught and logged
- [ ] Validation errors are clear
- [ ] Failed submissions can be retried
- [ ] App doesn't crash on errors

## Security Testing

- [ ] Parents cannot see other parents' consents
- [ ] Parents cannot modify other parents' consents
- [ ] SQL injection is prevented
- [ ] XSS attacks are prevented
- [ ] Authentication is required

## Documentation

- [ ] MEDIA_CONSENT_GUIDE.md is complete
- [ ] Code is well-commented
- [ ] TypeScript types are documented
- [ ] Database schema is documented

## Deployment Checklist

- [ ] Migration applied to production database
- [ ] RLS policies tested in production
- [ ] App builds successfully
- [ ] No console errors
- [ ] All features work in production

---

## Test Accounts

**Admin:**
- Email: admin@crecheconnect.com
- Password: [Your admin password]

**Parent (with children):**
- Email: thabo@example.com
- Password: [Your parent password]

**Parent (with children):**
- Email: naledi@example.com
- Password: [Your parent password]

---

## Notes

- Test on both iOS and Android if possible
- Test with different data scenarios (0 children, 1 child, multiple children)
- Test with slow network to verify loading states
- Test with different user roles
- Document any bugs or issues found

---


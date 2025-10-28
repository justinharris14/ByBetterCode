
# Migration Guide - Upgrading to v1.1.0

## Overview

This guide helps you migrate from CrècheConnect v1.0.0 to v1.1.0 with the new parent and child management features.

---

## What Happens During Migration

### Automatic Changes ✅
- Database migration runs automatically
- New columns added to users and children tables
- All existing data remains intact
- No data loss occurs
- New fields are optional (nullable)

### What Stays the Same ✅
- All existing parent records
- All existing child records
- All attendance records
- All events and announcements
- All payments and media
- Login credentials
- User roles and permissions

### What's New ✅
- New "Parents" tab in admin navigation
- Enhanced child management form
- Additional fields for parents and children
- Visual indicators for medical information
- Emergency contact tracking

---

## Migration Steps

### Step 1: Backup (Recommended)

Before upgrading, backup your data:

1. **Export from Supabase Dashboard:**
   - Go to your Supabase project
   - Navigate to Table Editor
   - Export users table
   - Export children table
   - Save exports in safe location

2. **Document Current State:**
   - Note number of parents
   - Note number of children
   - List any custom modifications

### Step 2: Apply Database Migration

The migration is applied automatically when you deploy the new version.

**What the migration does:**
```sql
- Adds address fields to users table
- Adds emergency contact fields to users table
- Adds medical fields to children table
- Adds emergency contact fields to children table
- All new fields are nullable (optional)
```

**Verify migration success:**
1. Check Supabase logs for migration completion
2. Verify new columns exist in Table Editor
3. Confirm existing data is intact

### Step 3: Update Application

1. **Deploy new version:**
   - Pull latest code
   - Install any new dependencies
   - Deploy to your environment

2. **Verify deployment:**
   - Login as admin
   - Check for "Parents" tab
   - Open children management
   - Verify new fields appear

### Step 4: Update Existing Records

Now you can enhance existing records with new information:

#### For Each Parent:
1. Go to Parents tab
2. Click edit (pencil icon) on each parent
3. Add new information:
   - Address details
   - Work phone
   - Emergency contacts
4. Save changes

#### For Each Child:
1. Go to Children tab
2. Click edit (pencil icon) on each child
3. Add new information:
   - Gender
   - Blood type
   - Allergies (if not already detailed)
   - Chronic conditions
   - Medications
   - Doctor information
   - Medical aid details
   - Emergency contacts
   - Special needs
   - Dietary restrictions
4. Save changes

---

## Data Migration Checklist

### Pre-Migration
- [ ] Backup all data from Supabase
- [ ] Document current record counts
- [ ] Note any custom modifications
- [ ] Inform staff of upcoming changes
- [ ] Schedule migration during low-usage time

### During Migration
- [ ] Apply database migration
- [ ] Deploy new application version
- [ ] Verify migration logs
- [ ] Test admin login
- [ ] Test parent login
- [ ] Check all tabs load correctly

### Post-Migration
- [ ] Verify all existing data intact
- [ ] Test adding new parent
- [ ] Test adding new child
- [ ] Test editing existing records
- [ ] Verify navigation works
- [ ] Check all features functional

### Data Enhancement
- [ ] Update parent records with new fields
- [ ] Update child records with medical info
- [ ] Add emergency contacts
- [ ] Verify all phone numbers
- [ ] Document any issues

---

## Handling Existing Data

### Parents (Users Table)

**Existing Fields (Unchanged):**
- user_id
- first_name
- last_name
- email
- phone
- role
- created_at
- is_active

**New Fields (Initially NULL):**
- address
- city
- postal_code
- id_number
- work_phone
- emergency_contact_name
- emergency_contact_phone
- emergency_contact_relationship
- secondary_emergency_contact_name
- secondary_emergency_contact_phone
- secondary_emergency_contact_relationship

**Action Required:**
- Edit each parent to add new information
- Prioritize emergency contacts
- Address information can be added gradually

### Children Table

**Existing Fields (Unchanged):**
- child_id
- first_name
- last_name
- dob
- allergies
- medical_info
- parent_id
- created_at

**New Fields (Initially NULL):**
- gender
- blood_type
- doctor_name
- doctor_phone
- medical_aid_name
- medical_aid_number
- chronic_conditions
- medications
- emergency_contact_name
- emergency_contact_phone
- emergency_contact_relationship
- special_needs
- dietary_restrictions

**Action Required:**
- Edit each child to add medical information
- Prioritize allergies and chronic conditions
- Add emergency contacts
- Document medications

---

## Priority Updates

### High Priority (Do First)
1. **Emergency Contacts**
   - Add for all parents
   - Add for all children
   - Verify phone numbers work

2. **Medical Information**
   - Document all allergies
   - List chronic conditions
   - Record current medications
   - Add blood types

3. **Doctor Information**
   - Add doctor names
   - Add doctor phone numbers
   - Verify information is current

### Medium Priority (Do Soon)
1. **Medical Aid**
   - Add provider names
   - Add member numbers
   - Verify coverage is active

2. **Contact Information**
   - Add work phone numbers
   - Complete address information
   - Add ID numbers

### Low Priority (Do When Possible)
1. **Additional Details**
   - Add gender information
   - Document special needs
   - Note dietary restrictions

---

## Rollback Plan

If you need to rollback (unlikely):

### Option 1: Restore from Backup
1. Stop application
2. Restore database from backup
3. Deploy previous version
4. Verify data integrity

### Option 2: Keep New Version, Remove New Data
1. New fields are optional
2. Simply don't use new features
3. Old functionality still works
4. Can migrate later

**Note:** Rollback should not be necessary as:
- Migration is non-destructive
- Existing data unchanged
- New fields are optional
- Backward compatible

---

## Testing After Migration

### Functional Testing

**Admin Functions:**
- [ ] Login as admin
- [ ] View dashboard
- [ ] Navigate to Parents tab
- [ ] Add new parent
- [ ] Edit existing parent
- [ ] Navigate to Children tab
- [ ] Add new child
- [ ] Edit existing child
- [ ] View attendance
- [ ] Create event
- [ ] Post announcement

**Parent Functions:**
- [ ] Login as parent
- [ ] View dashboard
- [ ] View children
- [ ] View attendance
- [ ] View events
- [ ] View announcements

### Data Integrity Testing

- [ ] Verify all parents still exist
- [ ] Verify all children still exist
- [ ] Check parent-child relationships
- [ ] Verify attendance records
- [ ] Check events and announcements
- [ ] Verify payments
- [ ] Check media records

### New Feature Testing

- [ ] Add parent with all new fields
- [ ] Add child with all new fields
- [ ] Edit parent to add emergency contacts
- [ ] Edit child to add medical info
- [ ] Verify data saves correctly
- [ ] Verify data displays correctly
- [ ] Test pull-to-refresh
- [ ] Test delete functions

---

## Common Migration Issues

### Issue: Migration doesn't run
**Solution:**
- Check Supabase connection
- Verify migration file exists
- Check Supabase logs
- Run migration manually if needed

### Issue: New fields don't appear
**Solution:**
- Clear app cache
- Restart application
- Verify migration completed
- Check database schema

### Issue: Existing data missing
**Solution:**
- Check backup
- Verify migration logs
- Check RLS policies
- Restore from backup if needed

### Issue: Cannot save new information
**Solution:**
- Check field validation
- Verify data types
- Check RLS policies
- Review error messages

---

## Staff Training

After migration, train your staff:

### Training Topics
1. **New Features Overview**
   - Parents tab
   - Enhanced child management
   - New fields and their purpose

2. **Data Entry**
   - How to add parents
   - How to add children
   - Required vs optional fields
   - Data format requirements

3. **Best Practices**
   - Importance of accurate data
   - Verification procedures
   - Regular updates
   - Emergency preparedness

4. **Documentation**
   - Where to find help
   - Using checklists
   - Troubleshooting guide

### Training Materials
- PARENT_CHILD_MANAGEMENT.md
- QUICK_REFERENCE.md
- REGISTRATION_CHECKLIST.md
- TROUBLESHOOTING.md

---

## Timeline Recommendation

### Week 1: Preparation
- Backup all data
- Review documentation
- Plan migration timing
- Inform staff

### Week 2: Migration
- Apply database migration
- Deploy new version
- Verify functionality
- Test all features

### Week 3: Data Enhancement
- Update parent records
- Update child records
- Add emergency contacts
- Verify information

### Week 4: Training & Rollout
- Train staff
- Update procedures
- Full rollout
- Monitor for issues

---

## Support During Migration

### Before Migration
- Review all documentation
- Plan migration steps
- Prepare backup strategy
- Schedule appropriate time

### During Migration
- Monitor migration progress
- Check logs for errors
- Test immediately after
- Document any issues

### After Migration
- Verify all functionality
- Update existing records
- Train staff
- Monitor for issues

---

## Success Criteria

Migration is successful when:

- ✅ All existing data intact
- ✅ New features accessible
- ✅ Parents tab visible
- ✅ Enhanced child form works
- ✅ Can add new information
- ✅ Can edit existing records
- ✅ All navigation works
- ✅ No errors in logs
- ✅ Staff trained
- ✅ Documentation reviewed

---

## Post-Migration Tasks

### Immediate (Day 1)
- [ ] Verify all systems operational
- [ ] Test all critical functions
- [ ] Monitor for errors
- [ ] Address any issues

### Short-term (Week 1)
- [ ] Begin updating parent records
- [ ] Begin updating child records
- [ ] Train staff on new features
- [ ] Gather feedback

### Medium-term (Month 1)
- [ ] Complete all record updates
- [ ] Verify all emergency contacts
- [ ] Review and refine procedures
- [ ] Document lessons learned

### Long-term (Ongoing)
- [ ] Maintain updated information
- [ ] Regular data reviews
- [ ] Continuous staff training
- [ ] Monitor system performance

---

## Questions?

If you have questions during migration:

1. Review this migration guide
2. Check TROUBLESHOOTING.md
3. Review implementation documentation
4. Contact system administrator
5. Provide detailed information about issues

---

**Remember:** Migration is designed to be safe and non-destructive. Take your time, follow the steps, and don't hesitate to ask for help!

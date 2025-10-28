
# Parent & Child Management - Enhanced Features

## Overview
The CrècheConnect app now captures comprehensive details for both parents and children, including emergency contacts, medical information, and more.

## What's New

### 1. Enhanced Parent Information
Admins can now capture detailed parent information including:

#### Personal Information
- First Name & Last Name
- Email Address
- ID Number
- Phone Numbers (Mobile & Work)

#### Address Information
- Street Address
- City
- Postal Code

#### Emergency Contacts
- **Primary Emergency Contact**
  - Name
  - Phone Number
  - Relationship (e.g., Spouse, Sibling, Friend)
  
- **Secondary Emergency Contact**
  - Name
  - Phone Number
  - Relationship

### 2. Enhanced Child Information
Admins can now capture comprehensive child details including:

#### Basic Information
- First Name & Last Name
- Date of Birth
- Gender (Male, Female, Other)
- Parent Selection (from registered parents)

#### Medical Information
- Blood Type (e.g., A+, O-, AB+)
- Allergies (detailed list)
- Chronic Conditions (e.g., Asthma, Diabetes)
- Current Medications & Dosages
- General Medical Information

#### Doctor Information
- Doctor Name
- Doctor Phone Number

#### Medical Aid
- Medical Aid Provider Name
- Medical Aid Number

#### Emergency Contact
- Emergency Contact Name (if different from parent)
- Emergency Contact Phone
- Relationship to Child

#### Additional Information
- Special Needs
- Dietary Restrictions

## How to Use

### Managing Parents

1. **Navigate to Parents Tab**
   - Login as Admin
   - Click on the "Parents" tab in the navigation bar

2. **Add a New Parent**
   - Click "+ Add Parent" button
   - Fill in all required fields (marked with *)
   - Complete optional fields for comprehensive records
   - Click "Save"

3. **Edit Parent Information**
   - Click the pencil icon on any parent card
   - Update the information
   - Click "Save"

4. **Delete a Parent**
   - Click the trash icon on any parent card
   - Confirm deletion
   - Note: This will also delete all associated children

### Managing Children

1. **Navigate to Children Tab**
   - Login as Admin
   - Click on the "Children" tab in the navigation bar

2. **Add a New Child**
   - Click "+ Add Child" button
   - Fill in Basic Information (required)
   - Select the parent from the dropdown
   - Complete Medical Information section
   - Add Doctor and Medical Aid details
   - Specify Emergency Contact if different from parent
   - Add any Special Needs or Dietary Restrictions
   - Click "Save"

3. **Edit Child Information**
   - Click the pencil icon on any child card
   - Update the information
   - Click "Save"

4. **Delete a Child**
   - Click the trash icon on any child card
   - Confirm deletion

## Database Schema

### Users Table (Parents)
```sql
- user_id (UUID, Primary Key)
- first_name, last_name, email, phone
- address, city, postal_code
- id_number, work_phone
- emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
- secondary_emergency_contact_name, secondary_emergency_contact_phone, secondary_emergency_contact_relationship
- role, is_active, created_at
```

### Children Table
```sql
- child_id (UUID, Primary Key)
- first_name, last_name, dob, gender
- parent_id (Foreign Key to users)
- allergies, medical_info
- blood_type, doctor_name, doctor_phone
- medical_aid_name, medical_aid_number
- chronic_conditions, medications
- emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
- special_needs, dietary_restrictions
- created_at
```

## Important Notes

### Required Fields
- **Parents**: First Name, Last Name, Email
- **Children**: First Name, Last Name, Date of Birth, Parent

### Best Practices
1. **Always capture emergency contacts** - Critical for child safety
2. **Keep medical information up-to-date** - Review quarterly
3. **Document allergies clearly** - Use specific names (e.g., "Peanuts, Tree nuts")
4. **Include medication dosages** - Specify exact amounts and frequency
5. **Update contact information** - Verify phone numbers regularly

### Privacy & Security
- All data is protected by Row Level Security (RLS)
- Parents can only view their own information
- Admins have full access to manage all records
- Medical information is encrypted in transit

## Sample Data

The system includes demo data with comprehensive examples:

### Demo Parents
1. **Thabo Dlamini**
   - Full address and contact details
   - Two emergency contacts (Spouse & Mother)
   - Two children (Sipho & Kabelo)

2. **Naledi Khumalo**
   - Complete contact information
   - Two emergency contacts (Brother & Sister)
   - One child (Amahle)

### Demo Children
1. **Sipho Dlamini** (Age 5)
   - Allergies: Peanuts, Tree nuts
   - Chronic Condition: Asthma
   - Medication: Ventolin inhaler
   - Blood Type: A+
   - Dietary: Nut-free diet

2. **Kabelo Dlamini** (Age 3)
   - No known allergies or conditions
   - Blood Type: O+

3. **Amahle Khumalo** (Age 4)
   - Allergy: Dairy (lactose intolerant)
   - Blood Type: B+
   - Dietary: Lactose-free diet

## Troubleshooting

### Parent dropdown is empty when adding a child
- Make sure you've added parents first
- Refresh the screen to reload parent data

### Cannot save parent/child
- Check that all required fields are filled
- Verify email format is correct
- Ensure date format is YYYY-MM-DD

### Changes not appearing
- Pull down to refresh the screen
- Check your internet connection
- Verify you're logged in as admin

## Future Enhancements
- Photo upload for parents and children
- Document attachment (medical certificates, etc.)
- Automated reminders for medical check-ups
- Export functionality for emergency contact lists
- Bulk import from CSV/Excel

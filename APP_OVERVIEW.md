
# CrècheConnect - App Overview

## Purpose
CrècheConnect is a childcare management application designed to help crèche administrators manage daily operations and enable parents to stay connected with their children's activities.

## Architecture

### Technology Stack
- **Frontend**: React Native with Expo 54
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Simplified role-based system
- **Storage**: Supabase Storage (for media)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API

### Project Structure
```
app/
├── (admin)/              # Admin-only screens
│   ├── _layout.tsx       # Admin tab navigation
│   ├── dashboard.tsx     # Admin dashboard
│   ├── children.tsx      # Children management
│   ├── attendance.tsx    # Attendance tracking
│   ├── events.tsx        # Events management
│   ├── announcements.tsx # Announcements
│   └── media.tsx         # Media gallery
├── (parent)/             # Parent-only screens
│   ├── _layout.tsx       # Parent tab navigation
│   ├── dashboard.tsx     # Parent dashboard
│   ├── children.tsx      # View children
│   ├── attendance.tsx    # View attendance
│   ├── events.tsx        # View events
│   ├── announcements.tsx # View announcements
│   └── media.tsx         # View media
├── _layout.tsx           # Root layout
├── index.tsx             # Entry point
├── login.tsx             # Login screen
└── setup.tsx             # Demo data setup

components/
├── FloatingTabBar.tsx    # Custom tab bar
├── IconSymbol.tsx        # Icon component
└── ...

contexts/
├── AuthContext.tsx       # Authentication context

lib/
└── supabase.ts          # Supabase client

types/
└── database.types.ts    # TypeScript types

styles/
└── commonStyles.ts      # Shared styles
```

## User Roles

### Admin
- Full access to all features
- Can create, read, update, delete (CRUD) all data
- Manages children, attendance, events, announcements, media

### Parent
- Read-only access to their own data
- Can view their children's information
- Can view attendance, events, announcements, media

## Core Features

### 1. Authentication
- Simple email-based login
- Role-based routing (admin vs parent)
- Demo accounts for testing
- Sign out functionality

### 2. Dashboard
**Admin Dashboard:**
- Statistics cards (children count, events count, attendance rate)
- Quick action buttons
- Navigation to all sections

**Parent Dashboard:**
- Statistics cards (children count, upcoming events)
- Quick action buttons
- Navigation to all sections

### 3. Children Management
**Admin:**
- Add new children with details
- Edit existing children
- Delete children
- View all children

**Parent:**
- View their children only
- See child details (name, DOB, age, allergies, medical info)

### 4. Attendance Tracking
**Admin:**
- Mark daily attendance (Present/Absent)
- Navigate between dates
- Visual status indicators
- Automatic statistics calculation

**Parent:**
- View attendance history (last 30 days)
- See attendance status for their children
- Color-coded cards

### 5. Events Management
**Admin:**
- Create events with title, description, date/time
- Edit existing events
- Delete events

**Parent:**
- View all upcoming events
- See event details
- Countdown to events

### 6. Announcements
**Admin:**
- Create announcements
- Delete announcements

**Parent:**
- View all announcements
- Read school updates

### 7. Media Gallery
**Admin:**
- Upload photos/videos (requires Storage setup)
- View all media
- Track consent

**Parent:**
- View media of their children
- Only shows media with consent granted

## Database Schema

### Core Tables

#### users
- user_id (UUID, PK)
- first_name (TEXT)
- last_name (TEXT)
- email (TEXT, UNIQUE)
- phone (TEXT)
- role (TEXT: 'admin' | 'parent')
- created_at (TIMESTAMP)
- is_active (BOOLEAN)

#### children
- child_id (UUID, PK)
- first_name (TEXT)
- last_name (TEXT)
- dob (DATE)
- allergies (TEXT)
- medical_info (TEXT)
- parent_id (UUID, FK → users)
- created_at (TIMESTAMP)

#### attendance
- attendance_id (UUID, PK)
- child_id (UUID, FK → children)
- date (DATE)
- is_present (BOOLEAN)
- marked_by (UUID, FK → users)
- created_at (TIMESTAMP)

#### events
- event_id (UUID, PK)
- title (TEXT)
- description (TEXT)
- event_datetime (TIMESTAMP)
- created_by_id (UUID, FK → users)
- created_at (TIMESTAMP)

#### announcements
- announcement_id (UUID, PK)
- title (TEXT)
- message (TEXT)
- created_by_id (UUID, FK → users)
- created_at (TIMESTAMP)

#### media
- media_id (UUID, PK)
- child_id (UUID, FK → children)
- uploaded_by (UUID, FK → users)
- media_kind (TEXT: 'photo' | 'video')
- media_url (TEXT)
- consent_granted (BOOLEAN)
- caption (TEXT)
- uploaded_at (TIMESTAMP)

#### payments
- payment_id (UUID, PK)
- parent_id (UUID, FK → users)
- amount (NUMERIC)
- payment_type (TEXT)
- status (TEXT: 'pending' | 'paid' | 'overdue')
- payment_date (DATE)
- receipt_url (TEXT)
- created_at (TIMESTAMP)

#### event_notifications
- notification_id (UUID, PK)
- event_id (UUID, FK → events)
- parent_id (UUID, FK → users)
- sent_at (TIMESTAMP)
- is_read (BOOLEAN)

## Security

### Row Level Security (RLS)
- Enabled on all tables
- Currently set to public access for testing
- Should be configured for production use

### Recommended RLS Policies
```sql
-- Parents can only see their own children
CREATE POLICY "Parents view own children"
ON children FOR SELECT
USING (parent_id = auth.uid());

-- Parents can only see attendance for their children
CREATE POLICY "Parents view own attendance"
ON attendance FOR SELECT
USING (child_id IN (
  SELECT child_id FROM children WHERE parent_id = auth.uid()
));

-- Admins can do everything
CREATE POLICY "Admins full access"
ON children FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

## UI/UX Design

### Color Scheme
- **Primary (Baby Blue)**: #A9D6E5
- **Secondary (Light Pink)**: #FAD4D8
- **White**: #FFFFFF
- **Card Background**: #F3F3F3
- **Text**: #003049
- **Text Secondary**: #6B7280
- **Success**: #4CAF50
- **Accent**: #FF6B6B
- **Border**: #E5E7EB

### Design Principles
- Clean, minimalistic interface
- Child-friendly colors
- Rounded corners on cards and buttons
- Consistent spacing and padding
- Visual feedback for interactions
- Pull-to-refresh on all list screens
- Loading states
- Empty states with helpful messages

### Navigation
- Tab-based navigation for main sections
- Floating tab bar at the bottom
- Animated tab transitions
- Icon-based navigation
- Consistent header with sign-out button

## Data Flow

### Admin Flow
1. Login → Admin Dashboard
2. View statistics and quick actions
3. Navigate to specific section (Children, Attendance, etc.)
4. Perform CRUD operations
5. Data syncs with Supabase
6. UI updates automatically

### Parent Flow
1. Login → Parent Dashboard
2. View statistics and quick actions
3. Navigate to specific section
4. View read-only data
5. Pull to refresh for latest updates

## API Integration

### Supabase Client
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Common Operations
```typescript
// Fetch data
const { data, error } = await supabase
  .from('children')
  .select('*')
  .order('first_name', { ascending: true });

// Insert data
const { error } = await supabase
  .from('children')
  .insert([{ first_name, last_name, dob, parent_id }]);

// Update data
const { error } = await supabase
  .from('children')
  .update({ first_name, last_name })
  .eq('child_id', childId);

// Delete data
const { error } = await supabase
  .from('children')
  .delete()
  .eq('child_id', childId);
```

## Performance Considerations

### Optimization Strategies
- Pull-to-refresh instead of auto-refresh
- Limit queries (e.g., last 30 days of attendance)
- Use indexes on frequently queried columns
- Lazy loading for large lists
- Caching with React state

### Database Indexes
```sql
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_attendance_child_id ON attendance(child_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_events_datetime ON events(event_datetime);
```

## Error Handling

### Strategy
- Try-catch blocks for all async operations
- User-friendly error messages via Alert
- Console logging for debugging
- Graceful fallbacks for missing data

### Example
```typescript
try {
  const { data, error } = await supabase.from('children').select('*');
  if (error) throw error;
  setChildren(data || []);
} catch (error) {
  console.error('Error loading children:', error);
  Alert.alert('Error', 'Failed to load children');
}
```

## Future Enhancements (Not Currently Implemented)
- Real-time notifications
- Staff management
- Payment processing with Stripe
- Media consent forms
- Attendance graphs and analytics
- Calendar sync
- Push notifications
- In-app messaging
- Report generation
- Export data functionality

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env` with Supabase credentials
4. Run: `npm run dev`
5. Test on device or simulator

### Testing
- Use demo accounts for testing
- Test both admin and parent flows
- Verify CRUD operations
- Check error handling
- Test on both iOS and Android

### Deployment
- Build for production: `expo build`
- Deploy to app stores
- Configure production Supabase instance
- Set up proper RLS policies
- Monitor logs and errors

## Support & Maintenance

### Regular Tasks
- Monitor Supabase usage
- Review error logs
- Update dependencies
- Backup database
- Test new features

### Troubleshooting
- Check Supabase connection
- Verify RLS policies
- Review console logs
- Test with demo accounts
- Check network connectivity

## Conclusion
CrècheConnect provides a solid foundation for childcare management with room for growth and customization. The simplified architecture makes it easy to understand, maintain, and extend with new features as needed.

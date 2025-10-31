
# Authentication Quick Reference

## 🔐 How Authentication Works

### Login Process
1. User enters email and password in `login.tsx`
2. POST request to: `https://bldlekwvgeatnqjwiowq.supabase.co/auth/v1/token?grant_type=password`
3. On success:
   - `access_token` stored in `auth_token` global variable
   - `access_token` stored in AsyncStorage
   - User data loaded from `public.users` table
   - User object stored in `current_user` global variable
   - Navigate to dashboard based on role

### App Startup
1. Check AsyncStorage for `auth_token`
2. If found, verify with: `GET /auth/v1/user`
3. If valid:
   - Load user data from database
   - Navigate to appropriate dashboard
4. If invalid or missing:
   - Navigate to login screen

### Sign Out
1. Clear `auth_token` and `current_user` global variables
2. Remove from AsyncStorage
3. Navigate to login screen

## 📝 Code Examples

### Access Current User
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, authToken, loading } = useAuth();
  
  if (loading) return <Text>Loading...</Text>;
  if (!user) return <Text>Not authenticated</Text>;
  
  return <Text>Hello, {user.first_name}!</Text>;
}
```

### Access Global Variables
```typescript
import { auth_token, current_user } from '@/contexts/AuthContext';

console.log('Token:', auth_token);
console.log('User:', current_user);
```

### Make Authenticated Database Query
```typescript
import { supabase } from '@/lib/supabase';

// Auth headers are automatically included
const { data, error } = await supabase
  .from('children')
  .select('*')
  .eq('parent_id', user.user_id);
```

### Make Authenticated Fetch Request
```typescript
import { getAuthHeaders } from '@/lib/supabase';

const headers = await getAuthHeaders();
const response = await fetch(
  'https://bldlekwvgeatnqjwiowq.supabase.co/rest/v1/children',
  { headers }
);
```

### Sign Out User
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

function MyComponent() {
  const { signOut } = useAuth();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };
  
  return <Button onPress={handleSignOut}>Sign Out</Button>;
}
```

## 🎯 Role-Based Navigation

### Admin Role
- Role value: `"admin"`
- Dashboard: `(admin)/dashboard.tsx`
- Access to: All management features

### Parent Role
- Role value: `"parent"`
- Dashboard: `(parent)/dashboard.tsx`
- Access to: View-only features for their children

## 🔑 API Endpoints

### Sign In
```
POST https://bldlekwvgeatnqjwiowq.supabase.co/auth/v1/token?grant_type=password

Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body:
  {
    "email": "user@example.com",
    "password": "password123"
  }

Response:
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "...", ... }
  }
```

### Verify Token
```
GET https://bldlekwvgeatnqjwiowq.supabase.co/auth/v1/user

Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Authorization: Bearer {{auth_token}}

Response:
  {
    "id": "...",
    "email": "user@example.com",
    ...
  }
```

## 🛡️ Security Notes

1. **Token Storage**: Tokens stored in AsyncStorage (secure on device)
2. **Auto Headers**: All Supabase queries include auth token automatically
3. **RLS Policies**: Database enforces row-level security
4. **Token Refresh**: Automatic token refresh handled by Supabase client
5. **Role Validation**: User role checked on every navigation

## 📱 User Flow Diagram

```
App Start
    ↓
Check AsyncStorage for auth_token
    ↓
    ├─ Token Found
    │   ↓
    │   Verify with /auth/v1/user
    │   ↓
    │   ├─ Valid & role="admin" → Admin Dashboard
    │   ├─ Valid & role="parent" → Parent Dashboard
    │   └─ Invalid → Login Screen
    │
    └─ No Token → Login Screen

Login Screen
    ↓
User enters credentials
    ↓
POST /auth/v1/token?grant_type=password
    ↓
    ├─ Success
    │   ↓
    │   Store auth_token
    │   Load user data
    │   ↓
    │   ├─ role="admin" → Admin Dashboard
    │   └─ role="parent" → Parent Dashboard
    │
    └─ Failure → Show error message

Dashboard
    ↓
User clicks "Sign Out"
    ↓
Clear auth_token & current_user
    ↓
Login Screen
```

## 🧪 Testing Checklist

- [ ] Login with admin account → redirects to admin dashboard
- [ ] Login with parent account → redirects to parent dashboard
- [ ] Login with wrong password → shows error message
- [ ] Close app and reopen → stays logged in
- [ ] Sign out → redirects to login screen
- [ ] Database queries work with authentication
- [ ] RLS policies enforce correct permissions

## 🚨 Common Issues

### "Invalid email or password"
- Check email exists in database
- Verify password is correct
- Ensure user has record in `public.users` table

### Redirected to login after successful sign in
- Check user has `auth_user_id` field set
- Verify user has valid `role` field
- Check console logs for errors

### Database queries fail
- Verify RLS policies are configured
- Check auth token is included (see console logs)
- Ensure user has correct role

## 📚 Related Files

- `contexts/AuthContext.tsx` - Authentication logic
- `lib/supabase.ts` - Supabase client with auth headers
- `app/index.tsx` - Initial routing logic
- `app/login.tsx` - Login screen
- `app/(admin)/dashboard.tsx` - Admin dashboard
- `app/(parent)/dashboard.tsx` - Parent dashboard

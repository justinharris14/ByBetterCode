
# Authentication Quick Reference

## 🔑 Sign Up

```typescript
const { signUp } = useAuth();

const result = await signUp(email, password, {
  first_name: 'John',
  last_name: 'Doe',
  phone: '0123456789',
  role: 'parent', // or 'admin'
  email: email,
});

if (result.success) {
  // Show success message
  // User needs to verify email
} else {
  // Show error: result.message
}
```

## 🔓 Sign In

```typescript
const { signIn } = useAuth();

const result = await signIn(email, password);

if (result.success) {
  // User signed in successfully
  // Will be redirected automatically
} else {
  // Show error: result.message
}
```

## 🚪 Sign Out

```typescript
const { signOut } = useAuth();

await signOut();
// User will be redirected to login
```

## 👤 Get Current User

```typescript
const { user, session, loading } = useAuth();

if (loading) {
  // Show loading spinner
}

if (user) {
  console.log('User:', user.first_name, user.last_name);
  console.log('Role:', user.role);
  console.log('Email:', user.email);
}

if (session) {
  console.log('Session active');
}
```

## 🔒 Check User Role

```typescript
const { user } = useAuth();

if (user?.role === 'admin') {
  // Show admin features
} else if (user?.role === 'parent') {
  // Show parent features
}
```

## 📊 Database Queries with RLS

### Query as Authenticated User

```typescript
// RLS policies automatically filter data
const { data, error } = await supabase
  .from('children')
  .select('*');

// Parents will only see their own children
// Admins will see all children
```

### Check Current User's Role

```typescript
const { data, error } = await supabase
  .rpc('get_user_role');

console.log('Current user role:', data);
```

## 🛡️ RLS Policy Examples

### Users Table

```sql
-- Read all users (needed for app functionality)
CREATE POLICY "Authenticated users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = auth_user_id);
```

### Children Table

```sql
-- Parents see only their children, admins see all
CREATE POLICY "Users can read children based on role"
  ON children FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'admin' OR
    parent_id IN (
      SELECT user_id FROM users 
      WHERE user_id = auth.uid() OR auth_user_id = auth.uid()
    )
  );
```

## 🔧 Helper Functions

### Get User Role

```sql
CREATE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT role FROM users 
  WHERE user_id = auth.uid() OR auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Usage in Policies

```sql
-- Check if user is admin
WHERE get_user_role() = 'admin'

-- Check if user is parent
WHERE get_user_role() = 'parent'
```

## 📧 Email Verification

### Check if Email is Verified

```typescript
const { data: { user } } = await supabase.auth.getUser();

if (user?.email_confirmed_at) {
  console.log('Email verified');
} else {
  console.log('Email not verified');
}
```

### Resend Verification Email

```typescript
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: user.email,
});
```

## 🔄 Session Management

### Get Current Session

```typescript
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  console.log('User is signed in');
  console.log('Access token:', session.access_token);
}
```

### Listen for Auth Changes

```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event);
    
    if (event === 'SIGNED_IN') {
      console.log('User signed in');
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed');
    }
  }
);

// Cleanup
subscription.unsubscribe();
```

## 🧪 Testing Queries

### Test RLS Policies

```sql
-- Sign in as a user first, then run:

-- Should return only your data
SELECT * FROM children;

-- Should return only your payments
SELECT * FROM payments;

-- Check your role
SELECT get_user_role();
```

### Test as Different Roles

```typescript
// Sign in as parent
await signIn('parent@test.com', 'parent123');
// Query data - should see only own data

// Sign out
await signOut();

// Sign in as admin
await signIn('admin@test.com', 'admin123');
// Query data - should see all data
```

## 🚨 Error Handling

### Common Errors

```typescript
// Email not confirmed
if (error.message.includes('Email not confirmed')) {
  Alert.alert('Please verify your email first');
}

// Invalid credentials
if (error.message.includes('Invalid login credentials')) {
  Alert.alert('Wrong email or password');
}

// User already exists
if (error.message.includes('already registered')) {
  Alert.alert('This email is already registered');
}

// Weak password
if (error.message.includes('Password')) {
  Alert.alert('Password must be at least 6 characters');
}
```

## 📱 UI Patterns

### Protected Route

```typescript
function ProtectedScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <YourScreen />;
}
```

### Role-Based Rendering

```typescript
function Dashboard() {
  const { user } = useAuth();

  return (
    <View>
      {user?.role === 'admin' && (
        <AdminFeatures />
      )}
      
      {user?.role === 'parent' && (
        <ParentFeatures />
      )}
    </View>
  );
}
```

### Sign Out Button

```typescript
function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Text>Sign Out</Text>
    </TouchableOpacity>
  );
}
```

## 🔍 Debugging

### Check Auth State

```typescript
// In any component
const { user, session, loading } = useAuth();

console.log('=== AUTH DEBUG ===');
console.log('Loading:', loading);
console.log('User:', user);
console.log('Session:', session);
console.log('Role:', user?.role);
console.log('================');
```

### Check Database User

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', 'user@example.com')
  .single();

console.log('Database user:', data);
```

### Check Auth User

```typescript
const { data: { user }, error } = await supabase.auth.getUser();

console.log('Auth user:', user);
console.log('Email verified:', user?.email_confirmed_at);
console.log('Metadata:', user?.user_metadata);
```

## 📚 Resources

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **RLS Docs**: https://supabase.com/docs/guides/auth/row-level-security
- **Auth Helpers**: https://supabase.com/docs/guides/auth/auth-helpers

## ✅ Checklist

- [ ] User can sign up
- [ ] Email verification works
- [ ] User can sign in
- [ ] User can sign out
- [ ] Session persists
- [ ] RLS policies work
- [ ] Parents see only their data
- [ ] Admins see all data
- [ ] Role-based routing works
- [ ] Error messages are clear

## 🎯 Quick Commands

```bash
# Start dev server
npm run dev

# Check Supabase connection
# (In app console)
console.log(supabase.auth.getSession());

# View database
# Go to: https://supabase.com/dashboard
# Select your project > Table Editor

# View auth users
# Go to: https://supabase.com/dashboard
# Select your project > Authentication > Users
```

---

**Need help?** Check the full guides:
- `AUTHENTICATION_GUIDE.md` - Complete documentation
- `AUTH_QUICK_START.md` - Getting started
- `MIGRATION_FROM_DEMO.md` - Migration guide

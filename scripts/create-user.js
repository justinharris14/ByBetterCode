// Script to create a user in both Supabase Auth and users table
const SUPABASE_URL = 'https://bldlekwvgeatnqjwiowq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGxla3d2Z2VhdG5xandpb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDEwOTcsImV4cCI6MjA3NzA3NzA5N30.S8YzBbuBaCgzy7Dhox0LlLLsXDgIvQep839mgkWI43g';

// ⚠️ EDIT THESE VALUES:
const USER_EMAIL = 'parent@example.com';
const USER_PASSWORD = 'password123';
const FIRST_NAME = 'John';
const LAST_NAME = 'Doe';
const ROLE = 'parent'; // 'admin' or 'parent'
const PHONE = '0123456789';

async function createUser() {
  try {
    console.log('\n🔐 Step 1: Creating user in Supabase Auth...\n');
    
    // Create auth user
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: USER_EMAIL,
        password: USER_PASSWORD,
      })
    });

    const authData = await authResponse.json();
    
    if (!authResponse.ok) {
      console.error('❌ Failed to create auth user:', authData);
      
      // Check if user already exists
      if (authData.msg && authData.msg.includes('already registered')) {
        console.log('\n⚠️  User already exists in Auth. Trying to get existing user...\n');
        
        // Try to sign in to get the user ID
        const signInResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: USER_EMAIL,
            password: USER_PASSWORD,
          })
        });

        const signInData = await signInResponse.json();
        
        if (!signInResponse.ok) {
          console.error('❌ Cannot sign in. User exists but password is wrong.');
          return;
        }
        
        authData.user = signInData.user;
        authData.access_token = signInData.access_token;
        console.log('✅ Found existing auth user:', authData.user.email);
      } else {
        return;
      }
    } else {
      console.log('✅ Auth user created:', authData.user.email);
      console.log('   User ID:', authData.user.id);
    }

    console.log('\n📝 Step 2: Adding user to users table...\n');
    
    // Add to users table
    const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        auth_user_id: authData.user.id,
        email: USER_EMAIL,
        first_name: FIRST_NAME,
        last_name: LAST_NAME,
        role: ROLE,
        phone: PHONE,
        is_active: true,
      })
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      
      // Check if it's a RLS error
      if (errorData.message && errorData.message.includes('row-level security')) {
        console.error('❌ Row-Level Security is blocking the insert.');
        console.log('\n📋 SOLUTION: Run this SQL in Supabase Dashboard:\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`
INSERT INTO public.users (auth_user_id, email, first_name, last_name, role, phone, is_active)
VALUES (
  '${authData.user.id}',
  '${USER_EMAIL}',
  '${FIRST_NAME}',
  '${LAST_NAME}',
  '${ROLE}',
  '${PHONE}',
  true
);
        `);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Go to: https://supabase.com/dashboard');
        console.log('Click: SQL Editor → New Query');
        console.log('Paste the SQL above and click "Run"\n');
        return;
      }
      
      console.error('❌ Failed to add user to table:', errorData);
      return;
    }

    const userData = await userResponse.json();
    console.log('✅ User added to database!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 USER CREATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📧 Email:', USER_EMAIL);
    console.log('🔑 Password:', USER_PASSWORD);
    console.log('👤 Name:', FIRST_NAME, LAST_NAME);
    console.log('🎭 Role:', ROLE);
    console.log('\n💡 You can now log in with these credentials!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createUser();

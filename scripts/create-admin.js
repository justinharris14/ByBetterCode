// Script to create a test admin user
const SUPABASE_URL = 'https://bldlekwvgeatnqjwiowq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGxla3d2Z2VhdG5xandpb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDEwOTcsImV4cCI6MjA3NzA3NzA5N30.S8YzBbuBaCgzy7Dhox0LlLLsXDgIvQep839mgkWI43g';

async function createAdminUser() {
  const email = 'admin@example.com';
  const password = 'admin123456';
  
  try {
    console.log('🔐 Creating admin user in Supabase Auth...\n');
    
    // Step 1: Create auth user
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm email
      })
    });

    const authData = await authResponse.json();
    
    if (!authResponse.ok) {
      console.error('❌ Failed to create auth user:', authData);
      return;
    }

    console.log('✅ Auth user created:', authData.user.email);
    console.log('   User ID:', authData.user.id);

    // Step 2: Add user to users table
    console.log('\n📝 Adding user to users table...\n');
    
    const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: authData.user.id,
        email: email,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        phone: '0123456789',
        is_active: true,
      })
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('❌ Failed to add user to table:', errorData);
      return;
    }

    const userData = await userResponse.json();
    console.log('✅ User added to database!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Role: admin');
    console.log('\n💡 Use these credentials to log in to your app!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser();

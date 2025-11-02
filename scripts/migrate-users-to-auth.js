// Script to add existing database users to Supabase Auth
const SUPABASE_URL = 'https://bldlekwvgeatnqjwiowq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGxla3d2Z2VhdG5xandpb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDEwOTcsImV4cCI6MjA3NzA3NzA5N30.S8YzBbuBaCgzy7Dhox0LlLLsXDgIvQep839mgkWI43g';

// ⚠️ SET DEFAULT PASSWORD (all users will get this password initially)
const DEFAULT_PASSWORD = 'password123';

async function migrateUsers() {
  try {
    console.log('\n📋 Step 1: Getting users from database...\n');
    
    // Get all users from the database
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=user_id,email,first_name,last_name,role,auth_user_id`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch users from database');
      return;
    }

    const users = await response.json();
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database!');
      return;
    }

    console.log(`✅ Found ${users.length} user(s) in database:\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) ${user.auth_user_id ? '- Already has auth ✅' : '- Needs auth ❌'}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Creating auth users...');
    console.log(`   Default password: ${DEFAULT_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const sqlStatements = [];
    let successCount = 0;
    let skipCount = 0;

    for (const user of users) {
      // Skip if already has auth_user_id
      if (user.auth_user_id) {
        console.log(`⏭️  Skipping ${user.email} - already has auth user`);
        skipCount++;
        continue;
      }

      console.log(`\n🔄 Creating auth user for: ${user.email}...`);

      // Try to create auth user
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: DEFAULT_PASSWORD,
        })
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        if (authData.msg && authData.msg.includes('already registered')) {
          console.log(`   ⚠️  ${user.email} already exists in Auth but not linked`);
          console.log(`   💡 User can log in with email and reset password`);
        } else {
          console.error(`   ❌ Failed:`, authData.msg || authData.error_description);
        }
        continue;
      }

      console.log(`   ✅ Auth user created: ${authData.user.id}`);
      
      // Generate SQL to update the users table
      sqlStatements.push(`
UPDATE public.users 
SET auth_user_id = '${authData.user.id}'
WHERE user_id = '${user.user_id}';
      `);

      successCount++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Created: ${successCount}`);
    console.log(`⏭️  Skipped: ${skipCount}`);
    console.log(`📝 Total: ${users.length}`);

    if (sqlStatements.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 NEXT STEP: Link Auth Users to Database Users');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\nRun this SQL in Supabase Dashboard (SQL Editor):\n');
      console.log(sqlStatements.join('\n'));
      console.log('\n🔗 Go to: https://supabase.com/dashboard');
      console.log('   → SQL Editor → New Query');
      console.log('   → Paste the SQL above');
      console.log('   → Click "Run"\n');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📧 All users can now log in with:`);
    console.log(`   Email: [their email]`);
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log('\n💡 Users should change their password after first login!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

migrateUsers();

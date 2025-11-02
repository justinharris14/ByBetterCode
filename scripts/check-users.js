// Quick script to check existing users in the database
const SUPABASE_URL = 'https://bldlekwvgeatnqjwiowq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGxla3d2Z2VhdG5xandpb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDEwOTcsImV4cCI6MjA3NzA3NzA5N30.S8YzBbuBaCgzy7Dhox0LlLLsXDgIvQep839mgkWI43g';

async function checkUsers() {
  try {
    console.log('Checking users in database...\n');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=email,role,first_name,last_name`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });

    if (!response.ok) {
      console.error('Error:', response.status, response.statusText);
      return;
    }

    const users = await response.json();
    
    if (users.length === 0) {
      console.log('❌ No users found in the database!');
      console.log('\nYou need to create a user first.');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Name: ${user.first_name} ${user.last_name}\n`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsers();

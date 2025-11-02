/**
 * Script to programmatically add parent users to Supabase
 * Run this with: npx ts-node scripts/add-parent-users.ts
 * 
 * NOTE: This requires admin privileges via service role key
 * DO NOT expose service role key in production code
 */

import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations (NEVER expose in client code!)
const SUPABASE_URL = 'https://bldlekwvgeatnqjwiowq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Replace with your service role key

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ===========================
// PARENT USER DATA
// ===========================

const parentUsers = [
  {
    email: 'sarah.johnson@example.com',
    password: 'SecurePassword123!',
    first_name: 'Sarah',
    last_name: 'Johnson',
    phone: '+27821234567',
    address: '12 Garden Avenue',
    city: 'Cape Town',
    postal_code: '8001',
    id_number: '8905125800087',
    work_phone: '+27215551234',
    emergency_contact_name: 'James Johnson',
    emergency_contact_phone: '+27823456780',
    emergency_contact_relationship: 'Spouse',
  },
  {
    email: 'michael.smith@example.com',
    password: 'SecurePassword123!',
    first_name: 'Michael',
    last_name: 'Smith',
    phone: '+27822345678',
    address: '56 Beach Road',
    city: 'Durban',
    postal_code: '4001',
    id_number: '8712225800088',
    work_phone: '+27315552345',
    emergency_contact_name: 'Emma Smith',
    emergency_contact_phone: '+27834567891',
    emergency_contact_relationship: 'Spouse',
  },
  {
    email: 'zanele.moyo@example.com',
    password: 'SecurePassword123!',
    first_name: 'Zanele',
    last_name: 'Moyo',
    phone: '+27823456789',
    address: '89 Park Street',
    city: 'Johannesburg',
    postal_code: '2000',
    id_number: '9101125900089',
    work_phone: '+27115553456',
    emergency_contact_name: 'Thandi Moyo',
    emergency_contact_phone: '+27845678902',
    emergency_contact_relationship: 'Sister',
  },
  {
    email: 'david.lee@example.com',
    password: 'SecurePassword123!',
    first_name: 'David',
    last_name: 'Lee',
    phone: '+27824567890',
    address: '34 Mountain View',
    city: 'Pretoria',
    postal_code: '0002',
    id_number: '8203035800090',
    work_phone: '+27125554567',
    emergency_contact_name: 'Linda Lee',
    emergency_contact_phone: '+27856789013',
    emergency_contact_relationship: 'Spouse',
  },
  {
    email: 'nomvula.zulu@example.com',
    password: 'SecurePassword123!',
    first_name: 'Nomvula',
    last_name: 'Zulu',
    phone: '+27825678901',
    address: '67 Valley Drive',
    city: 'Port Elizabeth',
    postal_code: '6001',
    id_number: '9402145900091',
    work_phone: '+27415555678',
    emergency_contact_name: 'Sibusiso Zulu',
    emergency_contact_phone: '+27867890124',
    emergency_contact_relationship: 'Brother',
  },
];

// ===========================
// ADD PARENT USERS
// ===========================

async function addParentUser(userData: typeof parentUsers[0]) {
  console.log(`\n🔄 Adding parent: ${userData.first_name} ${userData.last_name} (${userData.email})`);

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: 'parent',
      },
    });

    if (authError || !authData.user) {
      console.error(`❌ Error creating auth user: ${authError?.message}`);
      return { success: false, error: authError };
    }

    console.log(`✅ Auth user created with ID: ${authData.user.id}`);

    // 2. Create/update user profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        user_id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        role: 'parent',
        is_active: true,
        address: userData.address,
        city: userData.city,
        postal_code: userData.postal_code,
        id_number: userData.id_number,
        work_phone: userData.work_phone,
        emergency_contact_name: userData.emergency_contact_name,
        emergency_contact_phone: userData.emergency_contact_phone,
        emergency_contact_relationship: userData.emergency_contact_relationship,
      });

    if (profileError) {
      console.error(`❌ Error creating user profile: ${profileError.message}`);
      return { success: false, error: profileError };
    }

    console.log(`✅ User profile created successfully`);
    return { success: true, user_id: authData.user.id };
  } catch (error) {
    console.error(`❌ Unexpected error: ${error}`);
    return { success: false, error };
  }
}

// ===========================
// MAIN EXECUTION
// ===========================

async function main() {
  console.log('🚀 Starting parent user creation process...\n');
  console.log('⚠️  Make sure you have replaced SUPABASE_SERVICE_ROLE_KEY with your actual service role key!\n');

  if (SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ ERROR: Please replace SUPABASE_SERVICE_ROLE_KEY with your actual service role key');
    process.exit(1);
  }

  const results = [];

  for (const userData of parentUsers) {
    const result = await addParentUser(userData);
    results.push({ ...userData, ...result });
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n\n📊 Summary:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successfully created: ${successful.length} users`);
  console.log(`❌ Failed: ${failed.length} users`);

  if (successful.length > 0) {
    console.log('\n✅ Successfully created users:');
    successful.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email})`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed users:');
    failed.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`     Error: ${user.error}`);
    });
  }

  console.log('\n✨ Process complete!');
}

// Run the script
main().catch(console.error);

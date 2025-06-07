// Test script to manually trigger company profile generation
// Run with: node test-company-profile.js

const supabaseUrl = 'https://nhlsrtubyvggtkyrhkuu.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

async function testCompanyProfileGeneration() {
  try {
    console.log('🧪 Testing company profile generation...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-company-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        session_id: 'test-session-id',
        job_title: 'Software Engineer',
        industry: 'Technology'
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testCompanyProfileGeneration(); 
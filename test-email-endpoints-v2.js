// Test script for email endpoints - Testing different path structures
// Run with: node test-email-endpoints-v2.js

const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:pYeQctVX';

console.log('🧪 Testing Email Endpoints - Multiple Path Structures');
console.log('📍 XANO Base URL:', XANO_BASE_URL);
console.log('');

// Test different possible endpoint structures
async function testEndpointPaths() {
  const possiblePaths = [
    '/email_contacts',           // Direct path
    '/email/contacts',           // Group path
    '/email/email_contacts',     // Group + table name
    '/contacts',                 // Short path
  ];

  console.log('Testing possible contact endpoint paths...');
  console.log('');

  for (const path of possiblePaths) {
    console.log(`Testing: ${XANO_BASE_URL}${path}`);
    try {
      const response = await fetch(`${XANO_BASE_URL}${path}`);
      const status = response.status;
      
      if (status === 200) {
        const data = await response.json();
        console.log(`✅ SUCCESS! Status: ${status}`);
        console.log(`📊 Data:`, JSON.stringify(data, null, 2));
        console.log(`🎯 Working path: ${path}`);
        console.log('');
        return path;
      } else {
        console.log(`❌ Status: ${status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('⚠️  None of the standard paths worked. Let me try group paths...');
  console.log('');

  // Test group-based paths
  const groupPaths = [
    '/email/get_contacts',
    '/email/list_contacts',
    '/email/contacts/list',
    '/email/contacts/get',
  ];

  for (const path of groupPaths) {
    console.log(`Testing: ${XANO_BASE_URL}${path}`);
    try {
      const response = await fetch(`${XANO_BASE_URL}${path}`);
      const status = response.status;
      
      if (status === 200) {
        const data = await response.json();
        console.log(`✅ SUCCESS! Status: ${status}`);
        console.log(`📊 Data:`, JSON.stringify(data, null, 2));
        console.log(`🎯 Working path: ${path}`);
        console.log('');
        return path;
      } else {
        console.log(`❌ Status: ${status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }

  return null;
}

// Run the test
testEndpointPaths().then(workingPath => {
  console.log('═══════════════════════════════════════════════════════');
  if (workingPath) {
    console.log(`✅ Found working endpoint: ${workingPath}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Update the service files to use this path structure');
    console.log('2. Test all CRUD operations');
  } else {
    console.log('❌ Could not find working endpoint');
    console.log('');
    console.log('Please provide the exact endpoint path from Xano.');
    console.log('You can find this in Xano under API > email group');
  }
  console.log('═══════════════════════════════════════════════════════');
}).catch(error => {
  console.error('Fatal error:', error);
});
// Test script for email marketing endpoints
// Run with: node test-email-marketing-endpoints.js

const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:pYeQctVX';

console.log('🧪 Testing Email Marketing Endpoints');
console.log('📍 XANO Base URL:', XANO_BASE_URL);
console.log('');

// Test with "email marketing" group path
async function testEmailMarketingEndpoints() {
  const possiblePaths = [
    '/email marketing/contacts',
    '/email_marketing/contacts',
    '/emailmarketing/contacts',
    '/email-marketing/contacts',
    '/email marketing/email_contacts',
    '/email_marketing/email_contacts',
  ];

  console.log('Testing email marketing endpoint paths...');
  console.log('');

  for (const path of possiblePaths) {
    const url = `${XANO_BASE_URL}${path}`;
    console.log(`Testing: ${url}`);
    try {
      const response = await fetch(url);
      const status = response.status;
      
      console.log(`Status: ${status}`);
      
      if (status === 200) {
        const data = await response.json();
        console.log(`✅ SUCCESS!`);
        console.log(`📊 Data:`, JSON.stringify(data, null, 2));
        console.log(`🎯 Working path: ${path}`);
        console.log('');
        return path;
      } else if (status !== 404) {
        const text = await response.text();
        console.log(`Response:`, text);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }

  return null;
}

// Run the test
testEmailMarketingEndpoints().then(workingPath => {
  console.log('═══════════════════════════════════════════════════════');
  if (workingPath) {
    console.log(`✅ Found working endpoint: ${workingPath}`);
    console.log('');
    console.log('I will now update the service files to use this path structure.');
  } else {
    console.log('❌ Could not find working endpoint');
    console.log('');
    console.log('Please check the exact endpoint name in Xano.');
  }
  console.log('═══════════════════════════════════════════════════════');
}).catch(error => {
  console.error('Fatal error:', error);
});
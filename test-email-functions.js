// Test script for email service functions
// Run with: node test-email-functions.js

const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

console.log('🧪 Testing Email Service Functions');
console.log('📍 XANO Base URL:', XANO_BASE_URL);
console.log('');

// Test 1: Get all contacts
async function testGetContacts() {
  console.log('Test 1: Getting all contacts...');
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_contacts`);
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
    console.log('📈 Total contacts:', Array.isArray(data) ? data.length : 'N/A');
    console.log('');
    return { success: true, data };
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
    return { success: false, error: error.message };
  }
}

// Test 2: Get all groups
async function testGetGroups() {
  console.log('Test 2: Getting all groups...');
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_groups`);
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
    console.log('📈 Total groups:', Array.isArray(data) ? data.length : 'N/A');
    console.log('');
    return { success: true, data };
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
    return { success: false, error: error.message };
  }
}

// Test 3: Create a test contact
async function testCreateContact() {
  console.log('Test 3: Creating a test contact...');
  try {
    const testContact = {
      email: `test${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'User',
      member_type: 'non-member',
      status: 'subscribed'
    };
    
    console.log('📤 Sending:', JSON.stringify(testContact, null, 2));
    
    const response = await fetch(`${XANO_BASE_URL}/email_contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testContact),
    });
    
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
    console.log('');
    return { success: true, data };
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
    return { success: false, error: error.message };
  }
}

// Test 4: Create a test group
async function testCreateGroup() {
  console.log('Test 4: Creating a test group...');
  try {
    const testGroup = {
      name: `Test Group ${Date.now()}`,
      description: 'This is a test group created by the test script'
    };
    
    console.log('📤 Sending:', JSON.stringify(testGroup, null, 2));
    
    const response = await fetch(`${XANO_BASE_URL}/email_groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testGroup),
    });
    
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
    console.log('');
    return { success: true, data };
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
    return { success: false, error: error.message };
  }
}

// Test 5: Update a contact
async function testUpdateContact(contactId) {
  console.log(`Test 5: Updating contact ${contactId}...`);
  try {
    const updateData = {
      first_name: 'Updated',
      last_name: 'Name'
    };
    
    console.log('📤 Sending:', JSON.stringify(updateData, null, 2));
    
    const response = await fetch(`${XANO_BASE_URL}/email_contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
    console.log('');
    return { success: true, data };
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
    return { success: false, error: error.message };
  }
}

// Test 6: Delete a contact
async function testDeleteContact(contactId) {
  console.log(`Test 6: Deleting contact ${contactId}...`);
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_contacts/${contactId}`, {
      method: 'DELETE',
    });
    
    console.log('✅ Status:', response.status);
    
    if (response.status === 204) {
      console.log('✅ Contact deleted successfully (204 No Content)');
    } else {
      const data = await response.json();
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    }
    
    console.log('');
    return { success: true };
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 Starting Email Service Tests');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Get contacts
  const test1 = await testGetContacts();
  results.tests.push({ name: 'Get Contacts', success: test1.success });
  if (test1.success) results.passed++; else results.failed++;
  
  // Test 2: Get groups
  const test2 = await testGetGroups();
  results.tests.push({ name: 'Get Groups', success: test2.success });
  if (test2.success) results.passed++; else results.failed++;
  
  // Test 3: Create contact
  const test3 = await testCreateContact();
  results.tests.push({ name: 'Create Contact', success: test3.success });
  if (test3.success) results.passed++; else results.failed++;
  
  let createdContactId = null;
  if (test3.success && test3.data && test3.data.id) {
    createdContactId = test3.data.id;
  }
  
  // Test 4: Create group
  const test4 = await testCreateGroup();
  results.tests.push({ name: 'Create Group', success: test4.success });
  if (test4.success) results.passed++; else results.failed++;
  
  // Test 5: Update contact (if we created one)
  if (createdContactId) {
    const test5 = await testUpdateContact(createdContactId);
    results.tests.push({ name: 'Update Contact', success: test5.success });
    if (test5.success) results.passed++; else results.failed++;
    
    // Test 6: Delete contact
    const test6 = await testDeleteContact(createdContactId);
    results.tests.push({ name: 'Delete Contact', success: test6.success });
    if (test6.success) results.passed++; else results.failed++;
  } else {
    console.log('⚠️  Skipping update and delete tests (no contact ID available)');
    console.log('');
  }
  
  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 Test Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  
  results.tests.forEach((test, index) => {
    const icon = test.success ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}: ${test.name}`);
  });
  
  console.log('');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.tests.length}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
}

// Run the tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
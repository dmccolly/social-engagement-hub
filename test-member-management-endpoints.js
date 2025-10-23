const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, endpoint, body = null) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Testing: ${name}`, 'blue');
  log(`${method} ${endpoint}`, 'yellow');
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
      log(`Request Body: ${JSON.stringify(body, null, 2)}`, 'yellow');
    }
    
    const response = await fetch(`${XANO_BASE_URL}${endpoint}`, options);
    const statusColor = response.ok ? 'green' : 'red';
    log(`Status: ${response.status} ${response.statusText}`, statusColor);
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      log(`Response: ${JSON.stringify(data, null, 2)}`, statusColor);
    } else if (contentType && contentType.includes('text/csv')) {
      data = await response.text();
      log(`CSV Response (first 200 chars): ${data.substring(0, 200)}...`, statusColor);
    } else {
      data = await response.text();
      log(`Response: ${data}`, statusColor);
    }
    
    if (response.ok) {
      log('✓ Test PASSED', 'green');
    } else {
      log('✗ Test FAILED', 'red');
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    log(`✗ Test ERROR: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('MEMBER MANAGEMENT ENDPOINTS TEST SUITE', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };
  
  let createdMemberId = null;
  
  log('\n📋 TEST GROUP: Member CRUD Operations', 'blue');
  
  const test1 = await testEndpoint(
    '1. GET /members - List all members',
    'GET',
    '/members'
  );
  results.total++;
  if (test1.success) results.passed++;
  else results.failed++;
  
  const test2 = await testEndpoint(
    '2. GET /members - List with filters (role=member)',
    'GET',
    '/members?role=member&status=active'
  );
  results.total++;
  if (test2.success) results.passed++;
  else results.failed++;
  
  const test3 = await testEndpoint(
    '3. GET /members - List with pagination',
    'GET',
    '/members?page=1&per_page=10'
  );
  results.total++;
  if (test3.success) results.passed++;
  else results.failed++;
  
  const test4 = await testEndpoint(
    '4. POST /members - Create new member',
    'POST',
    '/members',
    {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      role: 'member',
      status: 'active',
      phone: '+1234567890',
      bio: 'Test member bio',
      location: 'New York, NY',
      website: 'https://example.com',
      social_links: {
        twitter: 'https://twitter.com/testuser',
        linkedin: 'https://linkedin.com/in/testuser'
      },
      preferences: {
        email_notifications: true,
        newsletter: true
      },
      avatar_url: 'https://example.com/avatar.jpg'
    }
  );
  results.total++;
  if (test4.success) {
    results.passed++;
    createdMemberId = test4.data?.id;
    log(`Created member ID: ${createdMemberId}`, 'green');
  } else {
    results.failed++;
  }
  
  if (createdMemberId) {
    const test5 = await testEndpoint(
      '5. GET /members/{member_id} - Get single member',
      'GET',
      `/members/${createdMemberId}`
    );
    results.total++;
    if (test5.success) results.passed++;
    else results.failed++;
    
    const test6 = await testEndpoint(
      '6. PATCH /members/{member_id} - Update member',
      'PATCH',
      `/members/${createdMemberId}`,
      {
        name: 'Updated Test User',
        bio: 'Updated bio text',
        location: 'San Francisco, CA'
      }
    );
    results.total++;
    if (test6.success) results.passed++;
    else results.failed++;
  }
  
  log('\n📊 TEST GROUP: Member Activity Tracking', 'blue');
  
  if (createdMemberId) {
    const test7 = await testEndpoint(
      '7. POST /members/{member_id}/activity - Track post',
      'POST',
      `/members/${createdMemberId}/activity`,
      {
        activity_type: 'post',
        increment: 1
      }
    );
    results.total++;
    if (test7.success) results.passed++;
    else results.failed++;
    
    const test8 = await testEndpoint(
      '8. POST /members/{member_id}/activity - Track comment',
      'POST',
      `/members/${createdMemberId}/activity`,
      {
        activity_type: 'comment',
        increment: 1
      }
    );
    results.total++;
    if (test8.success) results.passed++;
    else results.failed++;
    
    const test9 = await testEndpoint(
      '9. POST /members/{member_id}/activity - Track like',
      'POST',
      `/members/${createdMemberId}/activity`,
      {
        activity_type: 'like',
        increment: 1
      }
    );
    results.total++;
    if (test9.success) results.passed++;
    else results.failed++;
  }
  
  log('\n🔍 TEST GROUP: Member Search and Statistics', 'blue');
  
  const test10 = await testEndpoint(
    '10. GET /members/search - Search members',
    'GET',
    '/members/search?q=test&limit=10'
  );
  results.total++;
  if (test10.success) results.passed++;
  else results.failed++;
  
  const test11 = await testEndpoint(
    '11. GET /members/stats - Get member statistics',
    'GET',
    '/members/stats'
  );
  results.total++;
  if (test11.success) results.passed++;
  else results.failed++;
  
  log('\n📤 TEST GROUP: Member Export', 'blue');
  
  const test12 = await testEndpoint(
    '12. GET /members/export - Export all members to CSV',
    'GET',
    '/members/export'
  );
  results.total++;
  if (test12.success) results.passed++;
  else results.failed++;
  
  const test13 = await testEndpoint(
    '13. GET /members/export - Export with filters',
    'GET',
    '/members/export?role=member&status=active'
  );
  results.total++;
  if (test13.success) results.passed++;
  else results.failed++;
  
  log('\n🔄 TEST GROUP: Bulk Operations', 'blue');
  
  if (createdMemberId) {
    const test14 = await testEndpoint(
      '14. POST /members/bulk-update - Bulk update members',
      'POST',
      '/members/bulk-update',
      {
        member_ids: [createdMemberId],
        updates: {
          status: 'active',
          role: 'contributor'
        }
      }
    );
    results.total++;
    if (test14.success) results.passed++;
    else results.failed++;
  }
  
  log('\n🗑️  TEST GROUP: Member Deletion', 'blue');
  
  if (createdMemberId) {
    const test15 = await testEndpoint(
      '15. DELETE /members/{member_id} - Delete member',
      'DELETE',
      `/members/${createdMemberId}`
    );
    results.total++;
    if (test15.success) results.passed++;
    else results.failed++;
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`, 
      results.failed === 0 ? 'green' : 'yellow');
  log('='.repeat(60) + '\n', 'cyan');
  
  if (results.failed === 0) {
    log('✓ ALL TESTS PASSED!', 'green');
  } else {
    log('✗ SOME TESTS FAILED', 'red');
  }
}

runTests().catch(error => {
  log(`\n✗ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});

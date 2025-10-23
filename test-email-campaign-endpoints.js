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
    } else if (contentType && contentType.includes('image/gif')) {
      log(`Response: 1x1 transparent GIF (tracking pixel)`, statusColor);
      data = { type: 'tracking_pixel' };
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
  log('EMAIL CAMPAIGN ENDPOINTS TEST SUITE', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };
  
  let createdCampaignId = null;
  let trackingToken = 'test-tracking-token-' + Date.now();
  
  log('\n📧 TEST GROUP: Campaign CRUD Operations', 'blue');
  
  const test1 = await testEndpoint(
    '1. GET /email_campaigns - List all campaigns',
    'GET',
    '/email_campaigns'
  );
  results.total++;
  if (test1.success) results.passed++;
  else results.failed++;
  
  const test2 = await testEndpoint(
    '2. GET /email_campaigns - List with filters (status=draft)',
    'GET',
    '/email_campaigns?status=draft&type=newsletter'
  );
  results.total++;
  if (test2.success) results.passed++;
  else results.failed++;
  
  const test3 = await testEndpoint(
    '3. GET /email_campaigns - List with pagination',
    'GET',
    '/email_campaigns?page=1&per_page=10'
  );
  results.total++;
  if (test3.success) results.passed++;
  else results.failed++;
  
  const test4 = await testEndpoint(
    '4. POST /email_campaigns - Create new campaign',
    'POST',
    '/email_campaigns',
    {
      name: `Test Campaign ${Date.now()}`,
      subject: 'Test Email Subject',
      from_name: 'Test Sender',
      from_email: 'sender@example.com',
      reply_to: 'reply@example.com',
      html_content: '<html><body><h1>Test Email</h1><p>This is a test email campaign.</p></body></html>',
      plain_text_content: 'Test Email\n\nThis is a test email campaign.',
      type: 'newsletter'
    }
  );
  results.total++;
  if (test4.success) {
    results.passed++;
    createdCampaignId = test4.data?.id;
    log(`Created campaign ID: ${createdCampaignId}`, 'green');
  } else {
    results.failed++;
  }
  
  if (createdCampaignId) {
    const test5 = await testEndpoint(
      '5. GET /email_campaigns/{campaign_id} - Get single campaign',
      'GET',
      `/email_campaigns/${createdCampaignId}`
    );
    results.total++;
    if (test5.success) results.passed++;
    else results.failed++;
    
    const test6 = await testEndpoint(
      '6. PATCH /email_campaigns/{campaign_id} - Update campaign',
      'PATCH',
      `/email_campaigns/${createdCampaignId}`,
      {
        name: 'Updated Test Campaign',
        subject: 'Updated Email Subject',
        html_content: '<html><body><h1>Updated Email</h1><p>This campaign has been updated.</p></body></html>'
      }
    );
    results.total++;
    if (test6.success) results.passed++;
    else results.failed++;
  }
  
  log('\n📤 TEST GROUP: Campaign Sending', 'blue');
  
  if (createdCampaignId) {
    const test7 = await testEndpoint(
      '7. POST /email_campaigns/{campaign_id}/send - Send campaign',
      'POST',
      `/email_campaigns/${createdCampaignId}/send`,
      {
        group_ids: [1, 2],
        contact_ids: [10, 20, 30],
        send_to_all: false,
        schedule_for: null
      }
    );
    results.total++;
    if (test7.success) results.passed++;
    else results.failed++;
  }
  
  log('\n📊 TEST GROUP: Campaign Analytics', 'blue');
  
  if (createdCampaignId) {
    const test8 = await testEndpoint(
      '8. GET /email_campaigns/{campaign_id}/analytics - Get campaign analytics',
      'GET',
      `/email_campaigns/${createdCampaignId}/analytics`
    );
    results.total++;
    if (test8.success) results.passed++;
    else results.failed++;
  }
  
  log('\n🔍 TEST GROUP: Email Tracking', 'blue');
  
  const test9 = await testEndpoint(
    '9. GET /track/open/{tracking_token} - Track email open',
    'GET',
    `/track/open/${trackingToken}`
  );
  results.total++;
  if (test9.success || test9.status === 404) {
    results.passed++;
    log('Note: 404 is acceptable if tracking token does not exist', 'yellow');
  } else {
    results.failed++;
  }
  
  const test10 = await testEndpoint(
    '10. GET /track/click/{tracking_token} - Track link click',
    'GET',
    `/track/click/${trackingToken}?url=https://example.com/product`
  );
  results.total++;
  if (test10.success || test10.status === 302 || test10.status === 404) {
    results.passed++;
    log('Note: 302 (redirect) or 404 are acceptable responses', 'yellow');
  } else {
    results.failed++;
  }
  
  log('\n🗑️  TEST GROUP: Campaign Deletion', 'blue');
  
  if (createdCampaignId) {
    const test11 = await testEndpoint(
      '11. DELETE /email_campaigns/{campaign_id} - Delete campaign',
      'DELETE',
      `/email_campaigns/${createdCampaignId}`
    );
    results.total++;
    if (test11.success) results.passed++;
    else results.failed++;
  }
  
  log('\n📋 TEST GROUP: Additional Campaign Features', 'blue');
  
  const test12 = await testEndpoint(
    '12. GET /email_campaigns - Search campaigns',
    'GET',
    '/email_campaigns?search=test'
  );
  results.total++;
  if (test12.success) results.passed++;
  else results.failed++;
  
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
    log('\nNote: Some failures may be expected if Xano endpoints are not yet implemented.', 'yellow');
    log('This test suite validates the API contract and can be used to verify implementation.', 'yellow');
  }
}

runTests().catch(error => {
  log(`\n✗ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});

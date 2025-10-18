// Integration Script - Adds visitor system to existing App.js
// This script safely integrates the visitor components without breaking existing functionality

const fs = require('fs');
const path = require('path');

// Read the current App.js
const currentAppPath = 'src/App.js';
const integrationPath = 'src/App_INTEGRATION.js';

console.log('🚀 Starting visitor system integration...');

try {
  // Read current App.js
  const currentApp = fs.readFileSync(currentAppPath, 'utf8');
  
  // Check if visitor system is already integrated
  if (currentApp.includes('EnhancedNewsFeedIntegration')) {
    console.log('✅ Visitor system appears to already be integrated!');
    process.exit(0);
  }

  // Read the integration file
  const integrationContent = fs.readFileSync(integrationPath, 'utf8');

  // Create backup of current App.js
  const backupPath = 'src/App_backup_pre_visitor.js';
  fs.writeFileSync(backupPath, currentApp);
  console.log('💾 Backup created:', backupPath);

  // Replace the current App.js with integrated version
  fs.writeFileSync(currentAppPath, integrationContent);
  console.log('✅ Successfully integrated visitor system into App.js');

  // Verify the integration
  const newApp = fs.readFileSync(currentAppPath, 'utf8');
  
  const checks = [
    { name: 'Visitor Registration Import', pattern: 'VisitorRegistrationForm' },
    { name: 'Admin Dashboard Import', pattern: 'AdminDashboardIntegration' },
    { name: 'Security Service Import', pattern: 'VisitorSecurityService' },
    { name: 'Enhanced NewsFeed', pattern: 'EnhancedNewsFeed' },
    { name: 'Admin Route', pattern: '/admin/*' },
    { name: 'Visitor Session State', pattern: 'visitorSession' }
  ];

  console.log('\n🔍 Verifying integration:');
  checks.forEach(check => {
    const found = newApp.includes(check.pattern);
    console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'Found' : 'Missing'}`);
  });

  console.log('\n🎉 Integration complete! Your App.js now includes:');
  console.log('• Visitor registration system');
  console.log('• Admin dashboard with moderation');
  console.log('• Auto-approval content moderation');
  console.log('• Security & spam prevention');
  console.log('• Visitor analytics & tracking');
  console.log('• Professional admin interface');

  console.log('\n📋 Next steps:');
  console.log('1. Test the visitor registration flow');
  console.log('2. Check admin dashboard at /admin/dashboard');
  console.log('3. Verify auto-approval is working');
  console.log('4. Monitor visitor engagement metrics');

} catch (error) {
  console.error('❌ Integration failed:', error.message);
  process.exit(1);
}
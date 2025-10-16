const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting comprehensive section test...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  try {
    // Navigate to app
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✅ App loaded\n');
    
    // Test Home
    console.log('2. Testing Home section...');
    const homeContent = await page.content();
    const hasHome = homeContent.includes('Welcome to Social Engagement Hub');
    console.log(hasHome ? '✅ Home section working' : '❌ Home section failed');
    console.log('');
    
    // Test Blog
    console.log('3. Testing Blog section...');
    await page.click('button:nth-of-type(2)'); // Blog button
    await page.waitForTimeout(2000);
    const blogContent = await page.content();
    const hasBlog = blogContent.includes('Blog Management') && blogContent.includes('New Post');
    console.log(hasBlog ? '✅ Blog section working' : '❌ Blog section failed');
    console.log('');
    
    // Test News Feed
    console.log('4. Testing News Feed section...');
    await page.click('button:nth-of-type(3)'); // News Feed button
    await page.waitForTimeout(2000);
    const feedContent = await page.content();
    const hasFeed = feedContent.includes('News Feed') || feedContent.includes('newsfeed');
    console.log(hasFeed ? '✅ News Feed section working' : '❌ News Feed section failed');
    console.log('');
    
    // Test Email
    console.log('5. Testing Email section...');
    await page.click('button:nth-of-type(4)'); // Email button
    await page.waitForTimeout(2000);
    const emailContent = await page.content();
    const hasEmail = emailContent.includes('Email Campaigns') && emailContent.includes('New Campaign');
    console.log(hasEmail ? '✅ Email section working' : '❌ Email section failed');
    console.log('');
    
    // Test Admin
    console.log('6. Testing Admin section...');
    await page.click('button:nth-of-type(5)'); // Admin button
    await page.waitForTimeout(2000);
    const adminContent = await page.content();
    const hasAdmin = adminContent.includes('Admin');
    console.log(hasAdmin ? '✅ Admin section working' : '❌ Admin section failed');
    console.log('');
    
    // Test Analytics
    console.log('7. Testing Analytics section...');
    await page.click('button:nth-of-type(6)'); // Analytics button
    await page.waitForTimeout(2000);
    const analyticsContent = await page.content();
    const hasAnalytics = analyticsContent.includes('Analytics');
    console.log(hasAnalytics ? '✅ Analytics section working' : '❌ Analytics section failed');
    console.log('');
    
    // Test Settings
    console.log('8. Testing Settings section...');
    await page.click('button:nth-of-type(7)'); // Settings button
    await page.waitForTimeout(2000);
    const settingsContent = await page.content();
    const hasSettings = settingsContent.includes('Settings');
    console.log(hasSettings ? '✅ Settings section working' : '❌ Settings section failed');
    console.log('');
    
    console.log('=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Error during testing:', error.message);
  } finally {
    await browser.close();
  }
})();
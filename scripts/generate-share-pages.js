const fs = require('fs');
const path = require('path');
const https = require('https');

// Xano API configuration - use the actual API URL from _redirects
const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

/**
 * Fetch data from Xano API
 */
function fetchFromXano(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${XANO_BASE_URL}${endpoint}`;
    console.log(`Fetching: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Extract first image URL from HTML content
 */
function extractFirstImage(html) {
  if (!html) return null;
  const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

/**
 * Strip HTML tags and get plain text
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Escape HTML entities
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate HTML page for a post
 */
function generatePostHtml(post, siteUrl) {
  const postUrl = `${siteUrl}/newsfeed/post/${post.id}`;
  const plainText = stripHtml(post.content).substring(0, 200);
  const image = extractFirstImage(post.content);
  // Extract author name from various possible fields
  const author = post.author_name || post.author?.name || post.author || 'Anonymous';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(author)}'s Post - Social Engagement Hub</title>
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${postUrl}">
  <meta property="og:title" content="${escapeHtml(author)}'s Post">
  <meta property="og:description" content="${escapeHtml(plainText)}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
  <meta property="og:site_name" content="Social Engagement Hub">
  <meta property="article:published_time" content="${post.created_at}">
  <meta property="article:author" content="${escapeHtml(author)}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${postUrl}">
  <meta name="twitter:title" content="${escapeHtml(author)}'s Post">
  <meta name="twitter:description" content="${escapeHtml(plainText)}">
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : ''}
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      background: #f9fafb;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .post-header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .post-meta {
      color: #6b7280;
      font-size: 14px;
      margin-top: 10px;
    }
    .post-content {
      margin: 20px 0;
      color: #374151;
    }
    .post-image {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 20px 0;
    }
    .cta-button {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 20px;
    }
    .cta-button:hover {
      background: #2563eb;
    }
  </style>
  
  <!-- Instant redirect for real users (crawlers don't execute JavaScript) -->
  <script>
    // Redirect immediately - crawlers won't see this
    window.location.replace('${postUrl}');
  </script>
</head>
<body>
  <div class="container">
    <div class="post-header">
      <h1>${escapeHtml(author)}'s Post</h1>
      <div class="post-meta">
        Posted ${new Date(post.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
    
    ${image ? `<img src="${escapeHtml(image)}" alt="Post image" class="post-image">` : ''}
    
    <div class="post-content">
      <p>${escapeHtml(plainText)}${plainText.length >= 200 ? '...' : ''}</p>
    </div>
    
    <a href="${postUrl}" class="cta-button">View Full Post & Join Discussion</a>
  </div>
</body>
</html>`;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Generating static share pages for newsfeed posts...\n');
    
    // Fetch all newsfeed posts from Xano
    const response = await fetchFromXano('/newsfeed_post?type=posts_only');
    const posts = Array.isArray(response) ? response : (response.posts || []);
    console.log(`✅ Fetched ${posts.length} newsfeed posts\n`);
    
    // Create output directory
    const outputDir = path.join(__dirname, '..', 'public', 'share');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created directory: ${outputDir}\n`);
    }
    
    // Get site URL from environment
    const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'https://gleaming-cendol-417bf3.netlify.app';
    
    // Generate HTML for each post
    let generated = 0;
    for (const post of posts) {
      try {
        const html = generatePostHtml(post, siteUrl);
        const fileName = `newsfeed-${post.id}.html`;
        const filePath = path.join(outputDir, fileName);
        
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`✅ Generated: /share/${fileName}`);
        generated++;
      } catch (error) {
        console.error(`❌ Failed to generate HTML for post ${post.id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully generated ${generated} newsfeed share pages!`);
    
    // Now generate blog post share pages
    console.log('\n🚀 Generating static share pages for blog posts...\n');
    
    const blogResponse = await fetchFromXano('/asset?category_id=11');
    const blogPosts = Array.isArray(blogResponse) ? blogResponse : (blogResponse.posts || []);
    console.log(`✅ Fetched ${blogPosts.length} blog posts\n`);
    
    let blogGenerated = 0;
    for (const asset of blogPosts) {
      try {
        // Convert asset to post format
        const blogPost = {
          id: asset.id,
          content: asset.description || '',
          author: { name: asset.submitted_by || 'Anonymous' },
          created_at: asset.created_at
        };
        
        const html = generatePostHtml(blogPost, siteUrl);
        const fileName = `blog-${asset.id}.html`;
        const filePath = path.join(outputDir, fileName);
        
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`✅ Generated: /share/${fileName}`);
        blogGenerated++;
      } catch (error) {
        console.error(`❌ Failed to generate HTML for blog post ${asset.id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully generated ${blogGenerated} blog share pages!`);
    console.log(`📍 Total: ${generated + blogGenerated} share pages`);
    console.log(`📍 Location: ${outputDir}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();

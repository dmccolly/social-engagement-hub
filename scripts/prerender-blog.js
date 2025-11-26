/**
 * Prerender blog posts for social media crawlers
 * This script fetches blog posts from Xano and generates static HTML files
 * with proper Open Graph meta tags
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const XANO_BASE_URL = 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
const BUILD_DIR = path.join(__dirname, '../build');

// Fetch data from URL
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Extract first image from HTML content
function getFirstImageFromContent(content) {
  if (!content) return null;
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
  return imgMatch ? imgMatch[1] : null;
}

// Generate HTML with meta tags
function generateHTML(post) {
  const ogImage = post.featured_image || getFirstImageFromContent(post.content) || 'https://gleaming-cendol-417bf3.netlify.app/default-og-image.png';
  const ogDescription = (post.excerpt || post.title || 'Read this blog post on Social Engagement Hub').replace(/"/g, '&quot;');
  const ogUrl = `https://gleaming-cendol-417bf3.netlify.app/blog/${post.id}`;
  const ogTitle = (post.title || 'Blog Post').replace(/"/g, '&quot;');
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#2563eb" />
    
    <!-- Primary Meta Tags -->
    <title>${ogTitle} - Social Engagement Hub</title>
    <meta name="title" content="${ogTitle}" />
    <meta name="description" content="${ogDescription}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:site_name" content="Social Engagement Hub" />
    <meta property="article:published_time" content="${post.created_at || ''}" />
    ${post.author ? `<meta property="article:author" content="${post.author}" />` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${ogUrl}" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDescription}" />
    <meta name="twitter:image" content="${ogImage}" />
    
    <script defer="defer" src="/static/js/main.9701141e.js"></script>
    <link href="/static/css/main.f67e30b6.css" rel="stylesheet">
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
}

async function main() {
  try {
    console.log('Fetching blog posts from Xano...');
    const posts = await fetchData(`${XANO_BASE_URL}/blog_posts`);
    
    console.log(`Found ${posts.length} blog posts`);
    
    // Create blog directory in build folder
    const blogDir = path.join(BUILD_DIR, 'blog');
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }
    
    // Generate HTML for each post
    for (const post of posts) {
      const postDir = path.join(blogDir, post.id.toString());
      if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
      }
      
      const html = generateHTML(post);
      const htmlPath = path.join(postDir, 'index.html');
      fs.writeFileSync(htmlPath, html);
      
      console.log(`Generated: /blog/${post.id}/index.html`);
    }
    
    console.log('✅ Prerendering complete!');
  } catch (error) {
    console.error('❌ Prerendering failed:', error);
    process.exit(1);
  }
}

main();

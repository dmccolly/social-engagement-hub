const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const XANO_BASE_URL = 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
const SITE_URL = 'https://gleaming-cendol-417bf3.netlify.app';
const OUTPUT_DIR = path.join(__dirname, '../public/posts');

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstImage(html) {
  if (!html) return null;
  const imgMatch = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  return imgMatch ? imgMatch[1] : null;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateHTML(title, description, image, url, content) {
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <meta name="description" content="${escapedDescription}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDescription}">
  ${image ? `<meta property="og:image" content="${image}">` : ''}
  <meta property="og:site_name" content="Social Engagement Hub">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${escapedTitle}">
  <meta name="twitter:description" content="${escapedDescription}">
  ${image ? `<meta name="twitter:image" content="${image}">` : ''}
  
  <!-- Redirect to React app -->
  <meta http-equiv="refresh" content="0;url=${url}">
  <script>
    window.location.href = '${url}';
  </script>
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #2563eb; }
    .content { margin: 20px 0; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  <div class="content">
    ${content}
  </div>
  <p><a href="${url}">View in Social Engagement Hub →</a></p>
</body>
</html>`;
}

async function generateNewsfeedPages() {
  console.log('Fetching newsfeed posts...');
  const response = await fetch(`${XANO_BASE_URL}/newsfeed_post?type=posts_only`);
  const data = await response.json();
  const posts = Array.isArray(data) ? data : (data.posts || []);
  
  console.log(`Found ${posts.length} newsfeed posts`);
  
  for (const post of posts) {
    const title = `${post.author_name || 'User'}'s Post`;
    const description = stripHtml(post.content || '').substring(0, 200);
    const image = extractFirstImage(post.content);
    const url = `${SITE_URL}/newsfeed/post/${post.id}`;
    
    const html = generateHTML(title, description, image, url, post.content || '');
    const fileName = `newsfeed-${post.id}.html`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    await fs.writeFile(filePath, html);
    console.log(`✓ Generated ${fileName}`);
  }
}

async function generateBlogPages() {
  console.log('Fetching blog posts...');
  const response = await fetch(`${XANO_BASE_URL}/blog_posts`);
  const data = await response.json();
  const posts = Array.isArray(data) ? data : (data.posts || []);
  
  console.log(`Found ${posts.length} blog posts`);
  
  for (const post of posts) {
    const title = post.title || 'Blog Post';
    const description = stripHtml(post.content || '').substring(0, 200);
    const image = extractFirstImage(post.content);
    const url = `${SITE_URL}/blog/${post.id}`;
    
    const html = generateHTML(title, description, image, url, post.content || '');
    const fileName = `blog-${post.id}.html`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    await fs.writeFile(filePath, html);
    console.log(`✓ Generated ${fileName}`);
  }
}

async function main() {
  try {
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Output directory: ${OUTPUT_DIR}\n`);
    
    // Generate pages
    await generateNewsfeedPages();
    await generateBlogPages();
    
    console.log('\n✅ All post pages generated successfully!');
  } catch (error) {
    console.error('❌ Error generating pages:', error);
    process.exit(1);
  }
}

main();

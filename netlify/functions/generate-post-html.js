const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { postId, postType } = JSON.parse(event.body);
    
    if (!postId || !postType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing postId or postType' })
      };
    }

    const xanoBaseUrl = 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
    let postData = null;
    let title = '';
    let description = '';
    let image = null;
    let url = '';

    // Fetch post data based on type
    if (postType === 'newsfeed') {
      const response = await fetch(`${xanoBaseUrl}/newsfeed_post?type=posts_only`);
      const data = await response.json();
      const posts = Array.isArray(data) ? data : (data.posts || []);
      postData = posts.find(p => p.id === parseInt(postId));
      
      if (postData) {
        title = `${postData.author_name || 'User'}'s Post - Social Engagement Hub`;
        description = stripHtml(postData.content || '').substring(0, 200);
        image = extractFirstImage(postData.content);
        url = `https://gleaming-cendol-417bf3.netlify.app/newsfeed/post/${postId}`;
      }
    } else if (postType === 'blog') {
      const response = await fetch(`${xanoBaseUrl}/blog_posts/${postId}`);
      const data = await response.json();
      postData = data.post || data;
      
      if (postData) {
        title = `${postData.title || 'Blog Post'} - Social Engagement Hub`;
        description = stripHtml(postData.content || '').substring(0, 200);
        image = extractFirstImage(postData.content);
        url = `https://gleaming-cendol-417bf3.netlify.app/blog/${postId}`;
      }
    }

    if (!postData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Post not found' })
      };
    }

    // Generate HTML
    const html = generateHTML(title, description, image, url, postData.content);
    
    // Save to public directory (this will be included in the build)
    const fileName = `${postType}-${postId}.html`;
    const filePath = path.join('/tmp', fileName);
    await fs.writeFile(filePath, html);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        fileName,
        url: `/${fileName}`
      })
    };

  } catch (error) {
    console.error('Error generating HTML:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

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
  
  <!-- Redirect to React app after meta tags are read -->
  <meta http-equiv="refresh" content="0;url=${url}">
  <script>
    // Immediate redirect for non-crawler browsers
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

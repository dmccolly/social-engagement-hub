const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('Meta-tags function called');
  console.log('Path:', event.path);
  console.log('User-Agent:', event.headers['user-agent']);
  
  const path = event.path.replace('/.netlify/functions/meta-tags', '');
  const xanoBaseUrl = 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
  
  try {
    let postData = null;
    let postType = '';
    let postTitle = 'Social Engagement Hub';
    let postDescription = 'Community engagement platform';
    let postImage = null;
    let postUrl = `https://gleaming-cendol-417bf3.netlify.app${path}`;
    
    // Check if it's a newsfeed post
    const newsfeedMatch = path.match(/\/newsfeed\/post\/(\d+)/);
    if (newsfeedMatch) {
      const postId = newsfeedMatch[1];
      console.log('Fetching newsfeed post:', postId);
      
      const response = await fetch(`${xanoBaseUrl}/newsfeed_post?type=posts_only`);
      const data = await response.json();
      const posts = Array.isArray(data) ? data : (data.posts || []);
      postData = posts.find(p => p.id === parseInt(postId));
      
      if (postData) {
        postTitle = `${postData.author_name || 'User'}'s Post`;
        postDescription = stripHtml(postData.content || '').substring(0, 200);
        postImage = extractFirstImage(postData.content);
        console.log('Newsfeed post found:', postTitle);
      }
    }
    
    // Check if it's a blog post
    const blogMatch = path.match(/\/blog\/(\d+)/);
    if (blogMatch) {
      const postId = blogMatch[1];
      console.log('Fetching blog post:', postId);
      
      const response = await fetch(`${xanoBaseUrl}/blog_posts/${postId}`);
      const data = await response.json();
      postData = data.post || data;
      
      if (postData) {
        postTitle = postData.title || 'Blog Post';
        postDescription = stripHtml(postData.content || '').substring(0, 200);
        postImage = extractFirstImage(postData.content);
        console.log('Blog post found:', postTitle);
      }
    }
    
    // Generate complete HTML page with meta tags
    const html = generateHTML(postTitle, postDescription, postImage, postUrl);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600'
      },
      body: html
    };
    
  } catch (error) {
    console.error('Error in meta-tags function:', error);
    
    // Return a basic HTML page even on error
    const fallbackHtml = generateHTML(
      'Social Engagement Hub',
      'Community engagement platform',
      null,
      `https://gleaming-cendol-417bf3.netlify.app${path}`
    );
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      },
      body: fallbackHtml
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

function generateHTML(title, description, image, url) {
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
  
  <!-- Redirect to actual page after meta tags are read -->
  <meta http-equiv="refresh" content="0;url=${url}">
  <script>
    // Immediate redirect for non-crawler browsers
    if (!navigator.userAgent.match(/facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot/i)) {
      window.location.href = '${url}';
    }
  </script>
</head>
<body>
  <h1>${escapedTitle}</h1>
  <p>${escapedDescription}</p>
  <p><a href="${url}">Continue to post...</a></p>
</body>
</html>`;
}

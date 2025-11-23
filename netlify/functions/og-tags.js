const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const path = event.path;
  const userAgent = event.headers['user-agent'] || '';
  
  // Detect social media crawlers
  const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot/i.test(userAgent);
  
  if (!isCrawler) {
    // Not a crawler, redirect to the React app
    return {
      statusCode: 302,
      headers: {
        'Location': `${process.env.URL}${path}`
      }
    };
  }
  
  try {
    let postData = null;
    let postType = '';
    
    // Check if it's a newsfeed post
    const newsfeedMatch = path.match(/^\/newsfeed\/post\/(\d+)/);
    if (newsfeedMatch) {
      const postId = newsfeedMatch[1];
      postType = 'newsfeed';
      
      const xanoBaseUrl = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
      const response = await fetch(`${xanoBaseUrl}/newsfeed_post?type=posts_only`);
      const data = await response.json();
      const posts = Array.isArray(data) ? data : (data.posts || []);
      postData = posts.find(p => p.id === parseInt(postId));
    }
    
    // Check if it's a blog post
    const blogMatch = path.match(/^\/blog\/(\d+)/);
    if (blogMatch) {
      const postId = blogMatch[1];
      postType = 'blog';
      
      const xanoBaseUrl = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
      const response = await fetch(`${xanoBaseUrl}/blog_posts/${postId}`);
      const data = await response.json();
      postData = data.post || data;
    }
    
    if (!postData) {
      return {
        statusCode: 404,
        body: 'Post not found'
      };
    }
    
    // Extract plain text from HTML
    const getPlainText = (html) => {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').substring(0, 200);
    };
    
    // Extract first image URL from HTML
    const getFirstImage = (html) => {
      if (!html) return null;
      const imgMatch = html.match(/<img[^>]+src=["']([^"'>]+)["']/);
      return imgMatch ? imgMatch[1] : null;
    };
    
    const postTitle = postType === 'newsfeed' 
      ? `${postData.author_name}'s Post`
      : postData.title || 'Blog Post';
    const postDescription = getPlainText(postData.content);
    const postImage = getFirstImage(postData.content);
    const postUrl = `${process.env.URL}${path}`;
    
    // Generate HTML with Open Graph meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${postTitle}</title>
    <meta name="description" content="${postDescription}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="og:title" content="${postTitle}" />
    <meta property="og:description" content="${postDescription}" />
    ${postImage ? `<meta property="og:image" content="${postImage}" />` : ''}
    <meta property="og:site_name" content="Social Engagement Hub" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${postUrl}" />
    <meta property="twitter:title" content="${postTitle}" />
    <meta property="twitter:description" content="${postDescription}" />
    ${postImage ? `<meta property="twitter:image" content="${postImage}" />` : ''}
    
    <meta http-equiv="refresh" content="0;url=${postUrl}" />
    <script>window.location.href = '${postUrl}';</script>
  </head>
  <body>
    <h1>${postTitle}</h1>
    <p>${postDescription}</p>
    <p><a href="${postUrl}">Click here if you are not redirected</a></p>
  </body>
</html>`;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      },
      body: html
    };
    
  } catch (error) {
    console.error('Error generating OG tags:', error);
    return {
      statusCode: 500,
      body: `Error: ${error.message}`
    };
  }
};

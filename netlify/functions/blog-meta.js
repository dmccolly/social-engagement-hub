/**
 * Netlify Function: blog-meta
 * 
 * Serves blog post pages with server-side rendered Open Graph meta tags
 * so Facebook and other social media crawlers can see the preview data
 */

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const path = event.path;
  const blogIdMatch = path.match(/\/blog\/(\d+)/);
  
  if (!blogIdMatch) {
    return {
      statusCode: 404,
      body: 'Blog post not found'
    };
  }
  
  const blogId = blogIdMatch[1];
  const xanoBaseUrl = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
  
  try {
    // Fetch blog post data from Xano
    const response = await fetch(`${xanoBaseUrl}/blog_posts/${blogId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blog post: ${response.status}`);
    }
    
    const post = await response.json();
    
    // Extract first image from content if no featured image
    const getFirstImageFromContent = (content) => {
      if (!content) return null;
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
      return imgMatch ? imgMatch[1] : null;
    };
    
    const ogImage = post.featured_image || getFirstImageFromContent(post.content) || 'https://gleaming-cendol-417bf3.netlify.app/default-og-image.png';
    const ogDescription = post.excerpt || post.title || 'Read this blog post on Social Engagement Hub';
    const ogUrl = `https://gleaming-cendol-417bf3.netlify.app/blog/${blogId}`;
    const ogTitle = post.title || 'Blog Post';
    
    // Generate HTML with meta tags
    const html = `<!DOCTYPE html>
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
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300'
      },
      body: html
    };
    
  } catch (error) {
    console.error('Error fetching blog post:', error);
    
    // Return basic HTML on error
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Social Engagement Hub</title>
    <script defer="defer" src="/static/js/main.9701141e.js"></script>
    <link href="/static/css/main.f67e30b6.css" rel="stylesheet">
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`
    };
  }
};

/**
 * Netlify Serverless Function: blog-og
 * 
 * Serves blog post HTML with Open Graph meta tags for social media crawlers
 * For regular users, returns 301 redirect to let React handle routing
 */

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const userAgent = event.headers['user-agent'] || '';
  
  // Detect social media crawlers
  const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|pinterest|telegrambot/i.test(userAgent);
  
  // Extract blog ID from path
  const blogIdMatch = event.path.match(/\/blog\/(\d+)/);
  
  if (!blogIdMatch) {
    return {
      statusCode: 404,
      body: 'Blog post not found'
    };
  }
  
  const blogId = blogIdMatch[1];
  
  // For regular users (not crawlers), return a minimal HTML that will load the React app
  if (!isCrawler) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="refresh" content="0;url=/blog/${blogId}"/><script>window.location.href="/blog/${blogId}";</script></head><body>Loading...</body></html>`
    };
  }
  
  // For crawlers, fetch blog data and serve meta tags
  const xanoBaseUrl = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
  
  try {
    // Fetch blog post data from Xano
    const response = await fetch(`${xanoBaseUrl}/blog_posts/${blogId}`);
    
    if (!response.ok) {
      return {
        statusCode: 404,
        body: 'Blog post not found'
      };
    }
    
    const post = await response.json();
    
    // Extract first image from content if no featured image
    const getFirstImageFromContent = (content) => {
      if (!content) return null;
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
      return imgMatch ? imgMatch[1] : null;
    };
    
    const ogImage = post.featured_image || getFirstImageFromContent(post.content) || 'https://gleaming-cendol-417bf3.netlify.app/default-og-image.png';
    const ogDescription = (post.excerpt || post.title || 'Read this blog post on Social Engagement Hub').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const ogUrl = `https://gleaming-cendol-417bf3.netlify.app/blog/${blogId}`;
    const ogTitle = (post.title || 'Blog Post').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Generate HTML with meta tags for crawlers
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    
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
    ${post.created_at ? `<meta property="article:published_time" content="${post.created_at}" />` : ''}
    ${post.author ? `<meta property="article:author" content="${post.author}" />` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${ogUrl}" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDescription}" />
    <meta name="twitter:image" content="${ogImage}" />
  </head>
  <body>
    <h1>${ogTitle}</h1>
    <p>${ogDescription}</p>
    <p><a href="${ogUrl}">Read full post</a></p>
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
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
};

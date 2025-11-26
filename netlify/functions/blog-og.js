/**
 * Netlify Serverless Function: blog-og
 * 
 * Serves blog post HTML with Open Graph meta tags for social media crawlers
 * Regular users get redirected to the React app
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const userAgent = event.headers['user-agent'] || '';
  
  // Detect social media crawlers
  const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|pinterest|telegrambot/i.test(userAgent);
  
  // Extract blog ID from path
  const blogIdMatch = event.path.match(/\/blog\/(\d+)/);
  
  if (!isCrawler || !blogIdMatch) {
    // Not a crawler or invalid path - serve the React app index.html
    try {
      const indexPath = path.join(__dirname, '../../build/index.html');
      const html = fs.readFileSync(indexPath, 'utf8');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html'
        },
        body: html
      };
    } catch (error) {
      return {
        statusCode: 404,
        body: 'Not found'
      };
    }
  }
  
  const blogId = blogIdMatch[1];
  const xanoBaseUrl = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
  
  try {
    // Fetch blog post data from Xano
    const response = await fetch(`${xanoBaseUrl}/blog_posts/${blogId}`);
    
    if (!response.ok) {
      // Blog post not found - serve React app
      const indexPath = path.join(__dirname, '../../build/index.html');
      const html = fs.readFileSync(indexPath, 'utf8');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html'
        },
        body: html
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
    // On error, serve React app
    try {
      const indexPath = path.join(__dirname, '../../build/index.html');
      const html = fs.readFileSync(indexPath, 'utf8');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html'
        },
        body: html
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: 'Internal server error'
      };
    }
  }
};

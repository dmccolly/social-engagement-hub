/**
 * Netlify Edge Function: og-tags
 * 
 * Detects social media crawlers and serves HTML with Open Graph meta tags
 * For regular users, passes through to the React app
 */

export default async (request, context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect social media crawlers
  const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|pinterest|telegrambot/i.test(userAgent);
  
  // Only handle blog post URLs
  const blogMatch = url.pathname.match(/^\/blog\/(\d+)\/?$/);
  
  if (!isCrawler || !blogMatch) {
    // Not a crawler or not a blog post - pass through to React app
    return context.next();
  }
  
  const blogId = blogMatch[1];
  const xanoBaseUrl = Deno.env.get('XANO_BASE_URL') || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
  
  try {
    // Fetch blog post data from Xano
    const response = await fetch(`${xanoBaseUrl}/blog_posts/${blogId}`);
    
    if (!response.ok) {
      // If blog post not found, pass through to React app
      return context.next();
    }
    
    const post = await response.json();
    
    // Extract first image from content if no featured image
    const getFirstImageFromContent = (content) => {
      if (!content) return null;
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
      return imgMatch ? imgMatch[1] : null;
    };
    
    const ogImage = post.featured_image || getFirstImageFromContent(post.content) || `${url.origin}/default-og-image.png`;
    const ogDescription = (post.excerpt || post.title || 'Read this blog post on Social Engagement Hub').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const ogUrl = `${url.origin}/blog/${blogId}`;
    const ogTitle = (post.title || 'Blog Post').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Generate minimal HTML with meta tags for crawlers
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
    
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300'
      }
    });
    
  } catch (error) {
    console.error('Error fetching blog post:', error);
    // On error, pass through to React app
    return context.next();
  }
};

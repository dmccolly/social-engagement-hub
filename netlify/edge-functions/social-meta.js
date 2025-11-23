export default async (request, context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect social media crawlers
  const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot/i.test(userAgent);
  
  if (!isCrawler) {
    // Not a crawler, serve normally
    return context.next();
  }
  
  // Check if this is a newsfeed post URL
  const postMatch = url.pathname.match(/^\/newsfeed\/post\/(\d+)$/);
  if (!postMatch) {
    return context.next();
  }
  
  const postId = postMatch[1];
  
  try {
    // Fetch post data from Xano
    const xanoBaseUrl = Deno.env.get('REACT_APP_XANO_BASE_URL') || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
    const postsResponse = await fetch(`${xanoBaseUrl}/newsfeed_post?type=posts_only`);
    const postsData = await postsResponse.json();
    
    const posts = Array.isArray(postsData) ? postsData : (postsData.posts || []);
    const post = posts.find(p => p.id === parseInt(postId));
    
    if (!post) {
      return context.next();
    }
    
    // Extract plain text from HTML
    const getPlainText = (html) => {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '').substring(0, 200);
    };
    
    // Extract first image URL from HTML
    const getFirstImage = (html) => {
      if (!html) return null;
      const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
      return imgMatch ? imgMatch[1] : null;
    };
    
    const postTitle = `${post.author_name}'s Post`;
    const postDescription = getPlainText(post.content);
    const postImage = getFirstImage(post.content);
    const postUrl = `${url.origin}/newsfeed/post/${postId}`;
    
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
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${postUrl}" />
    <meta property="twitter:title" content="${postTitle}" />
    <meta property="twitter:description" content="${postDescription}" />
    ${postImage ? `<meta property="twitter:image" content="${postImage}" />` : ''}
    
    <meta http-equiv="refresh" content="0;url=${postUrl}" />
  </head>
  <body>
    <p>Redirecting to post...</p>
  </body>
</html>`;
    
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error fetching post data:', error);
    return context.next();
  }
};

export const config = {
  path: "/newsfeed/post/*"
};

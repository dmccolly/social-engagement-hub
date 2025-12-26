
exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://gleaming-cendol-417bf3.netlify.app';
    const proxyUrl = `${siteUrl}/xano/asset`;
    
    console.log('Fetching blog posts from internal proxy:', proxyUrl);

    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Xano fetch failed:', response.status, response.statusText);
      throw new Error(`Failed to fetch from Xano: ${response.statusText}`);
    }

    const assets = await response.json();
    console.log('Fetched assets from Xano:', assets.length);

    // Filter to only blog posts (category_id = 11)
    const now = new Date();
    const blogPosts = assets
      .filter(asset => {
        const catId = asset.category_id ?? asset.category?.id ?? asset.category;
        if (Number(catId) !== 11) {
          return false;
        }

        const tags = asset.tags || '';
        if (tags.includes('status:draft')) {
          return false;
        }
        if (tags.includes('status:archived')) {
          return false;
        }

        // Filter out scheduled posts that haven't reached their publish time
        if (asset.is_scheduled && asset.scheduled_datetime) {
          const scheduledTime = new Date(asset.scheduled_datetime);
          if (scheduledTime > now) {
            return false;
          }
        }

        return true;
      })
      .map(asset => ({
        id: asset.id,
        title: asset.title || 'Untitled',
        content: asset.description || '',
        author: asset.submitted_by || 'Anonymous',
        created_at: asset.created_at,
        media_url: asset.media_url || '',
        thumbnail_url: asset.thumbnail_url || '',
        featured: asset.is_featured || false,
        pinned: asset.is_pinned || false,
        sort_order: asset.sort_order || 0,
        tags: asset.tags || ''
      }))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
        if (a.featured !== b.featured) return b.featured ? 1 : -1;
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(b.created_at) - new Date(a.created_at);
      });

    console.log('Filtered blog posts:', blogPosts.length);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      },
      body: JSON.stringify({
        success: true,
        posts: blogPosts,
        count: blogPosts.length
      })
    };

  } catch (error) {
    console.error('Blog posts function error:', error);

    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch blog posts',
        message: error.message
      })
    };
  }
};

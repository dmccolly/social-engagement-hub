// src/services/xanoService.js

// Hardcode XANO URL as fallback for embedded widgets where env vars may not be available
const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

/**
 * Upload image via XANO (which then uploads to Cloudinary)
 */
export const uploadImageViaXano = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/upload-image`, {
      method: 'POST',
      body: formData,
      // Add authentication header if needed
      // headers: {
      //   'Authorization': `Bearer ${yourAuthToken}`
      // }
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('XANO upload error:', error);
    throw error;
  }
};

/**
 * Create a new blog post (using asset_create endpoint)
 */
export const createBlogPost = async (postData) => {
  try {
    console.log('XANO_BASE_URL:', XANO_BASE_URL);
    console.log('Creating blog post with data:', postData);
    
    // Check if XANO_BASE_URL is defined
    if (!XANO_BASE_URL) {
      throw new Error('XANO_BASE_URL is not defined. Check environment variables.');
    }

    // CORRECTED DATA MAPPING - Now matches the asset table structure and updateBlogPost format
    const assetData = {
      title: postData.title || 'Untitled Blog Post',
      description: postData.content || '',
      submitted_by: postData.author || 'Blog Editor',
      tags: postData.tags || '',
      is_featured: postData.featured || false,
      pinned: postData.pinned || false,
      sort_order: postData.sort_order || 0,
      is_scheduled: postData.is_scheduled || false,
      scheduled_datetime: postData.scheduled_datetime || null,
        original_creation_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        category_id: 11 // Blog Posts category
    };

    console.log('Sending to XANO:', assetData);
    console.log('URL:', `${XANO_BASE_URL}/asset_create`);

    const response = await fetch(`${XANO_BASE_URL}/asset_create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assetData),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`Failed to create post: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('XANO response:', result);
    
    // Return in expected format
    return {
      success: true,
      post: {
        id: result.id,
        title: result.title,
        content: result.description,
        author: result.submitted_by || 'Blog Editor',
        created_at: result.created_at,
        featured: result.is_featured || false,
        status: 'published'
      }
    };
  } catch (error) {
    console.error('Create post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing blog post (using asset endpoint)
 */
export const updateBlogPost = async (postId, postData) => {
  try {
    // Map blog post data to asset format
    const assetData = {
      title: postData.title,
      description: postData.content,
      submitted_by: postData.author || 'Blog Editor',
      tags: postData.tags || '',
      is_featured: postData.featured || false,
      pinned: postData.pinned || false,
      sort_order: postData.sort_order !== undefined ? postData.sort_order : 0,
      is_scheduled: postData.is_scheduled || false,
      scheduled_datetime: postData.scheduled_datetime || null,
        category_id: 11 // Blog Posts category
    };

    const response = await fetch(`${XANO_BASE_URL}/asset/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assetData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update post: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Return in expected format
    return {
      success: true,
      post: {
        id: result.id,
        title: result.title,
        content: result.description,
        author: result.submitted_by,
        created_at: result.created_at,
        featured: result.is_featured,
        status: 'published'
      }
    };
  } catch (error) {
    console.error('Update post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all published blog posts (using asset endpoint)
 */
export const getPublishedPosts = async (limit = 50, offset = 0) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/asset`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const assets = await response.json();
    
    console.log('Raw assets from Xano:', assets);
    
    // Helper function to create excerpt - keep images but limit text
    const createExcerpt = (html, maxLength = 400) => {
      if (!html) return '';
      
      // For excerpt, keep the HTML (including images) but limit length
      if (html.length <= maxLength) {
        return html;
      }
      
      // Cut at a reasonable point
      let excerpt = html.substring(0, maxLength);
      
      // Find the last complete tag
      const lastTagEnd = excerpt.lastIndexOf('>');
      if (lastTagEnd > 0) {
        excerpt = excerpt.substring(0, lastTagEnd + 1);
      }
      
      return excerpt + '...';
    };
    
       // Filter to only blog posts (empty file_type) and convert to blog post format
    const posts = assets
         .filter(asset => asset.category_id === 11) // Only Blog Posts category
      .map(asset => {
        console.log('Asset description:', asset.description);
        const excerpt = createExcerpt(asset.description || '', 400);
        console.log('HTML excerpt:', excerpt.substring(0, 100));
        
        return {
          id: asset.id,
          title: asset.title || 'Untitled',
          content: asset.description || '',
          excerpt: excerpt,
          author: asset.submitted_by || 'Unknown',
          created_at: asset.created_at,
          published_at: asset.created_at,
          featured: asset.is_featured || false,
          pinned: asset.pinned || false,
          sort_order: asset.sort_order || 0,
          is_scheduled: asset.is_scheduled || false,
          scheduled_datetime: asset.scheduled_datetime || null,
          status: 'published'
        };
      })
         .sort((a, b) => {
           if (a.pinned && !b.pinned) return -1;
           if (!a.pinned && b.pinned) return 1;
           if (a.featured && !b.featured) return -1;
           if (!a.featured && b.featured) return 1;
           if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
           return new Date(b.created_at) - new Date(a.created_at);
         })
      .slice(offset, offset + limit);

    return {
      success: true,
      posts: posts,
      total: assets.length
    };
  } catch (error) {
    console.error('Fetch posts error:', error);
    return { success: false, error: error.message, posts: [] };
  }
};

/**
 * Get a single blog post by ID (using asset endpoint)
 */
export const getBlogPost = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/asset/${postId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const asset = await response.json();
    
    // Convert asset to blog post format
    return {
      success: true,
      post: {
        id: asset.id,
        title: asset.title || 'Untitled',
        content: asset.description || '',
        author: asset.submitted_by || 'Unknown',
        created_at: asset.created_at,
        featured: asset.is_featured || false,
        status: 'published'
      }
    };
  } catch (error) {
    console.error('Fetch post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Publish a blog post (using asset endpoint - just return success since assets are auto-published)
 */
export const publishBlogPost = async (postId) => {
  try {
    // Since assets don't have a separate publish step, just return success
    return {
      success: true,
      message: 'Post published successfully'
    };
  } catch (error) {
    console.error('Publish post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a blog post (using asset endpoint)
 */
export const deleteBlogPost = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/asset/${postId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.statusText}`);
    }

    return {
      success: true,
      message: 'Post deleted successfully'
    };
  } catch (error) {
    console.error('Delete post error:', error);
    return { success: false, error: error.message };
  }
};

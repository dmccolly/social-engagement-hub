// src/services/xanoService.js

const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL;

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

    // Use minimal required fields that worked in our curl test
    const assetData = {
      title: postData.title || 'Untitled Blog Post',
      description: postData.content || '',
      original_creation_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
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
    
    // Convert assets to blog post format and sort by creation date
    const posts = assets
      .map(asset => ({
        id: asset.id,
        title: asset.title || 'Untitled',
        content: asset.description || '',
        excerpt: (asset.description || '').substring(0, 200) + '...',
        author: asset.submitted_by || 'Unknown',
        created_at: asset.created_at,
        published_at: asset.created_at,
        featured: asset.is_featured || false,
        status: 'published'
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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

// src/services/xanoService.js

const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || 
  (typeof window !== 'undefined' ? '/xano' : 
    (process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV'));

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
 * Create a new blog post (using asset endpoint)
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
    console.log('URL:', `${XANO_BASE_URL}/asset`);

    const response = await fetch(`${XANO_BASE_URL}/asset`, {
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
    
    console.log('Raw assets from Xano:', assets.length, 'total assets');
    
    // Helper function to create excerpt - keep images but limit text
    const createExcerpt = (html, maxLength = 2000) => {
      if (!html) return '';
      
      // Remove all images from excerpt to avoid duplication
      let textOnly = html.replace(/<img[^>]*>/gi, '');
      
      // Remove empty paragraphs and divs
      textOnly = textOnly.replace(/<(p|div)[^>]*>\s*<\/(p|div)>/gi, '');
      
      // If the text-only version is short enough, return it
      if (textOnly.length <= maxLength) {
        return textOnly;
      }
      
      // Cut at a reasonable point
      let excerpt = textOnly.substring(0, maxLength);
      
      // Find the last complete tag
      const lastTagEnd = excerpt.lastIndexOf('>');
      if (lastTagEnd > 0) {
        excerpt = excerpt.substring(0, lastTagEnd + 1);
      }
      
      return excerpt + '...';
    };
    
       // Filter to only blog posts (category_id = 11) and convert to blog post format
    let filteredByCategory = 0;
    let filteredByDraft = 0;
    let filteredByScheduled = 0;
    
    const posts = assets
         .filter(asset => {
           const catId = asset.category_id ?? asset.category?.id ?? asset.category;
           if (Number(catId) !== 11) {
             filteredByCategory++;
             return false;
           }
           
           // Filter out drafts and archived posts (check tags for status:draft or status:archived)
           const tags = asset.tags || '';
           if (tags.includes('status:draft')) {
             filteredByDraft++;
             return false;
           }
           if (tags.includes('status:archived')) {
             filteredByDraft++; // Count archived with drafts for simplicity
             return false;
           }
           
           // Filter out scheduled posts that haven't reached their publish time
           if (asset.is_scheduled && asset.scheduled_datetime) {
             const scheduledTime = new Date(asset.scheduled_datetime);
             const now = new Date();
             if (scheduledTime > now) {
               filteredByScheduled++;
               return false;
             }
           }
           
           return true;
         })
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
          tags: asset.tags || '',
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

    console.log('Filter results:', {
      totalAssets: assets.length,
      filteredByCategory,
      filteredByDraft,
      filteredByScheduled,
      afterFiltering: posts.length + (offset > 0 ? offset : 0),
      afterSlice: posts.length
    });

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

// ============================================================================
// VISITOR ENGAGEMENT HUB - NEW ENDPOINTS
// ============================================================================

/**
 * Get visitor profile by token
 * @param {string} visitorToken - Unique visitor token
 * @returns {Promise<Object>} Visitor profile data
 */
export const getVisitorProfile = async (visitorToken) => {
  try {
    const params = new URLSearchParams({ visitor_token: visitorToken });
    const response = await fetch(`${XANO_BASE_URL}/visitor/profile?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get visitor profile: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get visitor profile error:', error);
    throw error;
  }
};

/**
 * Update visitor profile
 * @param {string} visitorToken - Unique visitor token
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {Promise<Object>} Updated visitor profile
 */
export const updateVisitorProfile = async (visitorToken, firstName, lastName) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_token: visitorToken,
        first_name: firstName,
        last_name: lastName,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update visitor profile: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update visitor profile error:', error);
    throw error;
  }
};

/**
 * Create a new visitor post
 * @param {string} visitorToken - Unique visitor token
 * @param {string} content - Post content
 * @returns {Promise<Object>} Created post data
 */
export const createVisitorPost = async (visitorToken, content) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_token: visitorToken,
        content: content,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create visitor post: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create visitor post error:', error);
    throw error;
  }
};

/**
 * Get all approved visitor posts
 * @returns {Promise<Array>} Array of approved posts
 */
export const getApprovedVisitorPosts = async () => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor/posts`);
    
    if (!response.ok) {
      throw new Error(`Failed to get approved posts: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get approved posts error:', error);
    throw error;
  }
};

/**
 * Reply to a visitor post
 * @param {number} postId - Post ID
 * @param {string} visitorToken - Unique visitor token
 * @param {string} content - Reply content
 * @returns {Promise<Object>} Created reply data
 */
export const replyToVisitorPost = async (postId, visitorToken, content) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor/posts/${postId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_token: visitorToken,
        content: content,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to reply to post: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Reply to post error:', error);
    throw error;
  }
};

/**
 * Like a visitor post
 * @param {number} postId - Post ID
 * @param {string} visitorToken - Unique visitor token
 * @returns {Promise<Object>} Like data
 */
export const likeVisitorPost = async (postId, visitorToken) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_token: visitorToken,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to like post: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Like post error:', error);
    throw error;
  }
};

// ============================================================================
// ADMIN - VISITOR POST MODERATION
// ============================================================================

/**
 * Get all pending posts awaiting approval
 * @returns {Promise<Array>} Array of pending posts
 */
export const getPendingVisitorPosts = async () => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/admin/visitor/posts/pending`);
    
    if (!response.ok) {
      throw new Error(`Failed to get pending posts: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get pending posts error:', error);
    throw error;
  }
};

/**
 * Approve a visitor post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} Approved post data
 */
export const approveVisitorPost = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/admin/visitor/posts/${postId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to approve post: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Approve post error:', error);
    throw error;
  }
};

/**
 * Reject a visitor post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} Rejected post data
 */
export const rejectVisitorPost = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/admin/visitor/posts/${postId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to reject post: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Reject post error:', error);
    throw error;
  }
};

// ============================================================================
// UTILITY FUNCTIONS FOR VISITOR ENGAGEMENT
// ============================================================================

/**
 * Generate a unique visitor token (client-side)
 * @returns {string} Unique visitor token
 */
export const generateVisitorToken = () => {
  return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get visitor token from localStorage or create new one
 * @returns {string} Visitor token
 */
export const getOrCreateVisitorToken = () => {
  let token = localStorage.getItem('visitor_token');
  if (!token) {
    token = generateVisitorToken();
    localStorage.setItem('visitor_token', token);
  }
  return token;
};

/**
 * Clear visitor token from localStorage
 */
export const clearVisitorToken = () => {
  localStorage.removeItem('visitor_token');
};


// Alias for backward compatibility
export const getVisitorPosts = getApprovedVisitorPosts;

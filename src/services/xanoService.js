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
 * Create a new blog post
 */
export const createBlogPost = async (postData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication if needed
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Create post error:', error);
    throw error;
  }
};

/**
 * Update an existing blog post
 */
export const updateBlogPost = async (postId, postData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Update post error:', error);
    throw error;
  }
};

/**
 * Get all published blog posts
 */
export const getPublishedPosts = async (limit = 50, offset = 0) => {
  try {
    const response = await fetch(
      `${XANO_BASE_URL}/blog/posts?status=published&limit=${limit}&offset=${offset}&sort=published_at&order=desc`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch posts error:', error);
    throw error;
  }
};

/**
 * Get a single blog post by ID
 */
export const getBlogPost = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/posts/${postId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch post error:', error);
    throw error;
  }
};

/**
 * Publish a blog post
 */
export const publishBlogPost = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/posts/${postId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to publish post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Publish post error:', error);
    throw error;
  }
};

/**
 * Delete a blog post
 */
export const deleteBlogPost = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/posts/${postId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
};

// src/services/newsfeedService.js

const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

// Visitor Registration API Endpoints - Email Marketing API Group
const VISITOR_REGISTRATION_ENDPOINT = `${XANO_BASE_URL}/visitor/register`;
const VISITOR_PROFILE_ENDPOINT = `${XANO_BASE_URL}/visitor/profile`;
const VISITOR_POSTS_ENDPOINT = `${XANO_BASE_URL}/visitor/posts`;
const VISITOR_REPLIES_ENDPOINT = `${XANO_BASE_URL}/visitor/replies`;
const VISITOR_LIKES_ENDPOINT = `${XANO_BASE_URL}/visitor/likes`;

/**
 * Get all newsfeed posts with optional filtering
 */
export const getNewsfeedPosts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.author_id) params.append('author_id', filters.author_id);
    if (filters.author_email) params.append('author_email', filters.author_email);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    if (filters.visitor_email) params.append('visitor_email', filters.visitor_email);
    
    const url = `${XANO_BASE_URL}/newsfeed_posts${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get newsfeed posts error:', error);
    return { 
      success: false, 
      error: error.message, 
      posts: [],
      total: 0,
      pagination: { limit: 20, offset: 0, has_more: false }
    };
  }
};

/**
 * Get replies to a specific post
 */
export const getNewsfeedReplies = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/newsfeed_posts/${postId}/replies`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch replies: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get newsfeed replies error:', error);
    return { success: false, error: error.message, replies: [], total: 0 };
  }
};

/**
 * Create a new post or reply
 */
export const createNewsfeedPost = async (postData) => {
  try {
    // Validate required fields
    if (!postData.content || postData.content.trim() === '') {
      return { 
        success: false, 
        error: 'Post content is required' 
      };
    }
    
    if (!postData.author_name || postData.author_name.trim() === '') {
      return { 
        success: false, 
        error: 'Author name is required' 
      };
    }
    
    const response = await fetch(`${XANO_BASE_URL}/newsfeed_posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author_name: postData.author_name,
        author_email: postData.author_email || null,
        author_id: postData.author_id || null,
        content: postData.content,
        parent_id: postData.parent_id || null,
        post_type: postData.parent_id ? 'reply' : 'post',
        session_id: postData.session_id || null,
        ip_address: postData.ip_address || null,
        user_agent: postData.user_agent || null
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create post: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create newsfeed post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle like on a post
 */
export const toggleNewsfeedLike = async (postId, visitorData) => {
  try {
    if (!visitorData.author_email) {
      return { 
        success: false, 
        error: 'Email required for liking posts' 
      };
    }
    
    const response = await fetch(`${XANO_BASE_URL}/newsfeed_posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author_email: visitorData.author_email,
        author_id: visitorData.author_id || null,
        ip_address: visitorData.ip_address || null,
        user_agent: visitorData.user_agent || null
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to like post: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Toggle newsfeed like error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get newsfeed analytics
 */
export const getNewsfeedAnalytics = async (timeRange = '7d') => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/newsfeed_analytics?time_range=${timeRange}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get newsfeed analytics error:', error);
    return { 
      success: false, 
      error: error.message,
      analytics: {
        overview: { total_posts: 0, total_replies: 0, total_likes: 0, total_comments: 0, engagement_rate: 0 },
        top_contributors: [],
        time_range: timeRange
      }
    };
  }
};

/**
 * Create or update visitor session
 */
export const createVisitorSession = async (sessionData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionData.session_id,
        email: sessionData.email,
        name: sessionData.name,
        ip_address: sessionData.ip_address || null,
        user_agent: sessionData.user_agent || null,
        is_member: sessionData.is_member || false,
        member_id: sessionData.member_id || null
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create session: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create visitor session error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get visitor's post history
 */
export const getVisitorPosts = async (visitorEmail) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/newsfeed_posts?author_email=${visitorEmail}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch visitor posts: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get visitor posts error:', error);
    return { success: false, error: error.message, posts: [] };
  }
};

/**
 * Convert visitor to member
 */
export const convertVisitorToMember = async (visitorEmail, memberData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitor_email: visitorEmail,
        member_data: memberData
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to convert visitor: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Convert visitor to member error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get trending posts
 */
export const getTrendingPosts = async (timeRange = '7d', limit = 10) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/newsfeed_posts/trending?time_range=${timeRange}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending posts: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get trending posts error:', error);
    return { success: false, error: error.message, posts: [] };
  }
};

/**
 * Search posts
 */
export const searchNewsfeedPosts = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('search', query);
    
    if (filters.author) params.append('author', filters.author);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.limit) params.append('limit', filters.limit);
    
    const url = `${XANO_BASE_URL}/newsfeed_posts/search?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to search posts: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search newsfeed posts error:', error);
    return { success: false, error: error.message, posts: [] };
  }
};

// Fallback data for when API is not available
export const getSampleNewsfeedData = () => {
  return {
    success: true,
    posts: [
      {
        id: 1,
        author_name: 'Sarah Johnson',
        author_email: 'sarah@example.com',
        author_id: null,
        content: 'Just discovered this amazing community! Looking forward to learning and sharing with everyone. 🎉',
        post_type: 'post',
        status: 'published',
        likes_count: 5,
        comments_count: 2,
        visitor_liked: false,
        created_at: '2025-10-15T12:00:00Z'
      },
      {
        id: 2,
        author_name: 'Mike Chen',
        author_email: 'mike@example.com',
        author_id: null,
        content: 'Welcome Sarah! What brings you to our community? I\'m here to learn about web development and connect with like-minded people.',
        parent_id: 1,
        post_type: 'reply',
        status: 'published',
        likes_count: 3,
        comments_count: 0,
        visitor_liked: false,
        created_at: '2025-10-15T12:30:00Z'
      }
    ],
    total: 2,
    pagination: { limit: 20, offset: 0, has_more: false }
  };
};
/**
 * Register new visitor via Email Marketing API
 */
export const registerVisitor = async (visitorData) => {
  try {
    const response = await fetch(VISITOR_REGISTRATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: visitorData.email,
        first_name: visitorData.first_name,
        last_name: visitorData.last_name,
        name: visitorData.name,
        source: visitorData.source || 'newsfeed',
        ip_address: visitorData.ip_address || null,
        user_agent: visitorData.user_agent || null,
        referrer: visitorData.referrer || null,
        landing_page: visitorData.landing_page || window.location.href
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to register visitor: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Register visitor error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get visitor profile
 */
export const getVisitorProfile = async (visitorEmail) => {
  try {
    const response = await fetch(`${VISITOR_PROFILE_ENDPOINT}?email=${visitorEmail}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch visitor profile: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get visitor profile error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create visitor post
 */
export const createVisitorPost = async (postData) => {
  try {
    const response = await fetch(VISITOR_POSTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitor_email: postData.visitor_email,
        content: postData.content,
        session_id: postData.session_id,
        ip_address: postData.ip_address || null,
        user_agent: postData.user_agent || null
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create visitor post: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create visitor post error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle visitor like on post
 */
export const toggleVisitorLike = async (postId, visitorData) => {
  try {
    const response = await fetch(`${VISITOR_LIKES_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_id: postId,
        visitor_email: visitorData.visitor_email,
        session_id: visitorData.session_id
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to toggle like: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Toggle visitor like error:', error);
    return { success: false, error: error.message };
  }
};

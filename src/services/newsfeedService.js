// Unified newsfeed service for the Social Engagement Hub.
//
// This module re‑implements all of the functions expected by the frontend
// (getNewsfeedPosts, getNewsfeedReplies, createNewsfeedPost, toggleNewsfeedLike,
// getNewsfeedAnalytics, searchNewsfeedPosts, createVisitorSession, convertVisitorToMember,
// getVisitorPosts, toggleVisitorLike, getTrendingPosts, getSampleNewsfeedData,
// registerVisitor, getVisitorProfile, createVisitorPost) using the visitor‑oriented
// endpoints exposed in your Xano workspace. Stub implementations are provided
// where no matching endpoint exists. Update these implementations to match
// your actual API behaviour as needed.

const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

/**
 * Build a URL under the visitor posts namespace. Allows additional path
 * segments and query parameters. Example: buildVisitorUrl('123/like')
 */
function buildVisitorUrl(path = '', params) {
  const base = `${XANO_BASE_URL}/visitor/posts`;
  const suffix = path ? `/${path.replace(/^\//, '')}` : '';
  const query = params && params.toString() ? `?${params.toString()}` : '';
  return `${base}${suffix}${query}`;
}

/**
 * Fallback data for when the API is unavailable. Used by the UI to render
 * placeholder content.
 */
export function getSampleNewsfeedData() {
  return {
    success: true,
    posts: [
      {
        id: 1,
        author_name: 'Demo User',
        author_email: 'demo@example.com',
        author_id: null,
        content: 'This is a sample post. Once your Xano endpoints are live, you should see real posts here.',
        post_type: 'post',
        status: 'published',
        likes_count: 0,
        comments_count: 0,
        visitor_liked: false,
        created_at: new Date().toISOString()
      }
    ],
    total: 1,
    pagination: { limit: 20, offset: 0, has_more: false }
  };
}

/**
 * Get all approved posts. Supports optional search and pagination.
 */
export async function getNewsfeedPosts(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    // Additional filters can be added as supported by your API.
    const response = await fetch(buildVisitorUrl('', params));
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Get newsfeed posts error:', err);
    return {
      success: false,
      error: err.message,
      posts: [],
      total: 0,
      pagination: { limit: 20, offset: 0, has_more: false }
    };
  }
}

/**
 * Get replies for a given post. If your API doesn’t support fetching replies
 * directly, this function returns an empty list and logs a warning.
 */
export async function getNewsfeedReplies(postId) {
  try {
    const url = buildVisitorUrl(`${postId}/replies`);
    const response = await fetch(url);
    if (!response.ok) {
      // If the endpoint doesn’t exist, treat as no replies.
      return { success: true, replies: [], total: 0 };
    }
    return await response.json();
  } catch (err) {
    console.error('Get newsfeed replies error:', err);
    return { success: false, error: err.message, replies: [], total: 0 };
  }
}

/**
 * Create a post. The visitor endpoints use `visitor_email` instead of author
 * fields. Only `content` is required; visitor email is recommended so likes and
 * replies can be attributed.
 */
export async function createNewsfeedPost(postData) {
  try {
    if (!postData.content || postData.content.trim() === '') {
      return { success: false, error: 'Post content is required' };
    }
    const payload = {
      visitor_email: postData.author_email || postData.visitor_email || null,
      content: postData.content,
      session_id: postData.session_id || null,
      ip_address: postData.ip_address || null,
      user_agent: postData.user_agent || null
    };
    const response = await fetch(buildVisitorUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to create post: ${response.statusText} - ${text}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Create newsfeed post error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Toggle like/unlike on a post. Requires visitor_email to identify who is
 * liking. Xano will handle the idempotent toggle.
 */
export async function toggleNewsfeedLike(postId, visitorData) {
  try {
    if (!visitorData.visitor_email) {
      return { success: false, error: 'Email required for liking posts' };
    }
    const payload = {
      visitor_email: visitorData.visitor_email,
      session_id: visitorData.session_id || null
    };
    const response = await fetch(buildVisitorUrl(`${postId}/like`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to toggle like: ${response.statusText} - ${text}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Toggle newsfeed like error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get analytics. If your Xano API has a `/newsfeed_analytics` endpoint, this
 * function calls it. Otherwise it returns zeros.
 */
export async function getNewsfeedAnalytics(timeRange = '7d') {
  try {
    const url = `${XANO_BASE_URL}/newsfeed_analytics?time_range=${timeRange}`;
    const response = await fetch(url);
    if (!response.ok) {
      // Fallback to empty analytics if endpoint missing.
      return {
        success: true,
        analytics: {
          overview: { total_posts: 0, total_replies: 0, total_likes: 0, total_comments: 0, engagement_rate: 0 },
          top_contributors: [],
          time_range: timeRange
        }
      };
    }
    return await response.json();
  } catch (err) {
    console.error('Get newsfeed analytics error:', err);
    return {
      success: false,
      error: err.message,
      analytics: {
        overview: { total_posts: 0, total_replies: 0, total_likes: 0, total_comments: 0, engagement_rate: 0 },
        top_contributors: [],
        time_range: timeRange
      }
    };
  }
}

/**
 * Search posts. If your API doesn’t support search on visitor posts, this
 * delegates to getNewsfeedPosts with a search filter or returns empty.
 */
export async function searchNewsfeedPosts(query, filters = {}) {
  try {
    const params = new URLSearchParams();
    params.append('search', query);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const url = buildVisitorUrl('', params);
    const response = await fetch(url);
    if (!response.ok) {
      // If search isn’t supported, return empty.
      return { success: true, posts: [], total: 0, pagination: { limit: 20, offset: 0, has_more: false } };
    }
    return await response.json();
  } catch (err) {
    console.error('Search newsfeed posts error:', err);
    return { success: false, error: err.message, posts: [] };
  }
}

/**
 * Create or update a visitor session. Your current API doesn’t provide a
 * visitor_sessions endpoint, so this function calls the register endpoint if
 * an email is provided. You can modify this logic to suit your data model.
 */
export async function createVisitorSession(sessionData) {
  try {
    if (!sessionData.email) {
      // No email? Nothing to do.
      return { success: true };
    }
    const payload = {
      email: sessionData.email,
      first_name: sessionData.name || '',
      last_name: '',
      name: sessionData.name || '',
      source: sessionData.source || 'newsfeed',
      ip_address: sessionData.ip_address || null,
      user_agent: sessionData.user_agent || null
    };
    const response = await fetch(`${XANO_BASE_URL}/visitor/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to register visitor: ${response.statusText} - ${text}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Create visitor session error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Convert a visitor to a member. No direct endpoint exists; returns an
 * informative error. Adjust this to match your membership logic.
 */
export async function convertVisitorToMember(visitorEmail, memberData) {
  return { success: false, error: 'convertVisitorToMember not implemented' };
}

/**
 * Get all posts by a visitor. Uses the email filter if supported; otherwise
 * returns empty.
 */
export async function getVisitorPosts(visitorEmail) {
  try {
    if (!visitorEmail) return { success: false, error: 'Email is required', posts: [] };
    const params = new URLSearchParams();
    params.append('visitor_email', visitorEmail);
    const response = await fetch(buildVisitorUrl('', params));
    if (!response.ok) {
      return { success: true, posts: [], total: 0, pagination: { limit: 20, offset: 0, has_more: false } };
    }
    return await response.json();
  } catch (err) {
    console.error('Get visitor posts error:', err);
    return { success: false, error: err.message, posts: [] };
  }
}

/**
 * Toggle like for visitor posts. Provided for legacy compatibility; delegates
 * to toggleNewsfeedLike.
 */
export async function toggleVisitorLike(postId, visitorData) {
  return toggleNewsfeedLike(postId, visitorData);
}

/**
 * Get trending posts. If your API doesn’t support trending, this calls
 * getNewsfeedPosts with a default limit.
 */
export async function getTrendingPosts(timeRange = '7d', limit = 10) {
  try {
    // Attempt to call a trending endpoint; fallback to latest posts
    const url = `${XANO_BASE_URL}/newsfeed_post/trending?time_range=${timeRange}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) {
      // Fallback to first `limit` posts
      const postsRes = await getNewsfeedPosts({ limit });
      return postsRes;
    }
    return await response.json();
  } catch (err) {
    console.error('Get trending posts error:', err);
    return { success: false, error: err.message, posts: [] };
  }
}

/**
 * Register a new visitor. Uses the `/visitor/register` endpoint.
 */
export async function registerVisitor(visitorData) {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to register visitor: ${response.statusText} - ${text}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Register visitor error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get visitor profile. Uses the `/visitor/profile` endpoint with a token or
 * other query parameters.
 */
export async function getVisitorProfile(query) {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor/profile?${query}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch visitor profile: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Get visitor profile error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Create a visitor post (legacy). Delegates to createNewsfeedPost.
 */
export async function createVisitorPost(postData) {
  return createNewsfeedPost(postData);
}

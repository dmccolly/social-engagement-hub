// Newsfeed service configured for Xano visitor endpoints

// Base URL derived from environment variable or fallback
const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

/**
 * Build a URL for the visitor posts API. Accepts additional path segments and
 * optional query parameters. Uses `/visitor/posts` as the root.
 *
 * @param {string} path Additional path segments
 * @param {URLSearchParams} [params] Query parameters
 */
function buildVisitorUrl(path = '', params) {
  const base = `${XANO_BASE_URL}/visitor/posts`;
  const suffix = path ? `/${path.replace(/^\//, '')}` : '';
  const query = params && params.toString() ? `?${params.toString()}` : '';
  return `${base}${suffix}${query}`;
}

/**
 * Get all approved visitor posts. Supports optional filters (e.g., search,
 * limit, offset). Returns data from the API.
 */
export async function getNewsfeedPosts(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const url = buildVisitorUrl('', params);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch posts: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    console.error('Get newsfeed posts error:', err);
    return { success: false, error: err.message, posts: [], total: 0, pagination: { limit: 20, offset: 0, has_more: false } };
  }
}

/**
 * Create a new visitor post. Requires `content` and optionally visitor info.
 */
export async function createNewsfeedPost(postData) {
  try {
    if (!postData.content || postData.content.trim() === '') {
      return { success: false, error: 'Post content is required' };
    }
    const payload = {
      visitor_email: postData.author_email || null,
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
 * Like or unlike a visitor post. Requires `visitor_email` to identify the liker.
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
      throw new Error(`Failed to like/unlike post: ${response.statusText} - ${text}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Toggle newsfeed like error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Add a reply to a visitor post. Requires `content` and the replier’s email.
 */
export async function addNewsfeedReply(postId, replyData) {
  try {
    if (!replyData.content || replyData.content.trim() === '') {
      return { success: false, error: 'Reply content is required' };
    }
    if (!replyData.visitor_email) {
      return { success: false, error: 'Email is required to reply' };
    }
    const payload = {
      visitor_email: replyData.visitor_email,
      content: replyData.content,
      session_id: replyData.session_id || null,
      ip_address: replyData.ip_address || null,
      user_agent: replyData.user_agent || null
    };
    const response = await fetch(buildVisitorUrl(`${postId}/replies`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to add reply: ${response.statusText} - ${text}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Add newsfeed reply error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch visitor profile by token or email. If Xano uses tokens, modify accordingly.
 */
export async function getVisitorProfile(visitorToken) {
  try {
    const url = `${XANO_BASE_URL}/visitor/profile?token=${visitorToken}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch visitor profile: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    console.error('Get visitor profile error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Register a new visitor. Wraps the `/visitor/register` endpoint.
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

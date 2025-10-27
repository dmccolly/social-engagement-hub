// Updated newsfeed service to align with Xano endpoint names
// NOTE: The existing code expected endpoints under `newsfeed_posts`.  Since your Xano
// API group exposes endpoints under `newsfeed_post` (singular), this module
// normalises the base URL and uses the singular slug for all requests.  If you
// later rename your Xano endpoints to `newsfeed_posts`, you can revert these
// changes.

// Use whichever env var is defined: REACT_APP_XANO_BASE_URL or REACT_APP_XANO_API_URL.
// This provides flexibility if your build uses one or the other.
const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || 
  (typeof window !== 'undefined' ? '/xano' : 
    (process.env.REACT_APP_XANO_BASE_URL || process.env.REACT_APP_XANO_API_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5'));

/**
 * Build a URL for the newsfeed API. Uses the singular `newsfeed_post` slug,
 * matching the endpoints defined in Xano. Accepts optional query parameters.
 *
 * @param {string} path Additional path segments (e.g. `/123/replies`)
 * @param {URLSearchParams} [params] Optional query parameters
 * @returns {string} Full API URL
 */
function buildUrl(path = '', params) {
  const base = `${XANO_BASE_URL}/newsfeed_post`;
  const suffix = path ? `/${path.replace(/^\//, '')}` : '';
  const query = params && params.toString() ? `?${params.toString()}` : '';
  return `${base}${suffix}${query}`;
}

/**
 * Fetch a list of posts. Supports optional filters for type, author, search,
 * pagination and visitor email. Returns an object with `success`, `posts`,
 * `total` and `pagination` keys.
 */
export async function getNewsfeedPosts(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.author_id) params.append('author_id', filters.author_id);
    if (filters.author_email) params.append('author_email', filters.author_email);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    if (filters.visitor_email) params.append('visitor_email', filters.visitor_email);
    const url = buildUrl('', params);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    return await response.json();
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
}

/**
 * Fetch replies for a given post ID. Returns an array of reply objects.
 *
 * @param {number|string} postId The ID of the post
 */
export async function getNewsfeedReplies(postId) {
  try {
    const url = buildUrl(`${postId}/replies`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch replies: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Get newsfeed replies error:', error);
    return { success: false, error: error.message, replies: [], total: 0 };
  }
}

/**
 * Create a new post or reply. Requires `content` and `author_name`.
 *
 * @param {object} postData
 */
export async function createNewsfeedPost(postData) {
  try {
    // Ensure required fields are present
    const content = postData.content?.trim();
    const authorName = postData.author_name?.trim();
    if (!content) {
      return { success: false, error: 'Post content is required' };
    }
    if (!authorName) {
      return { success: false, error: 'Author name is required' };
    }
    // Build minimal payload expected by the Xano newsfeed_post endpoint.
    const payload = {
      author_name: authorName,
      author_email: postData.author_email || null,
      content: content
    };
    const response = await fetch(buildUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create post: ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Create newsfeed post error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle like on a post. Requires the liker's email.
 *
 * @param {number|string} postId
 * @param {string} authorEmail
 */
export async function toggleNewsfeedLike(postId, authorEmail) {
  try {
    if (!authorEmail) {
      return { success: false, error: 'Email required for liking posts' };
    }
    const payload = {
      author_email: authorEmail
    };
    const response = await fetch(buildUrl(`${postId}/like`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to like post: ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Toggle newsfeed like error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch analytics for a given time range.
 *
 * @param {string} timeRange One of '7d', '30d', '90d'
 */
export async function getNewsfeedAnalytics(timeRange = '7d') {
  try {
    const url = `${XANO_BASE_URL}/newsfeed_analytics?time_range=${timeRange}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }
    return await response.json();
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
}

/**
 * Create or update a visitor session. Relies on a `visitor_sessions` endpoint in
 * your Xano API group.
 *
 * @param {object} sessionData
 */
export async function createVisitorSession(sessionData) {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    return await response.json();
  } catch (error) {
    console.error('Create visitor session error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Convert a visitor to a member. Assumes your Xano API has an endpoint
 * `/visitor_sessions/convert` that accepts the visitor email and member data.
 */
export async function convertVisitorToMember(visitorEmail, memberData) {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_email: visitorEmail,
        member_data: memberData
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to convert visitor: ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Convert visitor to member error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Search posts with a query and optional filters. Uses the search endpoint on
 * `newsfeed_post`.
 *
 * @param {string} query
 * @param {object} filters
 */
export async function searchNewsfeedPosts(query, filters = {}) {
  try {
    const params = new URLSearchParams();
    params.append('search', query);
    if (filters.author) params.append('author', filters.author);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.limit) params.append('limit', filters.limit);
    const url = `${XANO_BASE_URL}/newsfeed_post/search?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to search posts: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Search newsfeed posts error:', error);
    return { success: false, error: error.message, posts: [] };
  }
}

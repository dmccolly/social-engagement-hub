/**
 * Xano API Configuration
 * Social Engagement Hub - Visitor & Admin Endpoints
 */

// Xano Instance Configuration
export const XANO_CONFIG = {
  instance: 'xajo-bs7d-cagt.n7e.xano.io',
  workspace: 'Digital Media Archive',
  apiGroup: 'EmailMarketing',
  // TODO: Update this with your actual API group path from Xano dashboard
  basePath: '/api:YOUR_API_GROUP_PATH',
};

// Full API Base URL
export const API_BASE_URL = `https://${XANO_CONFIG.instance}${XANO_CONFIG.basePath}`;

// Visitor Endpoints
export const VISITOR_ENDPOINTS = {
  getProfile: '/visitor/profile',
  updateProfile: '/visitor/profile',
  createPost: '/visitor/posts',
  getPosts: '/visitor/posts',
  replyToPost: (id) => `/visitor/posts/${id}/replies`,
  likePost: (id) => `/visitor/posts/${id}/like`,
};

// Admin Endpoints
export const ADMIN_ENDPOINTS = {
  getPendingPosts: '/admin/visitor/posts/pending',
  approvePost: (id) => `/admin/visitor/posts/${id}/approve`,
  rejectPost: (id) => `/admin/visitor/posts/${id}/reject`,
};

// Endpoint IDs (for reference)
export const ENDPOINT_IDS = {
  visitor: {
    getProfile: 133,
    updateProfile: 134,
    createPost: 135,
    getPosts: 136,
    replyToPost: 137,
    likePost: 138,
  },
  admin: {
    getPendingPosts: 192,
    approvePost: 193,
    rejectPost: 194,
  },
};

export default {
  XANO_CONFIG,
  API_BASE_URL,
  VISITOR_ENDPOINTS,
  ADMIN_ENDPOINTS,
  ENDPOINT_IDS,
};

// Visitor Retention Enhancement Services

const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || 
  (typeof window !== 'undefined' ? '/xano' : 
    (process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV'));

/**
 * Get enhanced visitor data including activity history
 */
export const getEnhancedVisitorData = async (sessionId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/${sessionId}/enhanced`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch enhanced visitor data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get enhanced visitor data error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update visitor session activity
 */
export const updateVisitorSession = async (sessionId, updateData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update visitor session: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update visitor session error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get member activity and preferences
 */
export const getMemberActivity = async (memberId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/members/${memberId}/activity`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch member activity: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get member activity error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get member preferences
 */
export const getMemberPreferences = async (memberId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/members/${memberId}/preferences`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch member preferences: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get member preferences error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Track visitor engagement metrics
 */
export const trackVisitorEngagement = async (sessionId, engagementData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/${sessionId}/engagement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(engagementData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to track engagement: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Track visitor engagement error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get visitor engagement analytics
 */
export const getVisitorEngagementAnalytics = async (visitorEmail, timeRange = '30d') => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/analytics?email=${visitorEmail}&time_range=${timeRange}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch engagement analytics: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get visitor engagement analytics error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get reply suggestions based on visitor history
 */
export const getReplySuggestions = async (postContent, visitorEmail) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_content: postContent,
        visitor_email: visitorEmail
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get reply suggestions: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get reply suggestions error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save visitor draft post
 */
export const saveVisitorDraft = async (sessionId, draftData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/${sessionId}/drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draftData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save draft: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Save visitor draft error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get visitor draft posts
 */
export const getVisitorDrafts = async (sessionId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/${sessionId}/drafts`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch visitor drafts: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get visitor drafts error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get visitor notifications
 */
export const getVisitorNotifications = async (visitorEmail, sinceDate = null) => {
  try {
    const params = new URLSearchParams();
    params.append('email', visitorEmail);
    if (sinceDate) params.append('since', sinceDate);
    
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/notifications?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch visitor notifications: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get visitor notifications error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark visitor notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/visitor_sessions/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to mark notification as read: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return { success: false, error: error.message };
  }
};

// Enhanced localStorage management with fallbacks
export const enhancedLocalStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('LocalStorage set error:', error);
      // Fallback to sessionStorage
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (sessionError) {
        console.error('SessionStorage fallback error:', sessionError);
        return false;
      }
    }
  },
  
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      // Fallback to sessionStorage
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (sessionError) {
        console.error('SessionStorage fallback error:', sessionError);
        return null;
      }
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }
};

// Cookie-based fallback for visitor tracking
export const visitorCookieManager = {
  setCookie: (name, value, days = 365) => {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
      return true;
    } catch (error) {
      console.error('Set cookie error:', error);
      return false;
    }
  },
  
  getCookie: (name) => {
    try {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
        }
      }
      return null;
    } catch (error) {
      console.error('Get cookie error:', error);
      return null;
    }
  },
  
  deleteCookie: (name) => {
    try {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
      return true;
    } catch (error) {
      console.error('Delete cookie error:', error);
      return false;
    }
  }
};

// Cross-tab communication for session synchronization
export const crossTabSessionSync = {
  broadcastSessionUpdate: (sessionData) => {
    try {
      window.postMessage({ type: 'visitor_session_update', session: sessionData }, '*');
    } catch (error) {
      console.error('Broadcast session update error:', error);
    }
  },
  
  listenForSessionUpdates: (callback) => {
    const handleMessage = (event) => {
      if (event.data.type === 'visitor_session_update') {
        callback(event.data.session);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }
};

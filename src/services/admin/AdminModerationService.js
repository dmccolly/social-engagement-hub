// Admin Moderation Service - Integrates with XANO Email Marketing API
// Provides moderation queue management and content approval workflows

const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || 
  (typeof window !== 'undefined' ? '/xano' : 
    (process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5'));

export class AdminModerationService {
  constructor() {
    this.moderationQueue = [];
    this.moderationRules = {
      autoApprove: true, // Default to auto-approve
      spamThreshold: 7,  // Score above this requires review
      blockedKeywords: [
        'buy now', 'click here', 'free money', 'viagra', 'casino',
        'loan', 'debt', 'weight loss', 'make money fast', 'work from home',
        'urgent', 'act now', 'limited time', 'guaranteed', 'risk free'
      ]
    };
  }

  // Get moderation queue
  async getModerationQueue(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.contentType) params.append('content_type', filters.contentType);
      if (filters.dateRange) params.append('date_range', filters.dateRange);
      
      const url = `${XANO_BASE_URL}/admin/moderation/queue${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch moderation queue: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get moderation queue error:', error);
      return { success: false, error: error.message, items: [], total: 0 };
    }
  }

  // Approve content
  async approveContent(contentId, contentType = 'post') {
    try {
      const response = await fetch(`${XANO_BASE_URL}/admin/content/${contentId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_type: contentType,
          approved_by: 'admin', // In production, use actual admin ID
          approved_at: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to approve content: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Approve content error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reject content
  async rejectContent(contentId, contentType = 'post', reason = 'inappropriate') {
    try {
      const response = await fetch(`${XANO_BASE_URL}/admin/content/${contentId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_type: contentType,
          rejection_reason: reason,
          rejected_by: 'admin', // In production, use actual admin ID
          rejected_at: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reject content: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Reject content error:', error);
      return { success: false, error: error.message };
    }
  }

  // Bulk approve/reject
  async bulkModerate(contentIds, action = 'approve', contentType = 'post') {
    try {
      const results = [];
      
      for (const contentId of contentIds) {
        const result = action === 'approve' 
          ? await this.approveContent(contentId, contentType)
          : await this.rejectContent(contentId, contentType);
        
        results.push({
          contentId,
          success: result.success,
          error: result.error
        });
      }
      
      return {
        success: results.every(r => r.success),
        results,
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      console.error('Bulk moderate error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get moderation analytics
  async getModerationAnalytics(timeRange = '7d') {
    try {
      const response = await fetch(`${XANO_BASE_URL}/admin/analytics/moderation?time_range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch moderation analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get moderation analytics error:', error);
      return { 
        success: false, 
        error: error.message,
        analytics: {
          total_flagged: 0,
          total_approved: 0,
          total_rejected: 0,
          approval_rate: 0,
          rejection_rate: 0
        }
      };
    }
  }

  // Get visitor statistics
  async getVisitorStats(timeRange = '7d') {
    try {
      const response = await fetch(`${XANO_BASE_URL}/admin/analytics/visitors?time_range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch visitor stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get visitor stats error:', error);
      return { 
        success: false, 
        error: error.message,
        stats: {
          total_visitors: 0,
          new_visitors: 0,
          returning_visitors: 0,
          conversion_rate: 0,
          engagement_rate: 0
        }
      };
    }
  }

  // Get content statistics
  async getContentStats(timeRange = '7d') {
    try {
      const response = await fetch(`${XANO_BASE_URL}/admin/analytics/content?time_range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get content stats error:', error);
      return { 
        success: false, 
        error: error.message,
        stats: {
          total_posts: 0,
          total_replies: 0,
          total_likes: 0,
          average_engagement: 0,
          top_performing_content: []
        }
      };
    }
  }

  // Update moderation settings
  async updateModerationSettings(settings) {
    try {
      const response = await fetch(`${XANO_BASE_URL}/admin/moderation/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update moderation settings: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.moderationRules = { ...this.moderationRules, ...settings };
      return data;
    } catch (error) {
      console.error('Update moderation settings error:', error);
      return { success: false, error: error.message };
    }
  }

  // Content pre-moderation (for auto-approval)
  async preModerateContent(content, visitorEmail) {
    try {
      const response = await fetch(`${XANO_BASE_URL}/admin/content/pre-moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          visitor_email: visitorEmail,
          rules: this.moderationRules
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to pre-moderate content: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Pre-moderate content error:', error);
      return { 
        success: true, // Default to allow if pre-moderation fails
        approved: true,
        auto_approved: true,
        error: error.message
      };
    }
  }

  // Get moderation history
  async getModerationHistory(visitorEmail = null, limit = 50) {
    try {
      const params = new URLSearchParams();
      if (visitorEmail) params.append('visitor_email', visitorEmail);
      params.append('limit', limit);
      
      const response = await fetch(`${XANO_BASE_URL}/admin/moderation/history?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch moderation history: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get moderation history error:', error);
      return { success: false, error: error.message, history: [] };
    }
  }
}

// Export both named and default for compatibility
export default AdminModerationService;

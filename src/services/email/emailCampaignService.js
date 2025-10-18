// src/services/email/emailCampaignService.js

const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

/**
 * Get all email campaigns
 */
export const getCampaigns = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const url = `${XANO_BASE_URL}/email_campaigns${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
    }
    
    const campaigns = await response.json();
    return { success: true, campaigns };
  } catch (error) {
    console.error('Get campaigns error:', error);
    return { success: false, error: error.message, campaigns: [] };
  }
};

/**
 * Get a single campaign by ID
 */
export const getCampaign = async (campaignId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaignId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign: ${response.statusText}`);
    }
    
    const campaign = await response.json();
    return { success: true, campaign };
  } catch (error) {
    console.error('Get campaign error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a new campaign
 */
export const createCampaign = async (campaignData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: campaignData.name,
        subject: campaignData.subject,
        preview_text: campaignData.preview_text || '',
        html_content: campaignData.html_content,
        plain_text_content: campaignData.plain_text_content || '',
        status: campaignData.status || 'draft',
        recipient_count: campaignData.recipient_count || 0,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create campaign: ${response.statusText} - ${errorText}`);
    }
    
    const campaign = await response.json();
    return { success: true, campaign };
  } catch (error) {
    console.error('Create campaign error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing campaign
 */
export const updateCampaign = async (campaignId, campaignData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update campaign: ${response.statusText}`);
    }
    
    const campaign = await response.json();
    return { success: true, campaign };
  } catch (error) {
    console.error('Update campaign error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a campaign
 */
export const deleteCampaign = async (campaignId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaignId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete campaign: ${response.statusText}`);
    }
    
    return { success: true, message: 'Campaign deleted successfully' };
  } catch (error) {
    console.error('Delete campaign error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send campaign to recipients
 */
export const sendCampaign = async (campaignId, recipientIds) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaignId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient_ids: recipientIds,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send campaign: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Send campaign error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get campaign analytics
 */
export const getCampaignAnalytics = async (campaignId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaignId}/analytics`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }
    
    const analytics = await response.json();
    return { success: true, analytics };
  } catch (error) {
    console.error('Get campaign analytics error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get campaign sends (individual recipient data)
 */
export const getCampaignSends = async (campaignId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const url = `${XANO_BASE_URL}/email_campaigns/${campaignId}/sends${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign sends: ${response.statusText}`);
    }
    
    const sends = await response.json();
    return { success: true, sends };
  } catch (error) {
    console.error('Get campaign sends error:', error);
    return { success: false, error: error.message, sends: [] };
  }
};

/**
 * Schedule campaign for future sending
 */
export const scheduleCampaign = async (campaignId, scheduledFor) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaignId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduled_for: scheduledFor,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to schedule campaign: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Schedule campaign error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel scheduled campaign
 */
export const cancelScheduledCampaign = async (campaignId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaignId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to cancel campaign: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Cancel campaign error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Duplicate campaign
 */
export const duplicateCampaign = async (campaignId, newName) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaignId}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newName,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to duplicate campaign: ${response.statusText} - ${errorText}`);
    }
    
    const campaign = await response.json();
    return { success: true, campaign };
  } catch (error) {
    console.error('Duplicate campaign error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get campaign templates
 */
export const getCampaignTemplates = async () => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/templates`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }
    
    const templates = await response.json();
    return { success: true, templates };
  } catch (error) {
    console.error('Get campaign templates error:', error);
    return { success: false, error: error.message, templates: [] };
  }
};

/**
 * Create campaign from template
 */
export const createCampaignFromTemplate = async (templateId, campaignData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/templates/${templateId}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create campaign from template: ${response.statusText} - ${errorText}`);
    }
    
    const campaign = await response.json();
    return { success: true, campaign };
  } catch (error) {
    console.error('Create campaign from template error:', error);
    return { success: false, error: error.message };
  }
};
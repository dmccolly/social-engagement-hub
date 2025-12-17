const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || 
  (typeof window !== 'undefined' ? '/xano' : 
    (process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV'));

// LocalStorage helper for campaigns
const localStorageHelper = {
  STORAGE_KEY: 'email_campaigns_local',
  
  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },
  
  save(campaigns) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(campaigns));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  create(campaign) {
    const campaigns = this.getAll();
    const newCampaign = {
      ...campaign,
      id: Date.now(), // Use timestamp as ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    campaigns.push(newCampaign);
    this.save(campaigns);
    return newCampaign;
  },
  
  update(id, updates) {
    const campaigns = this.getAll();
    const index = campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    campaigns[index] = {
      ...campaigns[index],
      ...updates,
      id, // Preserve original ID
      updated_at: new Date().toISOString()
    };
    this.save(campaigns);
    return campaigns[index];
  },
  
  delete(id) {
    const campaigns = this.getAll();
    const filtered = campaigns.filter(c => c.id !== id);
    this.save(filtered);
    return { success: true };
  }
};

// Campaign API with localStorage fallback
export const campaignAPI = {
  async getAll() {
    try {
      const response = await fetch(`${XANO_BASE_URL}/email_campaigns`);
      if (!response.ok) {
        // If Xano fails, use localStorage
        console.warn('Xano unavailable, using localStorage for campaigns');
        return localStorageHelper.getAll();
      }
      const data = await response.json();
      // Handle null or non-array responses
      const campaigns = Array.isArray(data) ? data : [];
      // Filter out soft-deleted campaigns (status='deleted')
      return campaigns.filter(c => c.status !== 'deleted');
    } catch (error) {
      console.warn('Xano unavailable, using localStorage for campaigns:', error.message);
      return localStorageHelper.getAll();
    }
  },

  async create(campaign) {
    try {
      const response = await fetch(`${XANO_BASE_URL}/email_campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaign.name,
          subject: campaign.subject,
          from_name: campaign.fromName,
          from_email: campaign.fromEmail,
          html_content: campaign.htmlContent || '',
          blocks: JSON.stringify(campaign.blocks || []),
          status: campaign.status || 'draft',
          scheduled_at: campaign.scheduledAt || null
        })
      });
      if (!response.ok) {
        console.warn('Xano unavailable, using localStorage for campaign creation');
        return localStorageHelper.create({
          name: campaign.name,
          subject: campaign.subject,
          from_name: campaign.fromName,
          from_email: campaign.fromEmail,
          html_content: campaign.htmlContent || '',
          blocks: JSON.stringify(campaign.blocks || []),
          status: campaign.status || 'draft',
          scheduled_at: campaign.scheduledAt || null
        });
      }
      return response.json();
    } catch (error) {
      console.warn('Xano unavailable, using localStorage for campaign creation:', error.message);
      return localStorageHelper.create({
        name: campaign.name,
        subject: campaign.subject,
        from_name: campaign.fromName,
        from_email: campaign.fromEmail,
        html_content: campaign.htmlContent || '',
        blocks: JSON.stringify(campaign.blocks || []),
        status: campaign.status || 'draft',
        scheduled_at: campaign.scheduledAt || null
      });
    }
  },

  async update(id, campaign) {
    try {
      const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaign.name,
          subject: campaign.subject,
          from_name: campaign.fromName,
          from_email: campaign.fromEmail,
          html_content: campaign.htmlContent || '',
          blocks: JSON.stringify(campaign.blocks || []),
          status: campaign.status,
          scheduled_at: campaign.scheduledAt || null
        })
      });
      if (!response.ok) {
        console.warn('Xano unavailable, using localStorage for campaign update');
        return localStorageHelper.update(id, {
          name: campaign.name,
          subject: campaign.subject,
          from_name: campaign.fromName,
          from_email: campaign.fromEmail,
          html_content: campaign.htmlContent || '',
          blocks: JSON.stringify(campaign.blocks || []),
          status: campaign.status,
          scheduled_at: campaign.scheduledAt || null
        });
      }
      return response.json();
    } catch (error) {
      console.warn('Xano unavailable, using localStorage for campaign update:', error.message);
      return localStorageHelper.update(id, {
        name: campaign.name,
        subject: campaign.subject,
        from_name: campaign.fromName,
        from_email: campaign.fromEmail,
        html_content: campaign.htmlContent || '',
        blocks: JSON.stringify(campaign.blocks || []),
        status: campaign.status,
        scheduled_at: campaign.scheduledAt || null
      });
    }
  },

  async delete(id) {
    try {
      // Xano DELETE endpoint is misconfigured (returns 400 error for all IDs)
      // Use soft delete via PATCH to set status='deleted' instead
      const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'deleted' })
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to delete campaign from backend:', response.status, errorText);
        return { error: `Failed to delete: ${response.status} ${errorText}` };
      }
      
      return { success: true };
    } catch (error) {
      // Only fall back to localStorage on true network failures
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('Network error, using localStorage for campaign deletion:', error.message);
        return localStorageHelper.delete(id);
      }
      // For other errors, report them
      console.error('Error deleting campaign:', error);
      return { error: error.message };
    }
  }
};

// Contact API
export const contactAPI = {
  async getAll() {
    try {
      const response = await fetch(`${XANO_BASE_URL}/email_contacts`);
      if (!response.ok) {
        console.warn('Failed to fetch contacts from Xano');
        return [];
      }
      const data = await response.json();
      // Handle null or non-array responses
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Error fetching contacts:', error.message);
      return [];
    }
  },

  async create(contact) {
    const response = await fetch(`${XANO_BASE_URL}/email_contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: contact.email,
        first_name: contact.firstName || '',
        last_name: contact.lastName || '',
        company: contact.company || '',
        status: contact.status || 'active'
      })
    });
    if (!response.ok) throw new Error('Failed to create contact');
    return response.json();
  },

  async bulkImport(contacts) {
    const response = await fetch(`${XANO_BASE_URL}/email_contacts/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts })
    });
    if (!response.ok) throw new Error('Failed to import contacts');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${XANO_BASE_URL}/email_contacts/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete contact');
    return response.json();
  }
};

// Group/List API
export const groupAPI = {
  async getAll() {
    try {
      const response = await fetch(`${XANO_BASE_URL}/email_groups`);
      if (!response.ok) {
        console.warn('Failed to fetch groups from Xano');
        return [];
      }
      const data = await response.json();
      // Handle null or non-array responses
      const groups = Array.isArray(data) ? data : [];
      
      // Fetch member data for each group
      const groupsWithMembers = await Promise.all(
        groups.map(async (group) => {
          try {
            const membersResponse = await fetch(`${XANO_BASE_URL}/email_groups/${group.id}/contacts`);
            if (membersResponse.ok) {
              const members = await membersResponse.json();
              const memberArray = Array.isArray(members) ? members : [];
              return {
                ...group,
                member_count: memberArray.length,
                members: memberArray
              };
            }
          } catch (err) {
            console.warn(`Error fetching members for group ${group.id}:`, err.message);
          }
          return { ...group, member_count: 0, members: [] };
        })
      );
      
      return groupsWithMembers;
    } catch (error) {
      console.warn('Error fetching groups:', error.message);
      return [];
    }
  },

  async create(group) {
    const response = await fetch(`${XANO_BASE_URL}/email_groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: group.name,
        description: group.description || '',
        tags: group.tags || ''
      })
    });
    if (!response.ok) throw new Error('Failed to create group');
    return response.json();
  },

  async update(id, group) {
    const response = await fetch(`${XANO_BASE_URL}/email_groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: group.name,
        description: group.description,
        tags: group.tags
      })
    });
    if (!response.ok) throw new Error('Failed to update group');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${XANO_BASE_URL}/email_groups/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete group');
    return response.json();
  },

  async addMembers(groupId, contactIds) {
    const response = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_ids: contactIds })
    });
    if (!response.ok) throw new Error('Failed to add members');
    return response.json();
  },

  async getMembers(groupId) {
    const response = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}/contacts`);
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  }
};


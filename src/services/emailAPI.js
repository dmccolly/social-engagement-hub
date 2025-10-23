const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

// Campaign API
export const campaignAPI = {
  async getAll() {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns`);
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return response.json();
  },

  async create(campaign) {
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
    if (!response.ok) throw new Error('Failed to create campaign');
    return response.json();
  },

  async update(id, campaign) {
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
    if (!response.ok) throw new Error('Failed to update campaign');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${XANO_BASE_URL}/email_campaigns/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete campaign');
    return response.json();
  }
};

// Contact API
export const contactAPI = {
  async getAll() {
    const response = await fetch(`${XANO_BASE_URL}/email_contacts`);
    if (!response.ok) throw new Error('Failed to fetch contacts');
    return response.json();
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
    const response = await fetch(`${XANO_BASE_URL}/email_groups`);
    if (!response.ok) throw new Error('Failed to fetch groups');
    return response.json();
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
    const response = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}/members`);
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  }
};


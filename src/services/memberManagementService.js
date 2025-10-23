const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

/**
 * Get all members with filters
 */
export const getMembers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    
    const url = `${XANO_BASE_URL}/members${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, members: data.members || data, pagination: data.pagination };
  } catch (error) {
    console.error('Get members error:', error);
    return { success: false, error: error.message, members: [] };
  }
};

/**
 * Get a single member by ID
 */
export const getMember = async (memberId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/members/${memberId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch member: ${response.statusText}`);
    }
    
    const member = await response.json();
    return { success: true, member };
  } catch (error) {
    console.error('Get member error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a new member
 */
export const createMember = async (memberData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: memberData.name,
        email: memberData.email,
        role: memberData.role || 'member',
        status: memberData.status || 'active',
        phone: memberData.phone || '',
        bio: memberData.bio || '',
        location: memberData.location || '',
        website: memberData.website || '',
        social_links: memberData.social_links || {},
        preferences: memberData.preferences || {},
        avatar_url: memberData.avatar_url || '',
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create member: ${response.statusText} - ${errorText}`);
    }
    
    const member = await response.json();
    return { success: true, member };
  } catch (error) {
    console.error('Create member error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing member
 */
export const updateMember = async (memberId, memberData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/members/${memberId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update member: ${response.statusText}`);
    }
    
    const member = await response.json();
    return { success: true, member };
  } catch (error) {
    console.error('Update member error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a member
 */
export const deleteMember = async (memberId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/members/${memberId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete member: ${response.statusText}`);
    }
    
    return { success: true, message: 'Member deleted successfully' };
  } catch (error) {
    console.error('Delete member error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Bulk update multiple members
 */
export const bulkUpdateMembers = async (memberIds, updates) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/members/bulk-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        member_ids: memberIds,
        updates: updates,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to bulk update members: ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Bulk update members error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update member activity counters
 */
export const updateMemberActivity = async (memberId, activityType, increment = 1) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/members/${memberId}/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activity_type: activityType,
        increment: increment,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update member activity: ${response.statusText} - ${errorText}`);
    }
    
    const member = await response.json();
    return { success: true, member };
  } catch (error) {
    console.error('Update member activity error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get member statistics
 */
export const getMemberStats = async () => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/members/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch member stats: ${response.statusText}`);
    }
    
    const stats = await response.json();
    return { success: true, stats };
  } catch (error) {
    console.error('Get member stats error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Search members
 */
export const searchMembers = async (query, limit = 10) => {
  try {
    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) params.append('limit', limit);
    
    const url = `${XANO_BASE_URL}/members/search?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to search members: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, results: data.results || data, count: data.count };
  } catch (error) {
    console.error('Search members error:', error);
    return { success: false, error: error.message, results: [] };
  }
};

/**
 * Export members to CSV
 */
export const exportMembers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    
    const url = `${XANO_BASE_URL}/members/export${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to export members: ${response.statusText}`);
    }
    
    const csv = await response.text();
    return { success: true, csv };
  } catch (error) {
    console.error('Export members error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Download CSV file
 */
export const downloadMembersCSV = async (filters = {}) => {
  try {
    const result = await exportMembers(filters);
    
    if (!result.success) {
      throw new Error('Failed to export members');
    }
    
    const blob = new Blob([result.csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `members-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Download members CSV error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Track member post activity
 */
export const trackMemberPost = async (memberId) => {
  return updateMemberActivity(memberId, 'post', 1);
};

/**
 * Track member comment activity
 */
export const trackMemberComment = async (memberId) => {
  return updateMemberActivity(memberId, 'comment', 1);
};

/**
 * Track member like activity
 */
export const trackMemberLike = async (memberId) => {
  return updateMemberActivity(memberId, 'like', 1);
};

/**
 * Get member by email
 */
export const getMemberByEmail = async (email) => {
  try {
    const result = await searchMembers(email, 1);
    
    if (!result.success || !result.results || result.results.length === 0) {
      return { success: false, error: 'Member not found' };
    }
    
    const member = result.results.find(m => m.email === email);
    
    if (!member) {
      return { success: false, error: 'Member not found' };
    }
    
    return { success: true, member };
  } catch (error) {
    console.error('Get member by email error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Bulk delete members
 */
export const bulkDeleteMembers = async (memberIds) => {
  try {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const memberId of memberIds) {
      const result = await deleteMember(memberId);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({
          memberId,
          error: result.error
        });
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Bulk delete members error:', error);
    return { success: false, error: error.message };
  }
};

// src/services/email/emailGroupService.js

const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || 
  (typeof window !== 'undefined' ? '/xano' : 
    (process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5'));

/**
 * Get all email groups
 */
export const getGroups = async () => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_groups`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch groups: ${response.statusText}`);
    }
    
    const groups = await response.json();
    return { success: true, groups };
  } catch (error) {
    console.error('Get groups error:', error);
    return { success: false, error: error.message, groups: [] };
  }
};

/**
 * Get a single group by ID
 */
export const getGroup = async (groupId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch group: ${response.statusText}`);
    }
    
    const group = await response.json();
    return { success: true, group };
  } catch (error) {
    console.error('Get group error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a new group
 */
export const createGroup = async (groupData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: groupData.name,
        description: groupData.description || ''
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create group: ${response.statusText} - ${errorText}`);
    }
    
    const group = await response.json();
    return { success: true, group };
  } catch (error) {
    console.error('Create group error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing group
 */
export const updateGroup = async (groupId, groupData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update group: ${response.statusText}`);
    }
    
    const group = await response.json();
    return { success: true, group };
  } catch (error) {
    console.error('Update group error:', error);
    return { success: false, error: error.message };
  }
};

/**
   * Delete a group
   */
  export const deleteGroup = async (groupId) => {
      try {
        // Send search parameter in request body
        const response = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            search: groupId
          }),
        });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete group failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to delete group (${response.status}): ${errorText || response.statusText}`);
      }
      
      // Try to parse response, but don't fail if it's empty
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      }
      
      return { success: true, message: 'Group deleted successfully', result };
    } catch (error) {
      console.error('Delete group error:', error);
      return { success: false, error: error.message };
    }
  };/**
 * Get all contacts in a group
 */
export const getGroupContacts = async (groupId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}/contacts`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch group contacts: ${response.statusText}`);
    }
    
    const contacts = await response.json();
    return { success: true, contacts };
  } catch (error) {
    console.error('Get group contacts error:', error);
    return { success: false, error: error.message, contacts: [] };
  }
};

/**
 * Add contacts to a group
 */
export const addContactsToGroup = async (groupId, contactIds) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact_ids: contactIds
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add contacts to group: ${response.statusText}`);
    }
    
    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Add contacts to group error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove a contact from a group
 */
export const removeContactFromGroup = async (groupId, contactId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_groups/${groupId}/contacts/${contactId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to remove contact from group: ${response.statusText}`);
    }
    
    return { success: true, message: 'Contact removed from group' };
  } catch (error) {
    console.error('Remove contact from group error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get group statistics
 */
export const getGroupStats = async (groupId) => {
  try {
    const contactsResult = await getGroupContacts(groupId);
    
    if (!contactsResult.success) {
      throw new Error('Failed to get group contacts');
    }
    
    const contacts = contactsResult.contacts;
    const stats = {
      total: contacts.length,
      subscribed: contacts.filter(c => c.status === 'subscribed').length,
      unsubscribed: contacts.filter(c => c.status === 'unsubscribed').length,
      bounced: contacts.filter(c => c.status === 'bounced').length,
      members: contacts.filter(c => c.member_type === 'member').length,
      nonMembers: contacts.filter(c => c.member_type === 'non-member').length
    };
    
    return { success: true, stats };
  } catch (error) {
    console.error('Get group stats error:', error);
    return { success: false, error: error.message };
  }
};

// src/services/email/emailContactService.js

const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || 
  (typeof window !== 'undefined' ? '/xano' : 
    (process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV'));

/**
 * Get all email contacts with optional filtering
 */
export const getContacts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.member_type) params.append('member_type', filters.member_type);
    if (filters.group_id) params.append('group_id', filters.group_id);
    if (filters.search) params.append('search', filters.search);
    
    const url = `${XANO_BASE_URL}/email_contacts${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }
    
    const contacts = await response.json();
    return { success: true, contacts };
  } catch (error) {
    console.error('Get contacts error:', error);
    return { success: false, error: error.message, contacts: [] };
  }
};

/**
 * Get a single contact by ID
 */
export const getContact = async (contactId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_contacts/${contactId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch contact: ${response.statusText}`);
    }
    
    const contact = await response.json();
    return { success: true, contact };
  } catch (error) {
    console.error('Get contact error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a new contact
 */
export const createContact = async (contactData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: contactData.email,
        first_name: contactData.first_name || '',
        last_name: contactData.last_name || '',
        member_type: contactData.member_type || 'non-member',
        status: contactData.status || 'subscribed'
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create contact: ${response.statusText} - ${errorText}`);
    }
    
    const contact = await response.json();
    return { success: true, contact };
  } catch (error) {
    console.error('Create contact error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing contact
 */
export const updateContact = async (contactId, contactData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.statusText}`);
    }
    
    const contact = await response.json();
    return { success: true, contact };
  } catch (error) {
    console.error('Update contact error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a contact
 */
export const deleteContact = async (contactId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/email_contacts/${contactId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete contact: ${response.statusText}`);
    }
    
    return { success: true, message: 'Contact deleted successfully' };
  } catch (error) {
    console.error('Delete contact error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Import contacts from CSV data
 */
export const importContacts = async (contactsArray) => {
  try {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const contact of contactsArray) {
      const result = await createContact(contact);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({
          email: contact.email,
          error: result.error
        });
      }
    }
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Import contacts error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export contacts to CSV format
 */
export const exportContacts = async (filters = {}) => {
  try {
    const result = await getContacts(filters);
    
    if (!result.success) {
      throw new Error('Failed to fetch contacts for export');
    }
    
    // Convert to CSV
    const headers = ['Email', 'First Name', 'Last Name', 'Member Type', 'Status', 'Created At'];
    const rows = result.contacts.map(contact => [
      contact.email,
      contact.first_name || '',
      contact.last_name || '',
      contact.member_type || '',
      contact.status,
      new Date(contact.created_at).toLocaleDateString()
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return { success: true, csv };
  } catch (error) {
    console.error('Export contacts error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Bulk update contact status
 */
export const bulkUpdateStatus = async (contactIds, status) => {
  try {
    const results = {
      success: 0,
      failed: 0
    };
    
    for (const contactId of contactIds) {
      const result = await updateContact(contactId, { status });
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Bulk update error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Bulk delete contacts
 */
export const bulkDeleteContacts = async (contactIds) => {
  try {
    const results = {
      success: 0,
      failed: 0
    };
    
    for (const contactId of contactIds) {
      const result = await deleteContact(contactId);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Bulk delete error:', error);
    return { success: false, error: error.message };
  }
};

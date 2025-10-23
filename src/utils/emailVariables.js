// Email Variable Utilities - Handle personalization variable replacement

/**
 * Replace variables in text with contact data
 * @param {string} text - Text containing variables like {{first_name}}
 * @param {object} contact - Contact data object
 * @param {object} fallbacks - Optional fallback values for missing fields
 * @returns {string} Text with variables replaced
 */
export const replaceVariables = (text, contact, fallbacks = {}) => {
  if (!text || typeof text !== 'string') return text;
  
  // Default fallbacks
  const defaultFallbacks = {
    first_name: 'there',
    last_name: '',
    full_name: 'valued customer',
    email: '',
    phone: '',
    company: 'your company',
    job_title: '',
    industry: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    created_at: '',
    last_contacted: '',
    member_type: 'member',
    status: '',
    custom_field_1: '',
    custom_field_2: '',
    custom_field_3: '',
    ...fallbacks
  };

  // Replace all variables in the format {{variable_name}}
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    
    // Check if contact has this field
    if (contact && contact[trimmedName] !== undefined && contact[trimmedName] !== null && contact[trimmedName] !== '') {
      return contact[trimmedName];
    }
    
    // Use fallback value
    return defaultFallbacks[trimmedName] || match;
  });
};

/**
 * Extract all variables from text
 * @param {string} text - Text containing variables
 * @returns {array} Array of variable names found
 */
export const extractVariables = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  
  return matches.map(match => match.replace(/\{\{|\}\}/g, '').trim());
};

/**
 * Check if text contains any variables
 * @param {string} text - Text to check
 * @returns {boolean} True if variables found
 */
export const hasVariables = (text) => {
  if (!text || typeof text !== 'string') return false;
  return /\{\{([^}]+)\}\}/.test(text);
};

/**
 * Replace variables in all email blocks
 * @param {array} blocks - Array of email blocks
 * @param {object} contact - Contact data
 * @param {object} fallbacks - Optional fallbacks
 * @returns {array} Blocks with variables replaced
 */
export const replaceVariablesInBlocks = (blocks, contact, fallbacks = {}) => {
  if (!blocks || !Array.isArray(blocks)) return blocks;
  
  return blocks.map(block => {
    const newBlock = { ...block };
    
    if (block.content) {
      const newContent = { ...block.content };
      
      // Replace variables in text fields
      if (newContent.text) {
        newContent.text = replaceVariables(newContent.text, contact, fallbacks);
      }
      
      // Replace variables in HTML fields
      if (newContent.html) {
        newContent.html = replaceVariables(newContent.html, contact, fallbacks);
      }
      
      // Replace variables in button text
      if (newContent.buttonText) {
        newContent.buttonText = replaceVariables(newContent.buttonText, contact, fallbacks);
      }
      
      // Replace variables in URLs (for personalized links)
      if (newContent.url) {
        newContent.url = replaceVariables(newContent.url, contact, fallbacks);
      }
      
      newBlock.content = newContent;
    }
    
    return newBlock;
  });
};

/**
 * Replace variables in campaign subject and preheader
 * @param {object} campaign - Campaign object
 * @param {object} contact - Contact data
 * @param {object} fallbacks - Optional fallbacks
 * @returns {object} Campaign with variables replaced
 */
export const replaceVariablesInCampaign = (campaign, contact, fallbacks = {}) => {
  if (!campaign) return campaign;
  
  const newCampaign = { ...campaign };
  
  if (newCampaign.subject) {
    newCampaign.subject = replaceVariables(newCampaign.subject, contact, fallbacks);
  }
  
  if (newCampaign.preheader) {
    newCampaign.preheader = replaceVariables(newCampaign.preheader, contact, fallbacks);
  }
  
  return newCampaign;
};

/**
 * Get a preview contact for testing variables
 * @returns {object} Sample contact data
 */
export const getPreviewContact = () => {
  return {
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-0123',
    company: 'Acme Corporation',
    job_title: 'Marketing Manager',
    industry: 'Technology',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    zip_code: '94102',
    created_at: 'January 15, 2024',
    last_contacted: 'February 20, 2024',
    member_type: 'Premium',
    status: 'Active',
    custom_field_1: 'Custom Value 1',
    custom_field_2: 'Custom Value 2',
    custom_field_3: 'Custom Value 3'
  };
};

/**
 * Validate variable syntax in text
 * @param {string} text - Text to validate
 * @returns {object} Validation result with errors
 */
export const validateVariables = (text) => {
  if (!text || typeof text !== 'string') {
    return { valid: true, errors: [] };
  }
  
  const errors = [];
  
  // Check for unclosed variables
  const openBraces = (text.match(/\{\{/g) || []).length;
  const closeBraces = (text.match(/\}\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    errors.push('Unclosed variable tags found. Make sure all {{variables}} are properly closed.');
  }
  
  // Check for nested variables (not supported)
  if (/\{\{[^}]*\{\{/.test(text)) {
    errors.push('Nested variables are not supported.');
  }
  
  // Check for empty variables
  if (/\{\{\s*\}\}/.test(text)) {
    errors.push('Empty variable tags found. Variables must have a name: {{field_name}}');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get available variable fields
 * @returns {array} Array of available variable fields
 */
export const getAvailableVariables = () => {
  return [
    // Contact Info
    { key: 'first_name', label: 'First Name', category: 'Contact Info' },
    { key: 'last_name', label: 'Last Name', category: 'Contact Info' },
    { key: 'full_name', label: 'Full Name', category: 'Contact Info' },
    { key: 'email', label: 'Email', category: 'Contact Info' },
    { key: 'phone', label: 'Phone', category: 'Contact Info' },
    
    // Organization
    { key: 'company', label: 'Company', category: 'Organization' },
    { key: 'job_title', label: 'Job Title', category: 'Organization' },
    { key: 'industry', label: 'Industry', category: 'Organization' },
    
    // Location
    { key: 'city', label: 'City', category: 'Location' },
    { key: 'state', label: 'State', category: 'Location' },
    { key: 'country', label: 'Country', category: 'Location' },
    { key: 'zip_code', label: 'Zip Code', category: 'Location' },
    
    // Dates & Status
    { key: 'created_at', label: 'Signup Date', category: 'Dates & Status' },
    { key: 'last_contacted', label: 'Last Contacted', category: 'Dates & Status' },
    { key: 'member_type', label: 'Member Type', category: 'Dates & Status' },
    { key: 'status', label: 'Status', category: 'Dates & Status' },
    
    // Custom Fields
    { key: 'custom_field_1', label: 'Custom Field 1', category: 'Custom Fields' },
    { key: 'custom_field_2', label: 'Custom Field 2', category: 'Custom Fields' },
    { key: 'custom_field_3', label: 'Custom Field 3', category: 'Custom Fields' }
  ];
};

export default {
  replaceVariables,
  extractVariables,
  hasVariables,
  replaceVariablesInBlocks,
  replaceVariablesInCampaign,
  getPreviewContact,
  validateVariables,
  getAvailableVariables
};


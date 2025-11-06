// src/services/email/sendgridService.js

// IMPORTANT: For security, all SendGrid API calls should go through Netlify functions
// Never expose your SendGrid API key in the frontend code

const NETLIFY_FUNCTIONS_URL = process.env.REACT_APP_NETLIFY_FUNCTIONS_URL || '/.netlify/functions';

/**
 * Send a test email via Netlify function
 * This is the SECURE way to send emails - API key stays on the server
 */
export const sendTestEmail = async (toEmail, campaign) => {
  try {
    const response = await fetch(`${NETLIFY_FUNCTIONS_URL}/send-test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toEmail,
        campaign
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to send test email');
    }

    return {
      success: true,
      messageId: data.messageId,
      message: data.message || 'Test email sent successfully'
    };
  } catch (error) {
    console.error('Send test email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send a single email using SendGrid (via Netlify function)
 */
export const sendEmail = async (toEmail, subject, htmlContent, plainTextContent = null) => {
  try {
    const response = await fetch(`${NETLIFY_FUNCTIONS_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toEmail,
        subject,
        htmlContent,
        plainTextContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    return {
      success: true,
      messageId: data.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('SendGrid send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send bulk emails using SendGrid (via Netlify function)
 */
export const sendBulkEmails = async (recipients, subject, htmlContent, plainTextContent = null) => {
  try {
    const response = await fetch(`${NETLIFY_FUNCTIONS_URL}/send-bulk-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients,
        subject,
        htmlContent,
        plainTextContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send bulk emails');
    }

    return data;
  } catch (error) {
    console.error('SendGrid bulk send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send campaign email with tracking (via Netlify function)
 */
export const sendCampaignEmail = async (contact, campaign) => {
  try {
    const response = await fetch(`${NETLIFY_FUNCTIONS_URL}/send-campaign-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact,
        campaign
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send campaign email');
    }

    return {
      ...data,
      contactId: contact.id,
      campaignId: campaign.id
    };
  } catch (error) {
    console.error('Send campaign email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify SendGrid setup (via Netlify function)
 */
export const verifySendGridSetup = async () => {
  try {
    const response = await fetch(`${NETLIFY_FUNCTIONS_URL}/verify-sendgrid`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify SendGrid setup');
    }

    return data;
  } catch (error) {
    console.error('SendGrid verification error:', error);
    return {
      success: false,
      error: error.message,
      details: {
        apiKey: false,
        fromEmail: false,
        fromName: false
      }
    };
  }
};

/**
 * Handle email webhooks (opens, clicks, bounces)
 */
export const processWebhook = async (event, data) => {
  try {
    switch (event) {
      case 'open':
        // Track email open
        return await trackEmailOpen(data);
      
      case 'click':
        // Track email click
        return await trackEmailClick(data);
      
      case 'bounce':
        // Handle bounce
        return await handleBounce(data);
      
      case 'unsubscribe':
        // Handle unsubscribe
        return await handleUnsubscribe(data);
      
      default:
        return { success: false, error: 'Unknown webhook event' };
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return { success: false, error: error.message };
  }
};

// Helper functions for webhook processing
const trackEmailOpen = async (data) => {
  // Implementation would update campaign_sends table
  return { success: true, message: 'Email open tracked' };
};

const trackEmailClick = async (data) => {
  // Implementation would update campaign_sends table
  return { success: true, message: 'Email click tracked' };
};

const handleBounce = async (data) => {
  // Implementation would mark contact as bounced
  return { success: true, message: 'Bounce handled' };
};

const handleUnsubscribe = async (data) => {
  // Implementation would mark contact as unsubscribed
  return { success: true, message: 'Unsubscribe processed' };
};
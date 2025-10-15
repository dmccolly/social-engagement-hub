// src/services/email/sendgridService.js

const SENDGRID_API_KEY = process.env.REACT_APP_SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.REACT_APP_SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com';
const SENDGRID_FROM_NAME = process.env.REACT_APP_SENDGRID_FROM_NAME || 'Your Organization';

/**
 * Send a single email using SendGrid
 */
export const sendEmail = async (toEmail, subject, htmlContent, plainTextContent = null) => {
  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: toEmail }],
          subject: subject
        }],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME
        },
        content: [
          {
            type: 'text/html',
            value: htmlContent
          },
          ...(plainTextContent ? [{
            type: 'text/plain',
            value: plainTextContent
          }] : [])
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`SendGrid error: ${errorData.errors?.[0]?.message || response.statusText}`);
    }

    return {
      success: true,
      messageId: response.headers.get('x-message-id'),
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
 * Send bulk emails using SendGrid
 */
export const sendBulkEmails = async (recipients, subject, htmlContent, plainTextContent = null) => {
  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    // Split recipients into batches of 1000 (SendGrid limit)
    const batches = [];
    for (let i = 0; i < recipients.length; i += 1000) {
      batches.push(recipients.slice(i, i + 1000));
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      messageIds: []
    };

    for (const batch of batches) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: batch.map(email => ({
            to: [{ email }],
            subject: subject
          })),
          from: {
            email: SENDGRID_FROM_EMAIL,
            name: SENDGRID_FROM_NAME
          },
          content: [
            {
              type: 'text/html',
              value: htmlContent
            },
            ...(plainTextContent ? [{
              type: 'text/plain',
              value: plainTextContent
            }] : [])
          ]
        })
      });

      if (response.ok) {
        results.success += batch.length;
        const messageId = response.headers.get('x-message-id');
        if (messageId) {
          results.messageIds.push(messageId);
        }
      } else {
        results.failed += batch.length;
        const errorData = await response.json();
        results.errors.push({
          batch: batch.length,
          error: errorData.errors?.[0]?.message || response.statusText
        });
      }
    }

    return results;
  } catch (error) {
    console.error('SendGrid bulk send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send campaign email with tracking
 */
export const sendCampaignEmail = async (contact, campaign) => {
  try {
    // Add tracking pixel for open tracking
    const trackingPixel = `<img src="https://your-domain.com/track/open/${campaign.id}/${contact.id}" width="1" height="1" style="display:none;" alt="" />`;
    const trackedHtmlContent = campaign.html_content + trackingPixel;

    // Replace unsubscribe link
    const unsubscribeLink = `https://your-domain.com/unsubscribe/${contact.id}`;
    const finalHtmlContent = trackedHtmlContent.replace(
      /\[unsubscribe\]/g,
      `<a href="${unsubscribeLink}">Unsubscribe</a>`
    );

    // Replace personalization tags
    const personalizedContent = finalHtmlContent
      .replace(/\[first_name\]/g, contact.first_name || '')
      .replace(/\[last_name\]/g, contact.last_name || '')
      .replace(/\[email\]/g, contact.email);

    const result = await sendEmail(
      contact.email,
      campaign.subject,
      personalizedContent,
      campaign.plain_text_content
    );

    return {
      ...result,
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
 * Send test email
 */
export const sendTestEmail = async (toEmail, campaign) => {
  try {
    const testSubject = `[TEST] ${campaign.subject}`;
    const testHtmlContent = campaign.html_content.replace(
      /\[unsubscribe\]/g,
      '<em>[Test email - no unsubscribe needed]</em>'
    );

    return await sendEmail(toEmail, testSubject, testHtmlContent, campaign.plain_text_content);
  } catch (error) {
    console.error('Send test email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify SendGrid setup
 */
export const verifySendGridSetup = async () => {
  try {
    if (!SENDGRID_API_KEY) {
      return {
        success: false,
        error: 'SendGrid API key not configured',
        details: {
          apiKey: false,
          fromEmail: !!SENDGRID_FROM_EMAIL,
          fromName: !!SENDGRID_FROM_NAME
        }
      };
    }

    const response = await fetch('https://api.sendgrid.com/v3/scopes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Invalid SendGrid API key');
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'SendGrid setup verified',
      details: {
        apiKey: true,
        fromEmail: SENDGRID_FROM_EMAIL,
        fromName: SENDGRID_FROM_NAME,
        scopes: data.scopes
      }
    };
  } catch (error) {
    console.error('SendGrid verification error:', error);
    return {
      success: false,
      error: error.message,
      details: {
        apiKey: false,
        fromEmail: !!SENDGRID_FROM_EMAIL,
        fromName: !!SENDGRID_FROM_NAME
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
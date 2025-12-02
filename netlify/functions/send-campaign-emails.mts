// Netlify Function: Send Campaign Emails via SendGrid
// This function handles the actual email sending for campaigns
// Accepts campaign data and recipients directly from the frontend

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const XANO_BASE_URL = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
const APP_URL = process.env.URL || 'http://localhost:3000';

// Frontend sends recipients in this format
interface FrontendRecipient {
  id?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
}

// Frontend sends campaign in this format
interface FrontendCampaign {
  id: number;
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  htmlContent: string;
}

interface Campaign {
  id: number;
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  reply_to?: string;
  html_content: string;
  plain_text_content?: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    
    // Support both frontend format (campaign object + recipients) and legacy format (campaign_id)
    const frontendCampaign = body.campaign as FrontendCampaign | undefined;
    const frontendRecipients = body.recipients as FrontendRecipient[] | undefined;
    const campaign_id = body.campaign_id || (frontendCampaign?.id);

    if (!campaign_id && !frontendCampaign) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'campaign or campaign_id is required' })
      };
    }

    if (!SENDGRID_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'SendGrid API key not configured' })
      };
    }

    // Use campaign data from frontend if provided, otherwise fetch from Xano
    let campaignData: Campaign;
    if (frontendCampaign) {
      // Map frontend format to internal format
      campaignData = {
        id: frontendCampaign.id,
        name: frontendCampaign.name,
        subject: frontendCampaign.subject,
        from_name: frontendCampaign.fromName,
        from_email: frontendCampaign.fromEmail,
        html_content: frontendCampaign.htmlContent
      };
    } else {
      // Fetch from Xano (legacy path)
      const campaignResponse = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaign_id}`);
      if (!campaignResponse.ok) {
        throw new Error('Failed to fetch campaign');
      }
      campaignData = await campaignResponse.json();
    }

    // Use recipients from frontend if provided
    let recipientEmails: { email: string; firstName?: string; lastName?: string }[] = [];
    
    if (frontendRecipients && frontendRecipients.length > 0) {
      // Use recipients provided by frontend
      recipientEmails = frontendRecipients.map(r => ({
        email: r.email,
        firstName: r.firstName || r.first_name,
        lastName: r.lastName || r.last_name
      }));
    } else {
      // Legacy path: fetch from Xano queue (if implemented)
      try {
        const recipientsResponse = await fetch(
          `${XANO_BASE_URL}/email_campaign_recipients?campaign_id=${campaign_id}&status=pending`
        );
        if (recipientsResponse.ok) {
          const xanoRecipients = await recipientsResponse.json();
          recipientEmails = xanoRecipients.map((r: any) => ({
            email: r.email,
            firstName: r.first_name,
            lastName: r.last_name
          }));
        }
      } catch (error) {
        console.log('No Xano recipients queue available, using frontend recipients only');
      }
    }

    if (recipientEmails.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          error: 'No recipients provided',
          sent: 0 
        })
      };
    }

    // Filter out suppressed emails before sending (optional - fail open if suppression check unavailable)
    const validRecipients: typeof recipientEmails = [];
    let suppressedCount = 0;

    for (const recipient of recipientEmails) {
      try {
        // Check if email is suppressed
        const checkResponse = await fetch(
          `${XANO_BASE_URL}/email/check-suppression?email=${encodeURIComponent(recipient.email)}`
        );
        
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          
          if (!checkData.suppressed) {
            validRecipients.push(recipient);
          } else {
            suppressedCount++;
          }
        } else {
          // If check fails, include recipient (fail open)
          validRecipients.push(recipient);
        }
      } catch (error) {
        // If check fails, include recipient (fail open)
        console.error(`Error checking suppression for ${recipient.email}:`, error);
        validRecipients.push(recipient);
      }
    }

    if (validRecipients.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: `All recipients suppressed (${suppressedCount} total)`,
          sent: 0,
          suppressed: suppressedCount
        })
      };
    }

    console.log(`Sending to ${validRecipients.length} recipients (${suppressedCount} suppressed)`);

    // Send emails in batches (SendGrid limit: 1000 per request, we'll use 100 for safety)
    const batchSize = 100;
    let totalSent = 0;
    let totalFailed = 0;

    for (let i = 0; i < validRecipients.length; i += batchSize) {
      const batch = validRecipients.slice(i, i + batchSize);

      // Prepare messages for this batch with personalization
      const messages = batch.map((recipient) => {
        // Use recipient data for variable replacement
        const contactData = {
          first_name: recipient.firstName || '',
          last_name: recipient.lastName || '',
          email: recipient.email
        };

        // Replace variables in content
        const personalizedSubject = replaceVariables(campaignData.subject, contactData);
        const personalizedHtml = replaceVariables(campaignData.html_content, contactData);
        const personalizedText = replaceVariables(
          campaignData.plain_text_content || stripHtml(campaignData.html_content),
          contactData
        );

        // Generate a simple tracking token from email
        const trackingToken = Buffer.from(recipient.email + ':' + campaign_id).toString('base64');

        return {
          to: recipient.email,
          from: {
            email: campaignData.from_email,
            name: campaignData.from_name
          },
          reply_to: campaignData.reply_to || campaignData.from_email,
          subject: personalizedSubject,
          html: addUnsubscribeLink(
            injectTrackingPixel(personalizedHtml, trackingToken),
            recipient.email
          ),
          text: personalizedText,
          tracking_settings: {
            click_tracking: { enable: true },
            open_tracking: { enable: true }
          },
          custom_args: {
            campaign_id: campaign_id.toString(),
            tracking_token: trackingToken
          }
        };
      });

      try {
        // Send batch via SendGrid - use individual sends for personalization
        for (const msg of messages) {
          const sendResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SENDGRID_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personalizations: [{
                to: [{ email: msg.to }],
                custom_args: msg.custom_args
              }],
              from: msg.from,
              reply_to: { email: msg.reply_to },
              subject: msg.subject,
              content: [
                { type: 'text/plain', value: msg.text },
                { type: 'text/html', value: msg.html }
              ],
              tracking_settings: msg.tracking_settings
            })
          });

          if (sendResponse.ok || sendResponse.status === 202) {
            totalSent++;
          } else {
            const errorText = await sendResponse.text();
            console.error(`SendGrid error for ${msg.to}:`, errorText);
            totalFailed++;
          }
        }
      } catch (error) {
        console.error('Batch send error:', error);
        totalFailed += batch.length;
      }

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < validRecipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status in Xano
    try {
      const campaignStatus = totalFailed === 0 ? 'sent' : (totalSent > 0 ? 'partially_sent' : 'failed');
      await fetch(`${XANO_BASE_URL}/email_campaigns/${campaign_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: campaignStatus,
          sent_at: new Date().toISOString(),
          sent_count: totalSent,
          bounced_count: totalFailed
        })
      });
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        sent: totalSent,
        failed: totalFailed,
        suppressed: suppressedCount,
        total: validRecipients.length
      })
    };

  } catch (error) {
    console.error('Send campaign error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

// Helper function to inject tracking pixel
function injectTrackingPixel(html: string, token: string): string {
  const trackingPixel = `<img src="${APP_URL}/api/track/open/${token}" width="1" height="1" alt="" style="display:none;" />`;
  
  // Try to inject before </body>, otherwise append to end
  if (html.includes('</body>')) {
    return html.replace('</body>', `${trackingPixel}</body>`);
  } else {
    return html + trackingPixel;
  }
}

// Helper function to replace variables with contact data
function replaceVariables(text: string, contact: any): string {
  if (!text || typeof text !== 'string') return text;
  
  // Default fallbacks
  const fallbacks: Record<string, string> = {
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
    custom_field_3: ''
  };

  // Replace all variables in the format {{variable_name}}
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    
    // Check if contact has this field
    if (contact && contact[trimmedName] !== undefined && contact[trimmedName] !== null && contact[trimmedName] !== '') {
      return contact[trimmedName];
    }
    
    // Use fallback value
    return fallbacks[trimmedName] || match;
  });
}

// Helper function to add unsubscribe link to email footer
function addUnsubscribeLink(html: string, email: string): string {
  const unsubToken = Buffer.from(email).toString('base64');
  const unsubLink = `${APP_URL}/.netlify/functions/handle-unsubscribe?token=${unsubToken}`;
  
  const footer = `
    <div style="margin-top: 40px; padding: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
        You're receiving this email because you subscribed to our mailing list.
      </p>
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        <a href="${unsubLink}" style="color: #2563eb; text-decoration: underline;">Unsubscribe</a> | 
        <a href="${APP_URL}/privacy" style="color: #2563eb; text-decoration: underline;">Privacy Policy</a>
      </p>
    </div>
  `;
  
  // Try to inject before </body>, otherwise append to end
  if (html.includes('</body>')) {
    return html.replace('</body>', `${footer}</body>`);
  } else {
    return html + footer;
  }
}

// Helper function to strip HTML tags for plain text
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export { handler };


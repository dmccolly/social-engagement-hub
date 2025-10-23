// Netlify Function: Send Campaign Emails via SendGrid
// This function handles the actual email sending for campaigns

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const XANO_BASE_URL = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
const APP_URL = process.env.URL || 'http://localhost:3000';

interface Recipient {
  id: number;
  email: string;
  tracking_token: string;
  contact_id: number;
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
    const { campaign_id } = JSON.parse(event.body || '{}');

    if (!campaign_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'campaign_id is required' })
      };
    }

    if (!SENDGRID_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'SendGrid API key not configured' })
      };
    }

    // Get campaign from Xano
    const campaignResponse = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaign_id}`);
    if (!campaignResponse.ok) {
      throw new Error('Failed to fetch campaign');
    }
    const campaignData: Campaign = await campaignResponse.json();

    // Get pending recipients from Xano
    const recipientsResponse = await fetch(
      `${XANO_BASE_URL}/email_campaign_recipients?campaign_id=${campaign_id}&status=pending`
    );
    if (!recipientsResponse.ok) {
      throw new Error('Failed to fetch recipients');
    }
    let recipients: Recipient[] = await recipientsResponse.json();

    if (recipients.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'No pending recipients',
          sent: 0 
        })
      };
    }

    // Filter out suppressed emails before sending
    const validRecipients: Recipient[] = [];
    let suppressedCount = 0;

    for (const recipient of recipients) {
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
            // Update recipient status to suppressed
            suppressedCount++;
            await fetch(`${XANO_BASE_URL}/email_campaign_recipients/${recipient.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'suppressed',
                bounce_reason: checkData.reason || 'Suppressed'
              })
            });
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

    // Update recipients list to only valid ones
    recipients = validRecipients;

    if (recipients.length === 0) {
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

    console.log(`Sending to ${recipients.length} recipients (${suppressedCount} suppressed)`);

    // Send emails in batches (SendGrid limit: 1000 per request, we'll use 100 for safety)
    const batchSize = 100;
    let totalSent = 0;
    let totalFailed = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      // Prepare messages for this batch
      const messages = batch.map(recipient => ({
        to: recipient.email,
        from: {
          email: campaignData.from_email,
          name: campaignData.from_name
        },
        reply_to: campaignData.reply_to || campaignData.from_email,
        subject: campaignData.subject,
        html: addUnsubscribeLink(
          injectTrackingPixel(campaignData.html_content, recipient.tracking_token),
          recipient.email
        ),
        text: campaignData.plain_text_content || stripHtml(campaignData.html_content),
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true }
        },
        custom_args: {
          campaign_id: campaign_id.toString(),
          recipient_id: recipient.id.toString(),
          tracking_token: recipient.tracking_token
        }
      }));

      try {
        // Send batch via SendGrid
        const sendResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: messages.map(msg => ({
              to: [{ email: msg.to }],
              custom_args: msg.custom_args
            })),
            from: messages[0].from,
            reply_to: { email: messages[0].reply_to },
            subject: messages[0].subject,
            content: [
              { type: 'text/html', value: messages[0].html },
              { type: 'text/plain', value: messages[0].text }
            ],
            tracking_settings: messages[0].tracking_settings
          })
        });

        if (sendResponse.ok) {
          // Update recipients status in Xano
          for (const recipient of batch) {
            await fetch(`${XANO_BASE_URL}/email_campaign_recipients/${recipient.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'sent',
                sent_at: new Date().toISOString()
              })
            });
          }
          totalSent += batch.length;
        } else {
          const errorText = await sendResponse.text();
          console.error('SendGrid error:', errorText);
          
          // Mark batch as failed
          for (const recipient of batch) {
            await fetch(`${XANO_BASE_URL}/email_campaign_recipients/${recipient.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'failed',
                bounce_reason: `SendGrid error: ${errorText.substring(0, 200)}`
              })
            });
          }
          totalFailed += batch.length;
        }
      } catch (error) {
        console.error('Batch send error:', error);
        
        // Mark batch as failed
        for (const recipient of batch) {
          await fetch(`${XANO_BASE_URL}/email_campaign_recipients/${recipient.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'failed',
              bounce_reason: error instanceof Error ? error.message : 'Unknown error'
            })
          });
        }
        totalFailed += batch.length;
      }

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        sent: totalSent,
        failed: totalFailed,
        total: recipients.length
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


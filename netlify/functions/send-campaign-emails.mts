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
    const recipients: Recipient[] = await recipientsResponse.json();

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
        html: injectTrackingPixel(campaignData.html_content, recipient.tracking_token),
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


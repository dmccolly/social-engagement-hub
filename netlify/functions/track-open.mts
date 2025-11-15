// Netlify Function: Track Email Opens
// Returns a 1x1 transparent GIF and records the open event

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const XANO_BASE_URL = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV';

// 1x1 transparent GIF in base64
const TRACKING_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Extract tracking token from path
  const pathParts = event.path.split('/');
  const tracking_token = pathParts[pathParts.length - 1];

  if (!tracking_token) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: TRACKING_GIF.toString('base64'),
      isBase64Encoded: true
    };
  }

  try {
    // Get recipient by tracking token
    const recipientResponse = await fetch(
      `${XANO_BASE_URL}/email_campaign_recipients?tracking_token=${tracking_token}`
    );

    if (recipientResponse.ok) {
      const recipients = await recipientResponse.json();
      
      if (recipients && recipients.length > 0) {
        const recipient = recipients[0];

        // Update recipient record
        const updates: any = {
          open_count: (recipient.open_count || 0) + 1
        };

        // Set opened_at only on first open
        if (!recipient.opened_at) {
          updates.opened_at = new Date().toISOString();
          updates.status = 'opened';

          // Also update campaign opened_count
          if (recipient.campaign_id) {
            // Get current campaign
            const campaignResponse = await fetch(
              `${XANO_BASE_URL}/email_campaigns/${recipient.campaign_id}`
            );
            if (campaignResponse.ok) {
              const campaign = await campaignResponse.json();
              
              // Increment opened_count
              await fetch(`${XANO_BASE_URL}/email_campaigns/${recipient.campaign_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  opened_count: (campaign.opened_count || 0) + 1
                })
              });
            }
          }
        }

        // Update recipient
        await fetch(`${XANO_BASE_URL}/email_campaign_recipients/${recipient.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      }
    }
  } catch (error) {
    console.error('Track open error:', error);
    // Still return the tracking pixel even if tracking fails
  }

  // Always return the tracking pixel
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    body: TRACKING_GIF.toString('base64'),
    isBase64Encoded: true
  };
};

export { handler };


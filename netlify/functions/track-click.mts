// Netlify Function: Track Email Link Clicks
// Records the click event and redirects to the original URL

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const XANO_BASE_URL = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Extract tracking token from path
  const pathParts = event.path.split('/');
  const tracking_token = pathParts[pathParts.length - 1];

  // Get destination URL from query parameter
  const url = event.queryStringParameters?.url;

  if (!tracking_token || !url) {
    return {
      statusCode: 400,
      body: 'Missing tracking token or destination URL'
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
          click_count: (recipient.click_count || 0) + 1
        };

        // Set clicked_at only on first click
        if (!recipient.clicked_at) {
          updates.clicked_at = new Date().toISOString();
          updates.status = 'clicked';

          // Also update campaign clicked_count
          if (recipient.campaign_id) {
            // Get current campaign
            const campaignResponse = await fetch(
              `${XANO_BASE_URL}/email_campaigns/${recipient.campaign_id}`
            );
            if (campaignResponse.ok) {
              const campaign = await campaignResponse.json();
              
              // Increment clicked_count
              await fetch(`${XANO_BASE_URL}/email_campaigns/${recipient.campaign_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  clicked_count: (campaign.clicked_count || 0) + 1
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
    console.error('Track click error:', error);
    // Still redirect even if tracking fails
  }

  // Redirect to the original URL
  return {
    statusCode: 302,
    headers: {
      'Location': decodeURIComponent(url),
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
    body: ''
  };
};

export { handler };


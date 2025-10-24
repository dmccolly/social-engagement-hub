const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { campaignId, recipientIds } = JSON.parse(event.body);

    // Get SendGrid API key from environment
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com';
    const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Your Organization';

    if (!SENDGRID_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'SendGrid API key not configured' })
      };
    }

    // Get campaign from Xano
    const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
    
    const campaignResponse = await fetch(`${XANO_BASE_URL}/email_campaigns/${campaignId}`);
    if (!campaignResponse.ok) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Campaign not found' })
      };
    }
    
    const campaign = await campaignResponse.json();

    // Get recipients from Xano
    const contactsResponse = await fetch(`${XANO_BASE_URL}/email_contacts`);
    const allContacts = await contactsResponse.json();
    
    // Filter to active contacts
    const recipients = allContacts.filter(c => c.status === 'active');

    if (recipients.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No active recipients found' })
      };
    }

    // Send emails via SendGrid
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const recipient of recipients) {
      try {
        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: recipient.email }],
                subject: campaign.subject || 'Email Campaign'
              }
            ],
            from: {
              email: SENDGRID_FROM_EMAIL,
              name: campaign.from_name || SENDGRID_FROM_NAME
            },
            content: [
              {
                type: 'text/html',
                value: campaign.html_content || '<p>Email content</p>'
              }
            ]
          })
        });

        if (sendGridResponse.ok) {
          successCount++;
        } else {
          errorCount++;
          const errorText = await sendGridResponse.text();
          errors.push({ email: recipient.email, error: errorText });
        }
      } catch (error) {
        errorCount++;
        errors.push({ email: recipient.email, error: error.message });
      }
    }

    // Update campaign status in Xano
    await fetch(`${XANO_BASE_URL}/email_campaigns/${campaignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Campaign sent',
        campaign_id: campaignId,
        total_recipients: recipients.length,
        success_count: successCount,
        error_count: errorCount,
        errors: errors.length > 0 ? errors : undefined
      })
    };

  } catch (error) {
    console.error('Send campaign error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send campaign',
        message: error.message 
      })
    };
  }
};
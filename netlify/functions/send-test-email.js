// netlify/functions/send-test-email.js
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
    const { toEmail, campaign } = JSON.parse(event.body);

    // Validate inputs
    if (!toEmail || !campaign) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Get SendGrid API key from environment
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com';
    const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Your Organization';

    if (!SENDGRID_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'SendGrid API key not configured',
          details: 'Please set SENDGRID_API_KEY environment variable in Netlify'
        })
      };
    }

    // Prepare test email content
    const testSubject = `[TEST] ${campaign.subject || 'Test Email'}`;
    const testHtmlContent = (campaign.html_content || campaign.htmlContent || '<p>Test email content</p>')
      .replace(/\[unsubscribe\]/g, '<em>[Test email - no unsubscribe needed]</em>');

    // Send via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: toEmail }],
            subject: testSubject
          }
        ],
        from: {
          email: campaign.from_email || campaign.fromEmail || SENDGRID_FROM_EMAIL,
          name: campaign.from_name || campaign.fromName || SENDGRID_FROM_NAME
        },
        content: [
          {
            type: 'text/html',
            value: testHtmlContent
          },
          ...(campaign.plain_text_content || campaign.plainTextContent ? [{
            type: 'text/plain',
            value: campaign.plain_text_content || campaign.plainTextContent
          }] : [])
        ]
      })
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      console.error('SendGrid error:', errorData);

      return {
        statusCode: sendGridResponse.status,
        body: JSON.stringify({ 
          success: false,
          error: errorData.errors?.[0]?.message || errorData.message || 'SendGrid API error',
          details: errorData
        })
      };
    }

    const messageId = sendGridResponse.headers.get('x-message-id');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Test email sent successfully',
        messageId: messageId,
        sentTo: toEmail
      })
    };

  } catch (error) {
    console.error('Send test email error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        error: 'Failed to send test email',
        message: error.message 
      })
    };
  }
};
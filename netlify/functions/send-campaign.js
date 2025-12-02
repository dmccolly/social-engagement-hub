const fetch = require('node-fetch');

// Transform HTML content to ensure images have email-friendly inline styles
// This converts CSS classes to inline styles for email client compatibility
const transformHtmlForEmail = (html) => {
  if (!html || typeof html !== 'string') return html;
  
  // CSS class to inline style mappings
  const sizeStyles = {
    'size-small': 'width: 200px; max-width: 200px',
    'size-medium': 'width: 400px; max-width: 400px',
    'size-large': 'width: 600px; max-width: 600px',
    'size-full': 'width: 100%; max-width: 100%'
  };
  
  const positionStyles = {
    'position-left': 'float: left; margin: 0 15px 15px 0',
    'position-right': 'float: right; margin: 0 0 15px 15px',
    'position-center': 'display: block; margin: 0 auto 15px auto; float: none',
    'position-wrap-left': 'float: left; margin: 0 15px 15px 0',
    'position-wrap-right': 'float: right; margin: 0 0 15px 15px'
  };
  
  // Process all img tags to ensure they have proper email-friendly inline styles
  let transformedHtml = html.replace(/<img([^>]*?)(\s*\/?)>/gi, (match, attributes, selfClose) => {
    // Extract existing style attribute if present
    const styleMatch = attributes.match(/style\s*=\s*["']([^"']*)["']/i);
    const existingStyle = styleMatch ? styleMatch[1] : '';
    
    // Extract class attribute if present
    const classMatch = attributes.match(/class\s*=\s*["']([^"']*)["']/i);
    const classes = classMatch ? classMatch[1].split(/\s+/) : [];
    
    // Extract width from style or width attribute
    const styleWidthMatch = existingStyle.match(/width\s*:\s*([^;]+)/i);
    const attrWidthMatch = attributes.match(/width\s*=\s*["']?(\d+)["']?/i);
    
    // Extract float from style
    const floatMatch = existingStyle.match(/float\s*:\s*([^;]+)/i);
    
    // Build new style array
    let newStyles = [];
    let hasWidth = false;
    let hasFloat = false;
    
    // First, check for size classes and convert to inline styles
    for (const cls of classes) {
      if (sizeStyles[cls]) {
        newStyles.push(sizeStyles[cls]);
        hasWidth = true;
      }
    }
    
    // Then, check for position classes and convert to inline styles
    for (const cls of classes) {
      if (positionStyles[cls]) {
        newStyles.push(positionStyles[cls]);
        hasFloat = true;
      }
    }
    
    // Handle width - preserve existing inline style if no class-based width
    if (!hasWidth) {
      if (styleWidthMatch) {
        const widthValue = styleWidthMatch[1].trim();
        newStyles.push(`width: ${widthValue}`);
        newStyles.push(`max-width: ${widthValue}`);
      } else if (attrWidthMatch) {
        const pixelWidth = parseInt(attrWidthMatch[1], 10);
        const percentWidth = Math.min(100, Math.round((pixelWidth / 600) * 100));
        newStyles.push(`width: ${percentWidth}%`);
        newStyles.push(`max-width: ${percentWidth}%`);
      } else {
        newStyles.push('max-width: 100%');
      }
    }
    
    // Always add height: auto to maintain aspect ratio
    newStyles.push('height: auto');
    
    // Preserve float from inline style if no class-based float
    if (!hasFloat && floatMatch) {
      const floatValue = floatMatch[1].trim();
      newStyles.push(`float: ${floatValue}`);
      if (floatValue === 'left') {
        newStyles.push('margin: 0 16px 16px 0');
      } else if (floatValue === 'right') {
        newStyles.push('margin: 0 0 16px 16px');
      }
    }
    
    // Add border-radius for consistent styling
    newStyles.push('border-radius: 8px');
    
    // Remove old style and class attributes from attributes string
    let cleanAttributes = attributes
      .replace(/style\s*=\s*["'][^"']*["']/gi, '')
      .replace(/class\s*=\s*["'][^"']*["']/gi, '')
      .trim();
    
    // Build the new img tag with inline styles
    const newStyle = newStyles.join('; ');
    return `<img${cleanAttributes ? ' ' + cleanAttributes : ''} style="${newStyle}"${selfClose}>`;
  });
  
  // Clean up excessive empty paragraphs and line breaks
  transformedHtml = transformedHtml.replace(/(<p[^>]*>\s*(<br\s*\/?>|&nbsp;)?\s*<\/p>\s*){2,}/gi, '<p><br></p>');
  transformedHtml = transformedHtml.replace(/(<br\s*\/?\s*>){3,}/gi, '<br><br>');
  
  return transformedHtml;
};

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
    const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV';
    
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
                value: transformHtmlForEmail(campaign.html_content || '<p>Email content</p>')
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

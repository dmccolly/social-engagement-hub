// netlify/functions/send-test-email.js
const fetch = require('node-fetch');

// Transform HTML content to ensure images have email-friendly inline styles
// This converts CSS classes to inline styles for email client compatibility
// Uses !important to override any global CSS rules in email templates
const transformHtmlForEmail = (html) => {
  if (!html || typeof html !== 'string') return html;
  
  // CSS class to inline style mappings (with !important to override global CSS)
  const sizeStyles = {
    'size-small': 'width: 200px !important; max-width: 200px !important',
    'size-medium': 'width: 400px !important; max-width: 400px !important',
    'size-large': 'width: 600px !important; max-width: 600px !important',
    'size-full': 'width: 100% !important; max-width: 100% !important'
  };
  
  const positionStyles = {
    'position-left': 'float: left !important; margin: 0 15px 15px 0 !important',
    'position-right': 'float: right !important; margin: 0 0 15px 15px !important',
    'position-center': 'display: block !important; margin: 0 auto 15px auto !important; float: none !important',
    'position-wrap-left': 'float: left !important; margin: 0 15px 15px 0 !important',
    'position-wrap-right': 'float: right !important; margin: 0 0 15px 15px !important'
  };
  
  // Helper function to process element attributes and convert classes to inline styles
  const processElementStyles = (attributes, existingStyle) => {
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
        const widthValue = styleWidthMatch[1].trim().replace(/!important/gi, '').trim();
        newStyles.push(`width: ${widthValue} !important`);
        newStyles.push(`max-width: ${widthValue} !important`);
      } else if (attrWidthMatch) {
        const pixelWidth = parseInt(attrWidthMatch[1], 10);
        const percentWidth = Math.min(100, Math.round((pixelWidth / 600) * 100));
        newStyles.push(`width: ${percentWidth}% !important`);
        newStyles.push(`max-width: ${percentWidth}% !important`);
      } else {
        newStyles.push('max-width: 100% !important');
      }
    }
    
    // Always add height: auto to maintain aspect ratio
    newStyles.push('height: auto !important');
    
    // Preserve float from inline style if no class-based float
    if (!hasFloat && floatMatch) {
      const floatValue = floatMatch[1].trim().replace(/!important/gi, '').trim();
      newStyles.push(`float: ${floatValue} !important`);
      if (floatValue === 'left') {
        newStyles.push('margin: 0 16px 16px 0 !important');
      } else if (floatValue === 'right') {
        newStyles.push('margin: 0 0 16px 16px !important');
      }
    }
    
    // Add border-radius for consistent styling
    newStyles.push('border-radius: 8px');
    
    // Remove old style and class attributes from attributes string
    let cleanAttributes = attributes
      .replace(/style\s*=\s*["'][^"']*["']/gi, '')
      .replace(/class\s*=\s*["'][^"']*["']/gi, '')
      .trim();
    
    return { newStyle: newStyles.join('; '), cleanAttributes };
  };
  
  // Process all img tags to ensure they have proper email-friendly inline styles
  let transformedHtml = html.replace(/<img([^>]*?)(\s*\/?)>/gi, (match, attributes, selfClose) => {
    // Extract existing style attribute if present
    const styleMatch = attributes.match(/style\s*=\s*["']([^"']*)["']/i);
    const existingStyle = styleMatch ? styleMatch[1] : '';
    
    const { newStyle, cleanAttributes } = processElementStyles(attributes, existingStyle);
    
    // Build the new img tag with inline styles
    return `<img${cleanAttributes ? ' ' + cleanAttributes : ''} style="${newStyle}"${selfClose}>`;
  });
  
  // Also process div.media-wrapper elements that contain images/videos
  // These wrapper divs may have size/position classes that need to be converted
  transformedHtml = transformedHtml.replace(/<div([^>]*class\s*=\s*["'][^"']*media-wrapper[^"']*["'][^>]*)>/gi, (match, attributes) => {
    // Extract existing style attribute if present
    const styleMatch = attributes.match(/style\s*=\s*["']([^"']*)["']/i);
    const existingStyle = styleMatch ? styleMatch[1] : '';
    
    const { newStyle, cleanAttributes } = processElementStyles(attributes, existingStyle);
    
    // Build the new div tag with inline styles
    return `<div${cleanAttributes ? ' ' + cleanAttributes : ''} style="${newStyle}">`;
  });
  
  // Clean up excessive empty paragraphs and line breaks
  // Match paragraphs that only contain whitespace, NBSP variants, or <br> tags
  const emptyParagraphPattern = /<p[^>]*>\s*(?:&nbsp;|&#160;|\u00A0|\s|<br\s*\/?>)*\s*<\/p>/gi;
  
  // Remove all empty paragraphs (they just add unwanted spacing)
  transformedHtml = transformedHtml.replace(emptyParagraphPattern, '');
  
  // Clean up excessive line breaks (2+ becomes 1)
  transformedHtml = transformedHtml.replace(/(<br\s*\/?\s*>[\s\r\n]*){2,}/gi, '<br>');
  
  // Normalize paragraph margins to prevent excessive spacing
  // This ensures consistent spacing regardless of source HTML
  transformedHtml = transformedHtml.replace(/<p([^>]*)>/gi, (match, attrs) => {
    const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/i);
    let style = styleMatch ? styleMatch[1] : '';
    
    // Strip any existing margin declarations
    style = style.replace(/margin[^;]*;?/gi, '').trim();
    
    // Add a consistent bottom margin (12px is a good readable spacing)
    const newStyle = (style ? style + '; ' : '') + 'margin: 0 0 12px 0;';
    
    const cleanAttrs = attrs.replace(/style\s*=\s*["'][^"']*["']/i, '').trim();
    return `<p${cleanAttrs ? ' ' + cleanAttrs : ''} style="${newStyle}">`;
  });
  
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

    // Prepare test email content - transform HTML to ensure email-friendly inline styles
    const testSubject = `[TEST] ${campaign.subject || 'Test Email'}`;
    const rawHtmlContent = campaign.html_content || campaign.htmlContent || '<p>Test email content</p>';
    const testHtmlContent = transformHtmlForEmail(rawHtmlContent)
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

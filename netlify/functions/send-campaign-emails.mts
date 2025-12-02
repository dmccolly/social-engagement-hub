// Netlify Function: Send Campaign Emails via SendGrid
// This function handles the actual email sending for campaigns
// Accepts campaign data and recipients directly from the frontend

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const XANO_BASE_URL = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
const APP_URL = process.env.URL || 'http://localhost:3000';

// Transform HTML content to ensure images have email-friendly inline styles
// This converts CSS classes to inline styles for email client compatibility
// Uses !important to override any global CSS rules in email templates
const transformHtmlForEmail = (html: string): string => {
  if (!html || typeof html !== 'string') return html;
  
  // CSS class to inline style mappings (with !important to override global CSS)
  const sizeStyles: Record<string, string> = {
    'size-small': 'width: 200px !important; max-width: 200px !important',
    'size-medium': 'width: 400px !important; max-width: 400px !important',
    'size-large': 'width: 600px !important; max-width: 600px !important',
    'size-full': 'width: 100% !important; max-width: 100% !important'
  };
  
  const positionStyles: Record<string, string> = {
    'position-left': 'float: left !important; margin: 0 15px 15px 0 !important',
    'position-right': 'float: right !important; margin: 0 0 15px 15px !important',
    'position-center': 'display: block !important; margin: 0 auto 15px auto !important; float: none !important',
    'position-wrap-left': 'float: left !important; margin: 0 15px 15px 0 !important',
    'position-wrap-right': 'float: right !important; margin: 0 0 15px 15px !important'
  };
  
  // Helper function to process element attributes and convert classes to inline styles
  const processElementStyles = (attributes: string, existingStyle: string): { newStyle: string; cleanAttributes: string } => {
    // Extract class attribute if present
    const classMatch = attributes.match(/class\s*=\s*["']([^"']*)["']/i);
    const classes = classMatch ? classMatch[1].split(/\s+/) : [];
    
    // Extract width from style or width attribute
    const styleWidthMatch = existingStyle.match(/width\s*:\s*([^;]+)/i);
    const attrWidthMatch = attributes.match(/width\s*=\s*["']?(\d+)["']?/i);
    
    // Extract float from style
    const floatMatch = existingStyle.match(/float\s*:\s*([^;]+)/i);
    
    // Build new style array
    const newStyles: string[] = [];
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
    const cleanAttributes = attributes
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
  
    // Clean up excessive line breaks (3+ becomes 1)
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

    // Transform HTML content to ensure email-friendly inline styles
    campaignData.html_content = transformHtmlForEmail(campaignData.html_content);

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


// Handle email unsubscribe requests
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const XANO_BASE_URL = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { token } = event.queryStringParameters || {};
  
  if (!token) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invalid Unsubscribe Link</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background: #f9fafb; }
            .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; margin-bottom: 16px; }
            p { color: #6b7280; line-height: 1.6; margin-bottom: 24px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Invalid Unsubscribe Link</h1>
            <p>This unsubscribe link is invalid or has expired. Please use the unsubscribe link from a recent email.</p>
            <a href="/" class="button">Return to Homepage</a>
          </div>
        </body>
        </html>
      `
    };
  }

  try {
    // Decode token (base64 encoded email)
    let email: string;
    try {
      email = Buffer.from(token, 'base64').toString('utf-8');
      
      // Validate email format
      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }
    } catch (decodeError) {
      throw new Error('Invalid token format');
    }
    
    // Call Xano unsubscribe endpoint
    const response = await fetch(`${XANO_BASE_URL}/email/unsubscribe?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        body: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unsubscribed Successfully</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background: #f9fafb; }
              .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #059669; margin-bottom: 16px; }
              .checkmark { font-size: 48px; color: #059669; margin-bottom: 16px; }
              p { color: #6b7280; line-height: 1.6; margin-bottom: 16px; }
              .email { background: #f3f4f6; padding: 8px 16px; border-radius: 6px; font-family: monospace; color: #374151; display: inline-block; margin: 16px 0; }
              .button { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
              .button:hover { background: #1d4ed8; }
              .link { color: #2563eb; text-decoration: none; font-weight: 500; }
              .link:hover { text-decoration: underline; }
              .info-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; text-align: left; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="checkmark">✓</div>
              <h1>You've Been Unsubscribed</h1>
              <p>We're sorry to see you go. The following email address has been removed from our mailing list:</p>
              <div class="email">${email}</div>
              <p>You will no longer receive marketing emails from us.</p>
              
              <div class="info-box">
                <p style="margin: 0; color: #1e40af;"><strong>Changed your mind?</strong></p>
                <p style="margin: 8px 0 0 0; color: #374151;">If this was a mistake, you can <a href="/resubscribe?email=${encodeURIComponent(email)}" class="link">resubscribe here</a>.</p>
              </div>
              
              <a href="/" class="button">Return to Homepage</a>
              
              <p style="margin-top: 32px; font-size: 14px; color: #9ca3af;">
                Note: You may still receive transactional emails related to your account or purchases.
              </p>
            </div>
          </body>
          </html>
        `
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Xano unsubscribe error:', errorData);
      throw new Error('Failed to process unsubscribe request');
    }
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error Processing Unsubscribe</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background: #f9fafb; }
            .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; margin-bottom: 16px; }
            p { color: #6b7280; line-height: 1.6; margin-bottom: 24px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Error Processing Request</h1>
            <p>We encountered an error while processing your unsubscribe request. Please try again later or contact support.</p>
            <a href="/" class="button">Return to Homepage</a>
          </div>
        </body>
        </html>
      `
    };
  }
};

export { handler };


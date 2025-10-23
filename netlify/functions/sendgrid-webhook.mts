// Handle SendGrid event webhooks for bounce, unsubscribe, complaint tracking
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const XANO_BASE_URL = process.env.XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

interface SendGridEvent {
  email: string;
  event: string;
  timestamp: number;
  campaign_id?: string;
  recipient_id?: string;
  reason?: string;
  type?: string;
  status?: string;
  response?: string;
  url?: string;
  [key: string]: any;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const events: SendGridEvent[] = JSON.parse(event.body || '[]');
    
    if (!Array.isArray(events) || events.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid event data' })
      };
    }

    console.log(`Processing ${events.length} SendGrid events`);
    
    // Process events in batches to avoid timeout
    const batchSize = 50;
    let processedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      
      // Forward batch to Xano for processing
      try {
        const response = await fetch(`${XANO_BASE_URL}/email/webhook`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(batch)
        });
        
        if (response.ok) {
          processedCount += batch.length;
          console.log(`Processed batch ${i / batchSize + 1}: ${batch.length} events`);
        } else {
          const errorText = await response.text();
          console.error(`Xano webhook error for batch ${i / batchSize + 1}:`, errorText);
          errorCount += batch.length;
        }
      } catch (batchError) {
        console.error(`Error processing batch ${i / batchSize + 1}:`, batchError);
        errorCount += batch.length;
      }
    }
    
    // Always return 200 to SendGrid to prevent retries
    // (we've logged errors for investigation)
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        total: events.length,
        processed: processedCount,
        errors: errorCount
      })
    };
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Still return 200 to prevent SendGrid retries
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };


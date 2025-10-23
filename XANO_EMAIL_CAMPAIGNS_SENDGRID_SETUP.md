# Xano Email Campaigns & SendGrid Integration Setup Guide

## Overview

This guide sets up the complete Email Campaigns system with SendGrid integration for actually sending emails. This is the most complex part of the email marketing system.

## Prerequisites

- ✅ Contact Management backend set up
- ✅ Email Groups backend set up
- ✅ SendGrid account (free tier available)

---

## Part 1: SendGrid Setup

### 1.1 Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

### 1.2 Create API Key

1. Log in to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: `Social Engagement Hub`
5. Permissions: **Full Access** (or at minimum: Mail Send)
6. Click **Create & View**
7. **Copy the API key** (you won't see it again!)
8. Save it securely

### 1.3 Verify Sender Identity

SendGrid requires sender verification:

**Option A: Single Sender Verification** (Easiest)
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - From Name: Your name or company
   - From Email: your@email.com
   - Reply To: support@yourdomain.com (can be same as From)
   - Company Address
4. Click **Create**
5. Check your email and click verification link

**Option B: Domain Authentication** (Professional)
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow DNS setup instructions
4. Wait for DNS propagation (can take 24-48 hours)

### 1.4 Test SendGrid API

Test your API key works:

```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{
      "to": [{"email": "your@email.com"}]
    }],
    "from": {"email": "verified@sender.com"},
    "subject": "Test Email",
    "content": [{
      "type": "text/plain",
      "value": "This is a test email from SendGrid"
    }]
  }'
```

You should receive a test email.

---

## Part 2: Xano Database Setup

### 2.1 Create `email_campaigns` Table

**Table Name:** `email_campaigns`

**Fields:**

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `id` | integer | Auto-increment, Primary Key | Campaign ID |
| `name` | text | Required | Campaign name |
| `subject` | text | Required | Email subject line |
| `from_name` | text | Required | Sender name |
| `from_email` | text | Required | Sender email |
| `reply_to` | text | Optional | Reply-to email |
| `html_content` | text (long) | Optional | HTML email content |
| `plain_text_content` | text (long) | Optional | Plain text version |
| `status` | text | Default: "draft" | Campaign status |
| `type` | text | Default: "newsletter" | Campaign type |
| `recipients_count` | integer | Default: 0 | Total recipients |
| `sent_count` | integer | Default: 0 | Successfully sent |
| `opened_count` | integer | Default: 0 | Emails opened |
| `clicked_count` | integer | Default: 0 | Links clicked |
| `bounced_count` | integer | Default: 0 | Bounced emails |
| `scheduled_for` | timestamp | Optional | Scheduled send time |
| `sent_at` | timestamp | Optional | Actual send time |
| `created_by` | integer | Optional | Creator user ID |
| `created_at` | timestamp | Auto-set on create | Creation date |
| `updated_at` | timestamp | Auto-update | Last update date |

**Field Details:**

1. **status** (text)
   - Default: `draft`
   - Valid values: `draft`, `scheduled`, `sending`, `sent`, `failed`, `cancelled`

2. **type** (text)
   - Default: `newsletter`
   - Valid values: `newsletter`, `announcement`, `promotion`, `transactional`

3. **html_content** (text - long)
   - Use "Long Text" type in Xano
   - Stores full HTML email

4. **plain_text_content** (text - long)
   - Use "Long Text" type
   - Fallback for email clients that don't support HTML

---

### 2.2 Create `email_campaign_recipients` Table

**Table Name:** `email_campaign_recipients`

**Fields:**

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `id` | integer | Auto-increment, Primary Key | Recipient ID |
| `campaign_id` | integer | Required | Foreign key to campaigns |
| `contact_id` | integer | Required | Foreign key to contacts |
| `email` | text | Required | Recipient email |
| `status` | text | Default: "pending" | Send status |
| `sendgrid_message_id` | text | Optional | SendGrid message ID |
| `sent_at` | timestamp | Optional | When sent |
| `opened_at` | timestamp | Optional | First open time |
| `clicked_at` | timestamp | Optional | First click time |
| `bounced_at` | timestamp | Optional | Bounce time |
| `bounce_reason` | text | Optional | Bounce error message |
| `open_count` | integer | Default: 0 | Total opens |
| `click_count` | integer | Default: 0 | Total clicks |
| `tracking_token` | text | Unique | Unique tracking token |
| `created_at` | timestamp | Auto-set on create | Creation date |

**Field Details:**

1. **status** (text)
   - Default: `pending`
   - Valid values: `pending`, `sent`, `opened`, `clicked`, `bounced`, `failed`

2. **tracking_token** (text)
   - Check "Unique"
   - Generated UUID for tracking opens/clicks

**Add Indexes:**
- `campaign_id`
- `contact_id`
- `tracking_token`
- `status`

---

### 2.3 Create `email_templates` Table (Optional but Recommended)

**Table Name:** `email_templates`

**Fields:**

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `id` | integer | Auto-increment, Primary Key | Template ID |
| `name` | text | Required | Template name |
| `subject` | text | Optional | Default subject |
| `html_content` | text (long) | Required | HTML template |
| `plain_text_content` | text (long) | Optional | Plain text version |
| `thumbnail_url` | text | Optional | Preview image |
| `category` | text | Optional | Template category |
| `is_system` | boolean | Default: false | System template |
| `created_by` | integer | Optional | Creator user ID |
| `created_at` | timestamp | Auto-set on create | Creation date |
| `updated_at` | timestamp | Auto-update | Last update date |

---

## Part 3: Xano API Endpoints

### 3.1 Get All Campaigns

**Endpoint:** `GET /email_campaigns`

**Query Parameters:**
- `status` (text, optional)
- `type` (text, optional)
- `search` (text, optional)

**Function Stack:**

1. **Query all records** from `email_campaigns`
   - Apply filters if provided
   - Order by: `created_at DESC`

2. **Response**
   ```json
   {
     "success": true,
     "campaigns": [array_of_campaigns]
   }
   ```

---

### 3.2 Create Campaign

**Endpoint:** `POST /email_campaigns`

**Body Parameters:**
- `name` (text, required)
- `subject` (text, required)
- `from_name` (text, required)
- `from_email` (text, required)
- `reply_to` (text, optional)
- `html_content` (text, required)
- `plain_text_content` (text, optional)
- `type` (text, optional)

**Function Stack:**

1. **Validate inputs**
   - Check required fields
   - Validate email formats

2. **Add Record** to `email_campaigns`
   - Set `status = 'draft'`
   - Map all fields

3. **Response**
   ```json
   {
     "success": true,
     "campaign": {created_campaign}
   }
   ```

---

### 3.3 Get Single Campaign

**Endpoint:** `GET /email_campaigns/{campaign_id}`

**Function Stack:**

1. **Query campaign**
   - Get from `email_campaigns` where `id = $campaign_id`

2. **Get statistics**
   - Count recipients from `email_campaign_recipients` where `campaign_id = $campaign_id`
   - Group by status

3. **Response**
   ```json
   {
     "success": true,
     "campaign": {campaign_with_stats}
   }
   ```

---

### 3.4 Update Campaign

**Endpoint:** `PATCH /email_campaigns/{campaign_id}`

**Body Parameters:** (all optional)
- `name`, `subject`, `from_name`, `from_email`, `reply_to`
- `html_content`, `plain_text_content`, `type`, `status`

**Function Stack:**

1. **Get existing campaign**
   - If not found: Return 404

2. **Check if editable**
   - If `status = 'sent'`: Return error "Cannot edit sent campaign"

3. **Update Record**
   - Update only provided fields

4. **Response**
   ```json
   {
     "success": true,
     "campaign": {updated_campaign}
   }
   ```

---

### 3.5 Delete Campaign

**Endpoint:** `DELETE /email_campaigns/{campaign_id}`

**Function Stack:**

1. **Get campaign**
   - If not found: Return 404

2. **Check if deletable**
   - If `status = 'sending'`: Return error "Cannot delete campaign in progress"

3. **Delete recipients**
   - Delete from `email_campaign_recipients` where `campaign_id = $campaign_id`

4. **Delete campaign**
   - Delete from `email_campaigns` where `id = $campaign_id`

5. **Response**
   ```json
   {
     "success": true,
     "message": "Campaign deleted"
   }
   ```

---

### 3.6 Send Campaign (Most Complex Endpoint)

**Endpoint:** `POST /email_campaigns/{campaign_id}/send`

**Body Parameters:**
- `group_ids` (json array of integers, optional) - Specific groups to send to
- `contact_ids` (json array of integers, optional) - Specific contacts
- `send_to_all` (boolean, optional) - Send to all subscribed contacts
- `schedule_for` (timestamp, optional) - Schedule for later

**Function Stack:**

1. **Get campaign**
   - Query `email_campaigns` where `id = $campaign_id`
   - If not found: Return 404
   - If `status != 'draft'`: Return error "Campaign already sent or in progress"

2. **Get recipients**
   - If `send_to_all = true`:
     - Get all contacts from `email_contacts` where `status = 'subscribed'`
   - If `group_ids` provided:
     - Get contacts from `email_group_contacts` where `group_id IN $group_ids`
     - Join with `email_contacts` where `status = 'subscribed'`
   - If `contact_ids` provided:
     - Get contacts from `email_contacts` where `id IN $contact_ids` AND `status = 'subscribed'`

3. **Create recipient records**
   - For each recipient:
     - Generate unique `tracking_token` (UUID)
     - Add record to `email_campaign_recipients`
     - Set `status = 'pending'`

4. **Update campaign**
   - Set `recipients_count = count_of_recipients`
   - If `schedule_for` provided:
     - Set `status = 'scheduled'`
     - Set `scheduled_for = $schedule_for`
   - Else:
     - Set `status = 'sending'`

5. **If sending immediately (not scheduled):**
   - Call external function `send_campaign_emails` (see below)

6. **Response**
   ```json
   {
     "success": true,
     "campaign_id": {campaign_id},
     "recipients_count": {count},
     "status": "sending" or "scheduled"
   }
   ```

---

### 3.7 Send Campaign Emails (External Function or Separate Endpoint)

This function actually sends emails via SendGrid. Due to Xano limitations, you may need to implement this as a Netlify function instead.

**Netlify Function:** `netlify/functions/send-campaign-emails.js`

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  const { campaign_id } = JSON.parse(event.body);
  
  // Get campaign from Xano
  const campaign = await fetch(`${XANO_URL}/email_campaigns/${campaign_id}`);
  const campaignData = await campaign.json();
  
  // Get pending recipients from Xano
  const recipients = await fetch(
    `${XANO_URL}/email_campaign_recipients?campaign_id=${campaign_id}&status=pending`
  );
  const recipientsData = await recipients.json();
  
  // Send emails in batches (SendGrid limit: 1000 per request)
  const batchSize = 100;
  for (let i = 0; i < recipientsData.length; i += batchSize) {
    const batch = recipientsData.slice(i, i + batchSize);
    
    const messages = batch.map(recipient => ({
      to: recipient.email,
      from: {
        email: campaignData.from_email,
        name: campaignData.from_name
      },
      replyTo: campaignData.reply_to,
      subject: campaignData.subject,
      html: injectTrackingPixel(campaignData.html_content, recipient.tracking_token),
      text: campaignData.plain_text_content,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      },
      customArgs: {
        campaign_id: campaign_id.toString(),
        recipient_id: recipient.id.toString(),
        tracking_token: recipient.tracking_token
      }
    }));
    
    try {
      await sgMail.send(messages);
      
      // Update recipients status in Xano
      for (const recipient of batch) {
        await fetch(`${XANO_URL}/email_campaign_recipients/${recipient.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
        });
      }
    } catch (error) {
      console.error('SendGrid error:', error);
      // Mark as failed
      for (const recipient of batch) {
        await fetch(`${XANO_URL}/email_campaign_recipients/${recipient.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'failed',
            bounce_reason: error.message
          })
        });
      }
    }
  }
  
  // Update campaign status
  await fetch(`${XANO_URL}/email_campaigns/${campaign_id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_count: recipientsData.length
    })
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, sent: recipientsData.length })
  };
};

function injectTrackingPixel(html, token) {
  const trackingPixel = `<img src="${process.env.APP_URL}/api/track/open/${token}" width="1" height="1" alt="" />`;
  return html.replace('</body>', `${trackingPixel}</body>`);
}
```

---

### 3.8 Track Email Open

**Endpoint:** `GET /track/open/{tracking_token}`

**Function Stack:**

1. **Get recipient**
   - Query `email_campaign_recipients` where `tracking_token = $tracking_token`
   - If not found: Return 404

2. **Update recipient**
   - If `opened_at` is null: Set `opened_at = NOW()`
   - Increment `open_count`
   - Set `status = 'opened'` (if currently 'sent')

3. **Update campaign stats**
   - Increment `opened_count` in `email_campaigns`

4. **Return tracking pixel**
   - Return 1x1 transparent GIF image
   - Content-Type: image/gif

---

### 3.9 Track Email Click

**Endpoint:** `GET /track/click/{tracking_token}`

**Query Parameter:**
- `url` (text, required) - Original destination URL

**Function Stack:**

1. **Get recipient**
   - Query `email_campaign_recipients` where `tracking_token = $tracking_token`

2. **Update recipient**
   - If `clicked_at` is null: Set `clicked_at = NOW()`
   - Increment `click_count`
   - Set `status = 'clicked'`

3. **Update campaign stats**
   - Increment `clicked_count` in `email_campaigns`

4. **Redirect**
   - Redirect to `$url`

---

### 3.10 Get Campaign Analytics

**Endpoint:** `GET /email_campaigns/{campaign_id}/analytics`

**Function Stack:**

1. **Get campaign**
   - Query `email_campaigns` where `id = $campaign_id`

2. **Get recipient statistics**
   - Count by status from `email_campaign_recipients`
   - Calculate rates:
     - Open rate = (opened_count / sent_count) * 100
     - Click rate = (clicked_count / sent_count) * 100
     - Bounce rate = (bounced_count / sent_count) * 100

3. **Get timeline data**
   - Group opens by hour/day
   - Group clicks by hour/day

4. **Response**
   ```json
   {
     "success": true,
     "analytics": {
       "recipients": 1000,
       "sent": 995,
       "opened": 450,
       "clicked": 89,
       "bounced": 5,
       "open_rate": 45.2,
       "click_rate": 8.9,
       "bounce_rate": 0.5,
       "timeline": {
         "opens": [...],
         "clicks": [...]
       }
     }
   }
   ```

---

## Part 4: Frontend Integration

### 4.1 Update Environment Variables

Add to `.env`:

```env
REACT_APP_SENDGRID_API_KEY=your_sendgrid_api_key
REACT_APP_VERIFIED_SENDER_EMAIL=verified@sender.com
REACT_APP_VERIFIED_SENDER_NAME=Your Name
```

### 4.2 Create SendGrid Service

**File:** `src/services/email/sendgridService.js`

```javascript
const SENDGRID_API_KEY = process.env.REACT_APP_SENDGRID_API_KEY;
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3';

export const sendEmail = async (to, subject, htmlContent, plainText) => {
  try {
    const response = await fetch(`${SENDGRID_API_URL}/mail/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }]
        }],
        from: {
          email: process.env.REACT_APP_VERIFIED_SENDER_EMAIL,
          name: process.env.REACT_APP_VERIFIED_SENDER_NAME
        },
        subject: subject,
        content: [
          { type: 'text/html', value: htmlContent },
          { type: 'text/plain', value: plainText }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Send email error:', error);
    return { success: false, error: error.message };
  }
};
```

### 4.3 Update Campaign Service

The `emailCampaignService.js` already exists. Just ensure it points to your Xano endpoints.

---

## Part 5: Testing

### 5.1 Test Campaign Creation

1. Go to Email → Campaigns
2. Click "Create Campaign"
3. Fill in:
   - Name: "Test Newsletter"
   - Subject: "Welcome to our newsletter!"
   - From Name: Your verified sender name
   - From Email: Your verified sender email
4. Add content blocks
5. Save as draft

### 5.2 Test Sending

1. Create a test group with 1-2 contacts (your own emails)
2. Open the test campaign
3. Click "Send Campaign"
4. Select the test group
5. Click "Send Now"
6. Check your email inbox

### 5.3 Test Tracking

1. Open the email you received
2. Check Xano `email_campaign_recipients` table
3. Verify `opened_at` is set
4. Click a link in the email
5. Verify `clicked_at` is set

---

## Part 6: Troubleshooting

### Issue: SendGrid API authentication failed

**Solutions:**
1. Verify API key is correct
2. Check API key has "Mail Send" permission
3. Ensure no extra spaces in API key

### Issue: Sender email not verified

**Solution:**
- Complete Single Sender Verification in SendGrid
- Or set up Domain Authentication

### Issue: Emails going to spam

**Solutions:**
1. Complete Domain Authentication
2. Add SPF and DKIM records
3. Warm up your sending reputation (start small)
4. Avoid spam trigger words
5. Include unsubscribe link

### Issue: Rate limiting

**Solution:**
- SendGrid free tier: 100 emails/day
- Upgrade to paid plan for more volume
- Implement queue system for large campaigns

---

## API Endpoint Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/email_campaigns` | List campaigns |
| POST | `/email_campaigns` | Create campaign |
| GET | `/email_campaigns/{id}` | Get campaign |
| PATCH | `/email_campaigns/{id}` | Update campaign |
| DELETE | `/email_campaigns/{id}` | Delete campaign |
| POST | `/email_campaigns/{id}/send` | Send campaign |
| GET | `/email_campaigns/{id}/analytics` | Get analytics |
| GET | `/track/open/{token}` | Track email open |
| GET | `/track/click/{token}` | Track link click |

---

## Next Steps

1. ✅ Set up SendGrid account
2. ✅ Create Xano tables
3. ✅ Create Xano endpoints
4. ✅ Create Netlify send function
5. ✅ Test with small group
6. ➡️ **Move to Rich Formatting Enhancement**
7. Scale up gradually

---

## Estimated Setup Time

- **SendGrid setup:** 15-20 minutes
- **Xano tables:** 15-20 minutes
- **Xano endpoints:** 2-3 hours
- **Netlify function:** 30-45 minutes
- **Testing:** 30 minutes
- **Total:** ~4-5 hours

---

**Email Campaigns are now fully functional!** You can create, send, and track email campaigns. Next, we'll enhance the rich formatting capabilities to make your emails look even better.


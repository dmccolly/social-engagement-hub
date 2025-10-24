# Fix SendGrid Integration in Xano

## Current Issue
Your Xano send endpoint is configured but it's calling a placeholder URL (`api.example.com`) instead of the actual SendGrid API.

## What You Need to Fix

### Step 1: Open the Send Campaign Endpoint in Xano
1. Go to: https://xajo-bs7d-cagt.n7e.xano.io
2. Navigate to **API** → **EmailMarketing** group
3. Click on: **POST /email_campaigns/{id}/send**

### Step 2: Find the External API Request Function
1. Look through your function stack
2. Find the function that makes an external HTTP request
3. It's probably labeled "External API Request" or "Make HTTP Request"
4. Click on it to edit

### Step 3: Update the External Request Configuration

**Current (Wrong) Configuration:**
- URL: `https://api.example.com/email_campaigns/123/send`

**Correct Configuration:**

**URL:**
```
https://api.sendgrid.com/v3/mail/send
```

**Method:**
```
POST
```

**Headers:**
Click "+ Add Header" for each:

1. **Authorization Header:**
   - Name: `Authorization`
   - Value: `Bearer {{env.SENDGRID_API_KEY}}`
   - (Use variable picker to select env.SENDGRID_API_KEY)

2. **Content-Type Header:**
   - Name: `Content-Type`
   - Value: `application/json`

**Body:**
This is the most important part. You need to send data in SendGrid's format:

```json
{
  "personalizations": [
    {
      "to": [
        {
          "email": "{{recipient.email}}"
        }
      ],
      "subject": "{{campaign.subject}}"
    }
  ],
  "from": {
    "email": "{{env.SENDGRID_FROM_EMAIL}}",
    "name": "{{campaign.from_name}}"
  },
  "content": [
    {
      "type": "text/html",
      "value": "{{campaign.html_content}}"
    }
  ]
}
```

**Important Notes:**
- Replace `{{recipient.email}}` with the actual recipient variable from your function stack
- Replace `{{campaign.subject}}` with the campaign variable
- Replace `{{campaign.from_name}}` with the campaign variable
- Replace `{{campaign.html_content}}` with the campaign variable
- Use the variable picker to insert these values

### Step 4: Handle Multiple Recipients (Advanced)

The above configuration sends to ONE recipient. To send to multiple recipients, you need to:

**Option A: Loop Through Recipients (Recommended)**
1. Before the External API Request, add a "For Each" or "Loop" function
2. Loop through the `recipients` array
3. Inside the loop, add the External API Request
4. This sends one email per recipient

**Option B: Batch Send (More Complex)**
1. Build a personalizations array with all recipients
2. Send one request to SendGrid with multiple recipients
3. This is more efficient but harder to implement

### Step 5: Test the Endpoint

1. Click **"Save"** after making changes
2. Click **"Run & Debug"**
3. Enter test data:
   - Path parameter `id`: Use a real campaign ID from your database
   - Body: `{"test_mode": true}`
4. Click **"Run"**
5. Check the response - should show SendGrid's success response

### Step 6: Check SendGrid Activity

1. Go to SendGrid dashboard: https://app.sendgrid.com
2. Navigate to **Activity**
3. Look for recent email sends
4. Verify emails were sent successfully

---

## Quick Fix: Simplified Version

If the above is too complex, here's a simpler approach that sends to ONE test email:

### Simplified External Request Body:
```json
{
  "personalizations": [
    {
      "to": [{"email": "your-test-email@example.com"}],
      "subject": "Test Campaign"
    }
  ],
  "from": {
    "email": "{{env.SENDGRID_FROM_EMAIL}}",
    "name": "Test Sender"
  },
  "content": [
    {
      "type": "text/html",
      "value": "<h1>Test Email</h1><p>This is a test email from Xano.</p>"
    }
  ]
}
```

Replace `your-test-email@example.com` with your actual email address.

This will send a simple test email to verify SendGrid is working.

---

## Troubleshooting

### Error: "Invalid API Key"
**Solution:** Check that `SENDGRID_API_KEY` environment variable is set correctly in Xano Settings → Environment Variables

### Error: "From email not verified"
**Solution:** Go to SendGrid → Settings → Sender Authentication and verify your from email address

### Error: "Could not resolve host"
**Solution:** Make sure the URL is exactly `https://api.sendgrid.com/v3/mail/send` (no typos)

### No error but email doesn't arrive
**Solution:** 
1. Check SendGrid Activity log
2. Check spam folder
3. Verify recipient email is valid
4. Check SendGrid isn't in sandbox mode

---

## Alternative: Use Netlify Functions

If this is still too complex, I can implement email sending using Netlify Functions instead:

**Advantages:**
- ✅ No need to configure external requests in Xano
- ✅ Easier to debug
- ✅ Better error handling
- ✅ Can send to multiple recipients easily
- ✅ 5 minutes to implement

Just say "Use Netlify Functions" and I'll set it up!

---

## Current Status

✅ GET /email_campaigns - Working (returns empty array)
⚠️ POST /email_campaigns/{id}/send - Exists but calling wrong URL
❌ Email sending - Not working until SendGrid URL is fixed

**Next Step:** Update the external request URL in Xano to point to SendGrid API.